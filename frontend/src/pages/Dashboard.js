import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  Badge,
  Link,
  Icon,
  Button,
  useToast,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { format, formatDistance } from 'date-fns';
import { FaExternalLinkAlt, FaBookmark, FaCalendarAlt, FaCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from '../api';
import { useAuth } from '../contexts/AuthContext';
import { getBookmarkedContests, removeBookmark } from '../services/bookmarkService';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upcomingContests, setUpcomingContests] = useState([]);
  const [bookmarkedContests, setBookmarkedContests] = useState([]);
  const [participatedContests, setParticipatedContests] = useState([]);
  const [stats, setStats] = useState({
    totalParticipated: 0,
    upcomingBookmarked: 0,
    favoriteWebsite: '',
  });
  
  const toast = useToast();
  const navigate = useNavigate();

  const { currentUser, token, loading: authLoading } = useAuth();

  useEffect(() => {
    // If auth state is loaded and no current user, redirect to login
    if (!authLoading && !currentUser) {
      navigate('/login');
      toast({
        title: 'Authentication required',
        description: 'Please log in to view your dashboard',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // If we have a current user, set it and fetch data
    if (currentUser) {
      setUser(currentUser);
      fetchData();
    }
  }, [currentUser, authLoading, navigate, toast]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all contests for the upcoming ones
      const contestsResponse = await axios.get('/api/contests/all');
      
      // Get current timestamp for filtering
      const now = new Date();
      
      // Filter for upcoming contests (within next 30 days)
      const upcoming = contestsResponse.data
        .filter(contest => {
          const contestDate = new Date(contest.date);
          const thirtyDaysLater = new Date();
          thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
          return contestDate > now && contestDate < thirtyDaysLater;
        })
        .slice(0, 5); // Get only 5 upcoming contests
      
      setUpcomingContests(upcoming);
      
      // Fetch bookmarked contests from the API
      try {
        const bookmarkedResponse = await getBookmarkedContests();
        setBookmarkedContests(bookmarkedResponse);
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
        setBookmarkedContests([]);
      }
      
      // In a real app, these would come from the backend
      // For now, we'll use mock data for participated contests
      setParticipatedContests([
        {
          id: '1',
          name: 'Codeforces Round #777 (Div. 2)',
          platform: 'Codeforces',
          date: '2025-02-24T17:35:00Z',
          rank: 734,
          totalParticipants: 29831,
          problemsSolved: 3,
          totalProblems: 6,
        },
        {
          id: '2',
          name: 'Weekly Contest 332',
          platform: 'LeetCode',
          date: '2025-02-17T15:00:00Z',
          rank: 2105,
          totalParticipants: 23456,
          problemsSolved: 2,
          totalProblems: 4,
        },
      ]);
      
      // Calculate stats
      const platformCounts = {};
      participatedContests.forEach(contest => {
        platformCounts[contest.platform] = (platformCounts[contest.platform] || 0) + 1;
      });
      
      let favoriteWebsite = '';
      let maxCount = 0;
      
      Object.entries(platformCounts).forEach(([platform, count]) => {
        if (count > maxCount) {
          maxCount = count;
          favoriteWebsite = platform;
        }
      });
      
      setStats({
        totalParticipated: participatedContests.length,
        upcomingBookmarked: bookmarkedResponse?.length || 0,
        favoriteWebsite,
      });
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
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

  const handleRemoveBookmark = async (contest) => {
    try {
      // Remove the bookmark
      await removeBookmark(contest.contestId, contest.platform);
      
      // Update the UI
      setBookmarkedContests(bookmarkedContests.filter(c => c.contestId !== contest.contestId));
      
      // Update stats
      setStats({
        ...stats,
        upcomingBookmarked: stats.upcomingBookmarked - 1,
      });
      
      toast({
        title: 'Bookmark removed',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove bookmark',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const renderContestCard = (contest, isBookmarked = false) => {
    const contestDate = new Date(contest.date);
    const timeFromNow = formatDistance(contestDate, new Date(), { addSuffix: true });
    
    return (
      <Box
        key={contest.link || contest.id}
        p={4}
        borderRadius="lg"
        bg="rgba(0, 0, 0, 0.6)"
        borderWidth="1px"
        borderColor="whiteAlpha.200"
        backdropFilter="blur(10px)"
        boxShadow="lg"
        transition="transform 0.2s"
        _hover={{
          transform: 'translateY(-4px)',
          boxShadow: 'xl',
        }}
      >
        <Flex justify="space-between" align="start" mb={2}>
          <Badge colorScheme={getPlatformColor(contest.platform)} mb={2}>
            {contest.platform}
          </Badge>
          
          {isBookmarked && (
            <Button
              size="xs"
              colorScheme="red"
              variant="ghost"
              onClick={() => handleRemoveBookmark(contest.link)}
            >
              Remove
            </Button>
          )}
        </Flex>
        
        <Heading as="h3" size="md" mb={2} color="white">
          {contest.name}
        </Heading>
        
        <Text color="gray.400" fontSize="sm" mb={4}>
          <Icon as={FaCalendarAlt} mr={1} />
          {format(contestDate, 'PPp')} ({timeFromNow})
        </Text>
        
        {contest.rank && (
          <HStack mt={2} mb={2}>
            <Text color="gray.300">Rank:</Text>
            <Text color="white" fontWeight="bold">
              {contest.rank}/{contest.totalParticipants}
            </Text>
          </HStack>
        )}
        
        {contest.problemsSolved && (
          <HStack mt={2}>
            <Text color="gray.300">Solved:</Text>
            <Text color="white" fontWeight="bold">
              {contest.problemsSolved}/{contest.totalProblems}
            </Text>
          </HStack>
        )}
        
        <Flex mt={4} justify="flex-end">
          <Link
            href={contest.link}
            isExternal
            color="blue.400"
            _hover={{ color: 'blue.300' }}
          >
            View Contest <Icon as={FaExternalLinkAlt} ml={1} boxSize={3} />
          </Link>
        </Flex>
      </Box>
    );
  };

  return (
    <Container maxW="container.xl" py={8}>
      {user && (
        <Box mb={8}>
          <Heading
            as="h1"
            size="xl"
            mb={2}
            bgGradient="linear(to-r, cyan.400, blue.500, purple.600)"
            bgClip="text"
          >
            Welcome, {user.username}!
          </Heading>
          <Text color="gray.400">
            Your personal competitive programming dashboard
          </Text>
        </Box>
      )}

      {/* Stats Section */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
        <Stat
          px={4}
          py={5}
          bg="rgba(0, 0, 0, 0.6)"
          backdropFilter="blur(10px)"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="whiteAlpha.200"
        >
          <StatLabel color="gray.400">Contests Participated</StatLabel>
          <StatNumber color="white" fontSize="3xl">
            {stats.totalParticipated}
          </StatNumber>
          <StatHelpText color="gray.400">
            Keep practicing!
          </StatHelpText>
        </Stat>

        <Stat
          px={4}
          py={5}
          bg="rgba(0, 0, 0, 0.6)"
          backdropFilter="blur(10px)"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="whiteAlpha.200"
        >
          <StatLabel color="gray.400">Upcoming Bookmarks</StatLabel>
          <StatNumber color="white" fontSize="3xl">
            {stats.upcomingBookmarked}
          </StatNumber>
          <StatHelpText color="gray.400">
            Contests you've bookmarked
          </StatHelpText>
        </Stat>

        <Stat
          px={4}
          py={5}
          bg="rgba(0, 0, 0, 0.6)"
          backdropFilter="blur(10px)"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="whiteAlpha.200"
        >
          <StatLabel color="gray.400">Favorite Website</StatLabel>
          <StatNumber color="white" fontSize="3xl">
            {stats.favoriteWebsite || 'N/A'}
          </StatNumber>
          <StatHelpText color="gray.400">
            Based on your participation
          </StatHelpText>
        </Stat>
      </SimpleGrid>

      {/* Tabs for different sections */}
      <Tabs
        variant="soft-rounded"
        colorScheme="blue"
        bg="rgba(0, 0, 0, 0.5)"
        backdropFilter="blur(10px)"
        borderRadius="lg"
        p={4}
      >
        <TabList mb={4} overflowX="auto" css={{ scrollbarWidth: 'thin' }}>
          <Tab color="gray.400" _selected={{ color: 'white', bg: 'blue.500' }}>Upcoming</Tab>
          <Tab color="gray.400" _selected={{ color: 'white', bg: 'blue.500' }}>Bookmarked</Tab>
          <Tab color="gray.400" _selected={{ color: 'white', bg: 'blue.500' }}>Contest History</Tab>
        </TabList>

        <TabPanels>
          {/* Upcoming Contests Tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {upcomingContests.length > 0 ? (
                upcomingContests.map(contest => renderContestCard(contest))
              ) : (
                <Text color="gray.400">No upcoming contests found.</Text>
              )}
            </SimpleGrid>
            
            <Flex justifyContent="center" mt={6}>
              <Button
                as="a"
                href="/contests"
                colorScheme="blue"
                bgGradient="linear(to-r, blue.400, purple.500)"
                _hover={{
                  bgGradient: 'linear(to-r, blue.500, purple.600)',
                }}
              >
                View All Contests
              </Button>
            </Flex>
          </TabPanel>

          {/* Bookmarked Contests Tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {bookmarkedContests.length > 0 ? (
                bookmarkedContests.map(contest => renderContestCard(contest, true))
              ) : (
                <VStack spacing={3} align="center" py={10}>
                  <Text color="gray.400">
                    You haven't bookmarked any contests yet.
                  </Text>
                  <Button
                    as="a"
                    href="/contests"
                    colorScheme="blue"
                    variant="outline"
                  >
                    Browse Contests
                  </Button>
                </VStack>
              )}
            </SimpleGrid>
          </TabPanel>

          {/* Contest History Tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {participatedContests.length > 0 ? (
                participatedContests.map(contest => renderContestCard(contest))
              ) : (
                <Text color="gray.400">No contest history available.</Text>
              )}
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
}

export default Dashboard;
