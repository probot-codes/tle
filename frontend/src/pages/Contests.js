import React, { useState, useEffect } from 'react';
import axios from '../api';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Badge,
  Flex,
  Button,
  Stack,
  Select,
  HStack,
  Icon,
  VStack,
  Link,
  Spinner,
  useToast,
  Checkbox,
  CheckboxGroup,
} from '@chakra-ui/react';
import { format, formatDistance } from 'date-fns';
import { FaExternalLinkAlt, FaBookmark, FaRegBookmark, FaInfoCircle, FaLock } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as bookmarkService from '../services/bookmarkService';

function Contests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarkedContests, setBookmarkedContests] = useState([]);
  
  // Filter states
  const [selectedPlatforms, setSelectedPlatforms] = useState(['Codeforces', 'CodeChef', 'LeetCode']);
  const [timeFilter, setTimeFilter] = useState('upcoming');
  const [showPastContests, setShowPastContests] = useState(false);
  
  const toast = useToast();
  const { currentUser, loading: authLoading } = useAuth();

  useEffect(() => {
    fetchContests();
    
    // If user is logged in, fetch their bookmarks from API
    if (currentUser) {
      fetchBookmarks();
    } else {
      // If not logged in, try to get from localStorage for backward compatibility
      const savedBookmarks = localStorage.getItem('bookmarkedContests');
      if (savedBookmarks) {
        setBookmarkedContests(JSON.parse(savedBookmarks));
      }
    }
  }, [currentUser]);
  
  // We'll move this useEffect after filteredContests is defined

  const fetchContests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/contests/all');
      
      // Generate slugs for contests if they don't exist
      const processedContests = response.data.map((contest, index) => {
        if (!contest.slug) {
          let slug = '';
          
          if (contest.platform === 'Codeforces') {
            // For Codeforces
            if (contest.name) {
              const roundMatch = contest.name.match(/Round\s+(\d+)/i);
              const divMatch = contest.name.match(/Div\.?\s*(\d+)/i);
              
              if (roundMatch) {
                slug = `round${roundMatch[1]}`;
                if (divMatch) {
                  slug += `-div${divMatch[1]}`;
                }
              } else if (contest.name.includes('Educational')) {
                const eduMatch = contest.name.match(/Educational.*?(\d+)/i);
                if (eduMatch) {
                  slug = `educational${eduMatch[1]}`;
                } else {
                  slug = 'educational';
                }
              } else {
                slug = contest.name.toLowerCase()
                  .replace(/[^\w\s-]/g, '')
                  .replace(/\s+/g, '-')
                  .substring(0, 30);
              }
            }
            
            if (!slug) {
              slug = `cf-${contest.id || index}`;
            }
          } else if (contest.platform === 'LeetCode') {
            // For LeetCode
            const weeklyMatch = contest.name?.match(/weekly\s+contest\s+(\d+)/i);
            const biweeklyMatch = contest.name?.match(/biweekly\s+contest\s+(\d+)/i);
            
            if (weeklyMatch) {
              slug = `weekly${weeklyMatch[1]}`;
            } else if (biweeklyMatch) {
              slug = `biweekly${biweeklyMatch[1]}`;
            } else {
              slug = `leetcode-${index}`;
            }
          } else if (contest.platform === 'CodeChef') {
            // For CodeChef (fallback - they should already have slugs)
            const startersMatch = contest.name?.match(/starters\s+(\d+)/i);
            
            if (startersMatch) {
              slug = `starters${startersMatch[1]}`;
            } else {
              slug = `codechef-${index}`;
            }
          } else {
            // Default 
            slug = `contest-${index}`;
          }
          
          return { ...contest, slug };
        }
        return contest;
      });
      
      setContests(processedContests);
      setError(null);
    } catch (err) {
      setError('Failed to fetch contests. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to fetch contests. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's bookmarked contests from API
  const fetchBookmarks = async () => {
    try {
      if (!currentUser) return;
      
      const bookmarks = await bookmarkService.getBookmarkedContests();
      console.log('Loaded bookmarked contests:', bookmarks);
      
      // Just store the actual bookmarked contests
      setBookmarkedContests(bookmarks);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your bookmarked contests',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Toggle bookmark status for a contest
  const toggleBookmark = async (contestId) => {
    // If user is not logged in, show login prompt
    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to bookmark contests',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Get the full contest object
      const contest = contests.find((c, index) => index === contestId);
      if (!contest) return;
      
      console.log('Toggling bookmark for contest:', contest);

      // Make sure the contest has a contestId property for the API
      const contestToToggle = {
        ...contest,
        contestId: String(contestId) // Always use the array index for consistency
      };
      
      // Call the service to toggle bookmark
      const result = await bookmarkService.toggleBookmark(contestToToggle);
      
      // After toggle, refresh the bookmarks list
      await fetchBookmarks();
      
      // Show appropriate toast notification based on the result
      if (result && result.action === 'added') {
        toast({
          title: 'Contest Bookmarked',
          description: 'Contest added to your bookmarks',
          status: 'success',
          duration: 2000,
        });
      } else {
        toast({
          title: 'Contest Removed',
          description: 'Contest removed from bookmarks',
          status: 'info',
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: 'Error',
        description: 'Failed to update bookmark status',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handlePlatformChange = (platforms) => {
    setSelectedPlatforms(platforms);
  };

  const handleTimeFilterChange = (e) => {
    setTimeFilter(e.target.value);
  };

  const getFilteredContests = () => {
    let filtered = contests.filter(contest => selectedPlatforms.includes(contest.platform));
    
    const now = new Date();
    
    // Log raw contest data before filtering
    console.log('Filtering contests, showing past:', showPastContests);
    console.log('Contests before filtering:', filtered.map(c => ({
      name: c.name,
      platform: c.platform,
      status: c.status,
      date: new Date(c.date)
    })));
    
    // First filter by past or upcoming based on contest status or date
    if (!showPastContests) {
      filtered = filtered.filter(contest => {
        // First check if the contest has a status property
        if (contest.status) {
          return contest.status === 'UPCOMING' || contest.status === 'ONGOING';
        }
        // Otherwise check by date
        const contestDate = new Date(contest.date);
        return contestDate >= now;
      });
    } else {
      filtered = filtered.filter(contest => {
        // First check if the contest has a status property
        if (contest.status) {
          return contest.status === 'FINISHED';
        }
        // Otherwise check by date
        const contestDate = new Date(contest.date);
        return contestDate < now;
      });
    }
    
    // Then apply time range filter for upcoming contests
    if (!showPastContests) {
      if (timeFilter === 'today') {
        filtered = filtered.filter(contest => {
          const contestDate = new Date(contest.date);
          return contestDate.toDateString() === now.toDateString();
        });
      } else if (timeFilter === 'week') {
        const weekLater = new Date();
        weekLater.setDate(weekLater.getDate() + 7);
        
        filtered = filtered.filter(contest => {
          const contestDate = new Date(contest.date);
          return contestDate >= now && contestDate <= weekLater;
        });
      } else if (timeFilter === 'month') {
        const monthLater = new Date();
        monthLater.setMonth(monthLater.getMonth() + 1);
        
        filtered = filtered.filter(contest => {
          const contestDate = new Date(contest.date);
          return contestDate >= now && contestDate <= monthLater;
        });
      }
    }
    
    return filtered;
  };

  const filteredContests = getFilteredContests();
  
  // Add logging for debugging
  useEffect(() => {
    if (contests.length > 0) {
      console.log('All contests:', contests);
      console.log('Filtered contests:', filteredContests);
      console.log('Show past contests:', showPastContests);
    }
  }, [contests, filteredContests, showPastContests]);

  // Helper function to check if a contest is bookmarked
  const isContestBookmarked = (contest, index) => {
    if (!bookmarkedContests || !bookmarkedContests.length || !currentUser) {
      return false;
    }

    // Search through the bookmarked contests for a match on contest ID or index
    for (const bookmark of bookmarkedContests) {
      // Try to match on contest ID if available
      if (contest.id && bookmark.contestId && contest.id.toString() === bookmark.contestId.toString()) {
        return true;
      }
      
      // Try to match on array index - this simpler approach should work for most cases
      if (bookmark.contestId && bookmark.contestId.toString() === index.toString()) {
        return true;
      }
    }
    
    return false;
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'Codeforces':
        return 'red';
      case 'CodeChef':
        return 'green';
      case 'LeetCode':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  return (
    <Container maxW="1200px" py={10}>
      <Box
        p={6}
        borderRadius="lg"
        bg="rgba(0, 0, 0, 0.6)"
        backdropFilter="blur(10px)"
        borderWidth="1px"
        borderColor="whiteAlpha.200"
        boxShadow="xl"
        mb={10}
      >
        <Heading as="h1" size="xl" mb={6} color="white">
          {showPastContests ? 'Past Coding Contests' : 'Upcoming Coding Contests'}
        </Heading>

        {/* Filters */}
        <Stack spacing={4} direction={{ base: 'column', md: 'row' }} mb={8}>
          <Box flex="1">
            <Text fontWeight="semibold" mb={2} color="white">
              Filter by Platform
            </Text>
            <CheckboxGroup
              colorScheme="blue"
              value={selectedPlatforms}
              onChange={handlePlatformChange}
            >
              <HStack spacing={4}>
                <Checkbox value="Codeforces" color="white">Codeforces</Checkbox>
                <Checkbox value="CodeChef" color="white">CodeChef</Checkbox>
                <Checkbox value="LeetCode" color="white">LeetCode</Checkbox>
              </HStack>
            </CheckboxGroup>
          </Box>
          <Box>
            <Text fontWeight="semibold" mb={2} color="white">
              Time Range
            </Text>
            <Stack direction="row" spacing={4}>
              <Select
                value={timeFilter}
                onChange={handleTimeFilterChange}
                bg="whiteAlpha.200"
                borderColor="whiteAlpha.300"
                color="white"
                _hover={{ borderColor: 'blue.500' }}
                isDisabled={showPastContests}
              >
                <option value="upcoming">All Upcoming</option>
                <option value="today">Today</option>
                <option value="week">Next 7 Days</option>
                <option value="month">Next 30 Days</option>
              </Select>
              <Checkbox 
                color="white" 
                isChecked={showPastContests}
                onChange={(e) => setShowPastContests(e.target.checked)}
              >
                Past Contests
              </Checkbox>
            </Stack>
          </Box>
        </Stack>

        {/* Contest List */}
        {loading ? (
          <Flex justify="center" align="center" h="200px">
            <Spinner size="xl" color="blue.500" thickness="4px" />
          </Flex>
        ) : error ? (
          <Text color="red.500" textAlign="center">
            {error}
          </Text>
        ) : filteredContests.length === 0 ? (
          <Text color="white" textAlign="center" py={10}>
            No contests found matching your filters. Try changing your selection.
          </Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredContests.map((contest, index) => (
              <Box
                key={index}
                p={5}
                borderRadius="md"
                bg="rgba(0, 10, 25, 0.8)"
                borderWidth="1px"
                borderColor="whiteAlpha.200"
                position="relative"
                boxShadow="lg"
                transition="all 0.3s"
                _hover={{
                  transform: 'translateY(-5px)',
                  boxShadow: 'xl',
                }}
              >
                <Flex justify="space-between" mb={2}>
                  <Badge
                    colorScheme={getPlatformColor(contest.platform)}
                    px={2}
                    py={1}
                    borderRadius="md"
                  >
                    {contest.platform}
                  </Badge>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      variant="ghost"
                      color="blue.400"
                      as={RouterLink}
                      to={`/contests/${index + 1}`}
                      aria-label="View details"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Icon as={FaInfoCircle} boxSize={4} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      color={isContestBookmarked(contest, index) ? 'yellow.400' : 'gray.400'}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(index);
                      }}
                      aria-label="Bookmark contest"
                    >
                      <Icon
                        as={isContestBookmarked(contest, index) 
                         ? FaBookmark 
                         : !currentUser ? FaLock : FaRegBookmark}
                        boxSize={4}
                      />
                    </Button>
                  </HStack>
                </Flex>

                <Heading as="h3" size="md" color="white" mb={3}>
                  <Link as={RouterLink} to={`/contests/${contest.platform}/${contest.slug || index}`} _hover={{ textDecoration: 'none', color: 'blue.300' }}>
                    {contest.name}
                  </Link>
                </Heading>

                <VStack align="start" spacing={2} mt={4} color="gray.300">
                  <Text fontWeight="bold" color="blue.300">
                    {format(new Date(contest.date), 'PPP')} at{' '}
                    {format(new Date(contest.date), 'p')}
                  </Text>
                  {!showPastContests ? (
                    <Text fontSize="sm">
                      Starts in {formatDistance(new Date(contest.date), new Date())}
                    </Text>
                  ) : (
                    <Text fontSize="sm" color="gray.400">
                      Ended {formatDistance(new Date(contest.date), new Date(), { addSuffix: true })}
                    </Text>
                  )}
                  <Text>Duration: {contest.duration}</Text>
                </VStack>

                <Button
                  as="a"
                  href={contest.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  mt={4}
                  colorScheme="blue"
                  size="sm"
                  rightIcon={<FaExternalLinkAlt />}
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(contest.link, '_blank');
                  }}
                >
                  {contest.platform === 'Codeforces' && contest.status === 'UPCOMING' ? 
                    'View all Codeforces contests' : 'Go to contest'}
                </Button>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Container>
  );
}

export default Contests;
