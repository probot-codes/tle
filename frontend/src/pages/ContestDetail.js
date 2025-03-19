import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api';
import {
  Box,
  Container,
  Heading,
  Text,
  Badge,
  Button,
  VStack,
  HStack,
  Icon,
  Spinner,
  Link,
  Divider,
  useToast,
  Tooltip,
  Flex,
  Grid,
  GridItem,
  Image,
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react';
import { format, formatDistance } from 'date-fns';
import { FaExternalLinkAlt, FaArrowLeft, FaClock, FaCalendarAlt, FaBookmark, FaRegBookmark, FaLock, FaYoutube } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import * as bookmarkService from '../services/bookmarkService';

function ContestDetail() {
  const { slug, platform } = useParams();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { currentUser } = useAuth();

  // Check if contest is bookmarked when contest or user changes
  useEffect(() => {
    if (contest && currentUser) {
      checkBookmarkStatus();
    }
  }, [contest, currentUser]);

  // Check if the current contest is bookmarked
  const checkBookmarkStatus = async () => {
    if (!contest || !currentUser) return;
    
    try {
      setBookmarkLoading(true);
      // Make sure we have a contestId to use for checking bookmarks
      if (!contest.contestId) {
        contest.contestId = contest.id; // Use id as fallback
      }
      const isBookmarked = await bookmarkService.checkBookmarkStatus(contest.contestId, contest.platform);
      setIsBookmarked(isBookmarked);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    } finally {
      setBookmarkLoading(false);
    }
  };

  // Toggle bookmark status
  const toggleBookmark = async () => {
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

    if (!contest) return;

    try {
      setBookmarkLoading(true);
      // Make sure we have a contestId to use for toggleBookmark
      if (!contest.contestId) {
        contest.contestId = contest.id; // Use id as fallback
      }
      await bookmarkService.toggleBookmark(contest);
      setIsBookmarked(!isBookmarked);
      
      toast({
        title: isBookmarked ? 'Contest Removed' : 'Contest Bookmarked',
        description: isBookmarked 
          ? 'Contest removed from bookmarks' 
          : 'Contest added to your bookmarks',
        status: isBookmarked ? 'info' : 'success',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: 'Error',
        description: 'Failed to update bookmark status',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setBookmarkLoading(false);
    }
  };

  useEffect(() => {
    const fetchContestDetails = async () => {
      try {
        setLoading(true);
        console.log(`Fetching contest details for platform: ${platform}, slug: ${slug}`);
        
        // Try direct API endpoint first (most efficient)
        try {
          const directResponse = await axios.get(`/api/contests/${platform.toLowerCase()}/${slug}`);
          if (directResponse.data) {
            console.log('Found contest via direct API call:', directResponse.data);
            const contestData = directResponse.data;
            
            // Check if we have solutions in the response
            if (!contestData.solutions) {
              console.log('No solutions found in direct API response, fetching separately...');
              try {
                // Try to fetch solutions for this contest
                const solutionsResponse = await axios.get(`/api/solutions/contest/name/${contestData.name}`);
                if (solutionsResponse.data && solutionsResponse.data.length > 0) {
                  contestData.solutions = solutionsResponse.data;
                  console.log(`Found ${solutionsResponse.data.length} solutions for this contest`);
                }
              } catch (solutionsError) {
                console.error('Error fetching solutions:', solutionsError);
              }
            } else {
              console.log(`Contest has ${contestData.solutions.length} solutions`);
            }
            
            setContest(contestData);
            return;
          }
        } catch (directError) {
          console.log('Direct API call failed, trying alternative methods');
        }
        
        // If direct API call fails, get all contests for the platform and search
        const platformResponse = await axios.get(`/api/contests/${platform.toLowerCase()}`);
        console.log(`Found ${platformResponse.data.length} ${platform} contests`);
        
        if (platformResponse.data && platformResponse.data.length > 0) {
          // First try to find by slug
          let foundContest = platformResponse.data.find(c => c.slug === slug);
          
          if (!foundContest) {
            // Try as an index (backward compatibility)
            const index = parseInt(slug);
            if (!isNaN(index) && index >= 0 && index < platformResponse.data.length) {
              foundContest = platformResponse.data[index];
              console.log(`Found contest at index ${index}:`, foundContest);
            }
          }
          
          if (!foundContest) {          
            // Try to find by contest id or name
            foundContest = platformResponse.data.find(c => 
              (c.id && c.id.toString() === slug) || 
              (c.name && c.name.toLowerCase().includes(slug.toLowerCase()))
            );
          }
          
          if (foundContest) {
            console.log('Found contest:', foundContest);
            
            // Try to fetch solutions for this contest
            try {
              const solutionsResponse = await axios.get(`/api/solutions/contest/name/${foundContest.name}`);
              if (solutionsResponse.data && solutionsResponse.data.length > 0) {
                foundContest.solutions = solutionsResponse.data;
                console.log(`Found ${solutionsResponse.data.length} solutions for this contest`);
              }
            } catch (solutionsError) {
              console.error('Error fetching solutions:', solutionsError);
            }
            
            setContest(foundContest);
          } else {
            setError(`Contest with slug/id ${slug} not found for platform ${platform}`);
          }
        } else {
          setError(`No contests found for platform ${platform}`);
        }
      } catch (err) {
        console.error('Error fetching contest details:', err);
        
        if (err.response) {
          console.error('Error response:', err.response.data);
          setError(`Failed to fetch contests: ${err.response.status} ${err.response.statusText}`);
        } else if (err.request) {
          setError('No response received from server. Please check if the backend is running.');
        } else {
          setError(`Error: ${err.message}`);
        }
        
        toast({
          title: 'Error',
          description: 'Failed to fetch contest details',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (platform && slug) {
      fetchContestDetails();
    } else {
      setError('Invalid contest information');
      setLoading(false);
    }
  }, [slug, platform, toast]);

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'Codeforces':
        return 'red';
      case 'CodeChef':
        return 'green';
      case 'LeetCode':
        return 'yellow';
      default:
        return 'blue';
    }
  };

  return (
    <Container maxW="container.lg" py={8}>
      <Button 
        leftIcon={<FaArrowLeft />} 
        variant="ghost" 
        mb={6} 
        onClick={() => navigate('/contests')}
      >
        Back to Contests
      </Button>

      {loading ? (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text mt={4}>Loading contest details...</Text>
        </Box>
      ) : error ? (
        <Box textAlign="center" py={10} color="red.500">
          <Heading size="md" mb={4}>Error</Heading>
          <Text>{error}</Text>
        </Box>
      ) : contest ? (
        <Box
          p={8}
          borderRadius="lg"
          bg={useColorModeValue('white', 'rgba(0, 10, 25, 0.8)')}
          borderWidth="1px"
          borderColor={useColorModeValue('gray.200', 'whiteAlpha.200')}
          boxShadow="xl"
        >
          <Flex justifyContent="space-between" alignItems="center" width="100%" mb={4}>
            <HStack spacing={4}>
              <Badge
                colorScheme={getPlatformColor(contest.platform)}
                px={3}
                py={1}
                borderRadius="md"
                fontSize="md"
              >
                {contest.platform}
              </Badge>
              <Badge
                colorScheme={contest.status === 'ONGOING' ? 'green' : contest.status === 'UPCOMING' ? 'blue' : 'gray'}
                px={3}
                py={1}
                borderRadius="md"
                fontSize="md"
              >
                {contest.status || (new Date(contest.date) > new Date() ? 'UPCOMING' : 'FINISHED')}
              </Badge>
            </HStack>
            
            <Tooltip label={currentUser ? 'Toggle bookmark' : 'Login to bookmark'}>
              <Button
                variant="ghost"
                size="md"
                colorScheme={isBookmarked ? 'yellow' : 'gray'}
                isLoading={bookmarkLoading}
                onClick={toggleBookmark}
                leftIcon={
                  <Icon 
                    as={isBookmarked ? FaBookmark : !currentUser ? FaLock : FaRegBookmark} 
                    boxSize={4} 
                  />
                }
              >
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </Button>
            </Tooltip>
          </Flex>

          <Heading size="xl" color={useColorModeValue('gray.800', 'white')} mb={6}>
            {contest.name}
          </Heading>

          <VStack align="start" spacing={4} mb={8} color={useColorModeValue('gray.600', 'gray.200')}>
            <HStack>
              <Icon as={FaCalendarAlt} color="blue.400" />
              <Text fontWeight="bold">
                {format(new Date(contest.date), 'PPP')} at {format(new Date(contest.date), 'p')}
              </Text>
            </HStack>
            
            <HStack>
              <Icon as={FaClock} color="blue.400" />
              <Text>Duration: {contest.duration}</Text>
            </HStack>

            {new Date(contest.date) > new Date() ? (
              <Text fontSize="md" color="blue.300">
                Starts in {formatDistance(new Date(contest.date), new Date())}
              </Text>
            ) : (
              <Text fontSize="md" color="gray.400">
                {contest.status === 'ONGOING' ? 'Started' : 'Ended'} {formatDistance(new Date(contest.date), new Date(), { addSuffix: true })}
              </Text>
            )}
          </VStack>

          <Divider my={6} borderColor="whiteAlpha.300" />

          {contest.link && (
            <Button
              as="a"
              href={contest.link}
              target="_blank"
              rel="noopener noreferrer"
              colorScheme="blue"
              rightIcon={<FaExternalLinkAlt />}
              size="lg"
              onClick={(e) => {
                e.preventDefault();
                window.open(contest.link, '_blank');
              }}
            >
              {contest.platform === 'Codeforces' && contest.status === 'UPCOMING' ? 
                'View all Codeforces contests' : 'Go to contest page'}
            </Button>
          )}
          
          {/* Solutions Section */}
          {contest.solutions && contest.solutions.length > 0 && (
            <Box mt={10}>
              <Flex align="center" mb={6}>
                <Icon as={FaYoutube} color="red.500" boxSize={6} mr={2} />
                <Heading size="lg" color={useColorModeValue('gray.800', 'white')}>
                  Video Solutions
                </Heading>
              </Flex>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {contest.solutions.map((solution) => (
                  <Box 
                    key={solution._id || solution.videoId}
                    borderWidth="1px"
                    borderRadius="lg"
                    overflow="hidden"
                    bg={useColorModeValue('white', 'gray.800')}
                    boxShadow="md"
                    transition="transform 0.2s"
                    _hover={{ transform: 'scale(1.02)' }}
                  >
                    <Link 
                      href={`https://www.youtube.com/watch?v=${solution.videoId}`}
                      isExternal
                    >
                      <Image 
                        src={solution.thumbnailUrl || `https://img.youtube.com/vi/${solution.videoId}/hqdefault.jpg`}
                        alt={solution.title}
                        width="100%"
                      />
                    </Link>
                    <Box p={4}>
                      <Heading as="h3" size="md" mb={2} noOfLines={2}>
                        <Link 
                          href={`https://www.youtube.com/watch?v=${solution.videoId}`}
                          isExternal
                          color={useColorModeValue('blue.600', 'blue.300')}
                        >
                          {solution.title}
                        </Link>
                      </Heading>
                      <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')}>
                        {solution.publishedAt ? new Date(solution.publishedAt).toLocaleDateString() : 'Unknown date'}
                      </Text>
                    </Box>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          )}
        </Box>
      ) : (
        <Box textAlign="center" py={10}>
          <Text color="white">Contest not found</Text>
        </Box>
      )}
    </Container>
  );
}

export default ContestDetail;
