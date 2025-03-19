import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Badge,
  Button,
  Flex,
  Spinner,
  HStack,
  VStack,
  Link,
  IconButton,
  List,
  ListItem,
  Divider,
  useToast,
  Grid,
  GridItem,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Avatar,
  useColorModeValue,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExternalLinkIcon, StarIcon, CalendarIcon, TimeIcon, InfoIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { format, formatDistance } from 'date-fns';
import axios from 'axios';

function ContestDetails() {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if contest is bookmarked
    const savedBookmarks = localStorage.getItem('bookmarkedContests');
    if (savedBookmarks) {
      try {
        const bookmarkIds = JSON.parse(savedBookmarks);
        setIsBookmarked(bookmarkIds.includes(id));
      } catch (error) {
        console.error('Error parsing bookmarks:', error);
      }
    }

    // Fetch contest details
    const fetchContestDetails = async () => {
      try {
        // For now, we'll use mock data
        // In a real app, you would fetch the contest details from the API
        // const response = await axios.get(`http://localhost:5000/api/contests/${id}`);
        // setContest(response.data);
        
        // Mock data for demonstration
        const mockContests = [
          {
            id: '1',
            name: 'Codeforces Round #775 (Div. 1 + Div. 2)',
            url: 'https://codeforces.com/contests/1649',
            platform: 'Codeforces',
            startTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days from now
            endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 60 * 3), // 3 hours after start
            duration: '3 hours',
            status: 'upcoming',
            difficulty: 'Intermediate',
            description: 'Codeforces Round #775 (Div. 1 + Div. 2) is an online programming competition hosted on the Codeforces platform. The contest will feature a diverse set of algorithmic problems that test participants\' problem-solving and coding skills.',
            registrationUrl: 'https://codeforces.com/contestRegistration/1649',
            participants: 12500,
            problemCount: 8,
            problemTypes: ['Data Structures', 'Algorithms', 'Dynamic Programming', 'Graph Theory'],
            previousWinners: [
              { name: 'tourist', country: 'Belarus', avatar: 'https://userpic.codeforces.org/422/title/49b348af8d688df8.jpg' },
              { name: 'Um_nik', country: 'Russia', avatar: 'https://userpic.codeforces.org/422/title/49b348af8d688df8.jpg' },
              { name: 'Petr', country: 'Russia', avatar: 'https://userpic.codeforces.org/422/title/49b348af8d688df8.jpg' },
            ],
            sponsors: ['JetBrains', 'Google'],
            prizes: ['$1000 for 1st place', '$500 for 2nd place', '$250 for 3rd place'],
          },
          {
            id: '2',
            name: 'LeetCode Weekly Contest 333',
            url: 'https://leetcode.com/contest/weekly-contest-333',
            platform: 'LeetCode',
            startTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // 5 days from now
            endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 90), // 1.5 hours after start
            duration: '1.5 hours',
            status: 'upcoming',
            difficulty: 'Mixed',
            description: 'LeetCode Weekly Contest 333 is part of the regular series of weekly competitions hosted on LeetCode. The contest will include 4 problems of varying difficulty, designed to test a wide range of programming skills and algorithmic knowledge.',
            registrationUrl: 'https://leetcode.com/contest/weekly-contest-333',
            participants: 8200,
            problemCount: 4,
            problemTypes: ['Arrays', 'Strings', 'Tree', 'Dynamic Programming'],
            previousWinners: [
              { name: 'lee215', country: 'USA', avatar: 'https://assets.leetcode.com/users/leetcode/avatar_1531441.png' },
              { name: 'votrubac', country: 'Czech Republic', avatar: 'https://assets.leetcode.com/users/leetcode/avatar_1531441.png' },
              { name: 'DBabichev', country: 'Ukraine', avatar: 'https://assets.leetcode.com/users/leetcode/avatar_1531441.png' },
            ],
            sponsors: ['LeetCode', 'Amazon'],
            prizes: ['LeetCode Premium Subscription', 'Amazon Gift Cards'],
          },
          {
            id: '3',
            name: 'CodeChef Starters 77',
            url: 'https://www.codechef.com/START77',
            platform: 'CodeChef',
            startTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days from now
            endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 60 * 2), // 2 hours after start
            duration: '2 hours',
            status: 'upcoming',
            difficulty: 'Beginner to Advanced',
            description: 'CodeChef Starters is a weekly coding contest for programmers of all levels. This is the 77th iteration of the contest series. The problems range from beginner-friendly to challenging, making it suitable for coders of all skill levels.',
            registrationUrl: 'https://www.codechef.com/START77',
            participants: 5300,
            problemCount: 6,
            problemTypes: ['Greedy', 'Math', 'Sorting', 'Searching'],
            previousWinners: [
              { name: 'uwi', country: 'Japan', avatar: 'https://static.codechef.com/sites/default/files/uploads/pictures/a7efc3c09d23f5506e50de3c35831fef.jpg' },
              { name: 'errichto', country: 'Poland', avatar: 'https://static.codechef.com/sites/default/files/uploads/pictures/a7efc3c09d23f5506e50de3c35831fef.jpg' },
              { name: 'xellos', country: 'Poland', avatar: 'https://static.codechef.com/sites/default/files/uploads/pictures/a7efc3c09d23f5506e50de3c35831fef.jpg' },
            ],
            sponsors: ['CodeChef', 'Unacademy'],
            prizes: ['CodeChef Laddus', 'Unacademy Subscription'],
          }
        ];
        
        const selectedContest = mockContests.find(contest => contest.id === id);
        
        if (selectedContest) {
          setContest(selectedContest);
        } else {
          toast({
            title: 'Contest not found',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          navigate('/contests');
        }
      } catch (error) {
        console.error('Error fetching contest details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load contest details',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContestDetails();
  }, [id, navigate, toast]);

  const handleBookmarkToggle = () => {
    const savedBookmarks = localStorage.getItem('bookmarkedContests');
    let bookmarkIds = [];
    
    if (savedBookmarks) {
      try {
        bookmarkIds = JSON.parse(savedBookmarks);
      } catch (error) {
        console.error('Error parsing bookmarks:', error);
      }
    }
    
    if (isBookmarked) {
      // Remove bookmark
      bookmarkIds = bookmarkIds.filter(bookmarkId => bookmarkId !== id);
      setIsBookmarked(false);
      toast({
        title: 'Bookmark removed',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } else {
      // Add bookmark
      bookmarkIds.push(id);
      setIsBookmarked(true);
      toast({
        title: 'Contest bookmarked',
        description: 'You will receive notifications for this contest',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
    
    localStorage.setItem('bookmarkedContests', JSON.stringify(bookmarkIds));
  };

  if (loading) {
    return (
      <Container maxW="container.lg" py={8} centerContent>
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Container>
    );
  }

  if (!contest) {
    return (
      <Container maxW="container.lg" py={8} centerContent>
        <Text>Contest not found</Text>
        <Button mt={4} onClick={() => navigate('/contests')}>
          Back to Contests
        </Button>
      </Container>
    );
  }

  const timeUntilStart = formatDistance(contest.startTime, new Date(), { addSuffix: true });
  const contestPlatformColor = {
    'Codeforces': 'red',
    'LeetCode': 'yellow',
    'CodeChef': 'green',
    'AtCoder': 'blue',
    'HackerRank': 'teal',
    'HackerEarth': 'purple',
  }[contest.platform] || 'gray';

  return (
    <Container maxW="container.lg" py={8}>
      <Button 
        leftIcon={<ArrowBackIcon />} 
        variant="ghost" 
        mb={6}
        onClick={() => navigate(-1)}
        color="white"
      >
        Back
      </Button>

      <Box
        bg="rgba(0, 0, 0, 0.6)"
        borderRadius="lg"
        backdropFilter="blur(10px)"
        borderWidth="1px"
        borderColor="whiteAlpha.200"
        overflow="hidden"
        boxShadow="xl"
        mb={6}
      >
        <Box p={6}>
          <Flex justifyContent="space-between" alignItems="flex-start" mb={4}>
            <Heading color="white" size="lg">
              {contest.name}
            </Heading>
            <IconButton
              icon={isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark contest'}
              onClick={handleBookmarkToggle}
              variant="ghost"
              color={isBookmarked ? 'blue.400' : 'white'}
              _hover={{ bg: 'whiteAlpha.200' }}
            />
          </Flex>

          <HStack spacing={4} mb={6} wrap="wrap">
            <Badge colorScheme={contestPlatformColor} px={2} py={1} borderRadius="md">
              {contest.platform}
            </Badge>
            <Badge colorScheme="blue" px={2} py={1} borderRadius="md">
              {contest.difficulty}
            </Badge>
            <Badge colorScheme="purple" px={2} py={1} borderRadius="md">
              {contest.duration}
            </Badge>
            <Badge colorScheme="green" px={2} py={1} borderRadius="md">
              {contest.status.charAt(0).toUpperCase() + contest.status.slice(1)}
            </Badge>
          </HStack>

          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
            <GridItem>
              <VStack align="start" spacing={4}>
                <HStack>
                  <CalendarIcon color="blue.400" />
                  <Text color="white">
                    <Text as="span" fontWeight="bold">Start Date:</Text> {format(contest.startTime, 'PPP')}
                  </Text>
                </HStack>

                <HStack>
                  <TimeIcon color="blue.400" />
                  <Text color="white">
                    <Text as="span" fontWeight="bold">Start Time:</Text> {format(contest.startTime, 'p')} ({timeUntilStart})
                  </Text>
                </HStack>

                <HStack>
                  <InfoIcon color="blue.400" />
                  <Text color="white">
                    <Text as="span" fontWeight="bold">Participants:</Text> {contest.participants.toLocaleString()}
                  </Text>
                </HStack>

                <HStack>
                  <InfoIcon color="blue.400" />
                  <Text color="white">
                    <Text as="span" fontWeight="bold">Problems:</Text> {contest.problemCount}
                  </Text>
                </HStack>
              </VStack>
            </GridItem>

            <GridItem>
              <VStack align="start" spacing={4}>
                <HStack>
                  <StarIcon color="yellow.400" />
                  <Text color="white">
                    <Text as="span" fontWeight="bold">Problem Types:</Text> {contest.problemTypes.join(', ')}
                  </Text>
                </HStack>

                <Flex align="center">
                  <Button
                    as={Link}
                    href={contest.url}
                    isExternal
                    rightIcon={<ExternalLinkIcon />}
                    colorScheme="blue"
                    size="md"
                    mr={4}
                  >
                    Visit Contest
                  </Button>

                  <Button
                    as={Link}
                    href={contest.registrationUrl}
                    isExternal
                    colorScheme="green"
                    size="md"
                  >
                    Register
                  </Button>
                </Flex>
              </VStack>
            </GridItem>
          </Grid>
        </Box>
      </Box>

      <Tabs colorScheme="blue" variant="enclosed" bg="rgba(0, 0, 0, 0.6)" borderRadius="lg" overflow="hidden" boxShadow="xl">
        <TabList bg="whiteAlpha.100">
          <Tab color="gray.300" _selected={{ color: 'white', bg: 'whiteAlpha.200' }}>Description</Tab>
          <Tab color="gray.300" _selected={{ color: 'white', bg: 'whiteAlpha.200' }}>Prizes</Tab>
          <Tab color="gray.300" _selected={{ color: 'white', bg: 'whiteAlpha.200' }}>Previous Winners</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Text color="white" fontSize="md">
              {contest.description}
            </Text>
            <Divider my={4} borderColor="whiteAlpha.300" />
            <Text color="white" fontSize="sm">
              <Text as="span" fontWeight="bold">Sponsors:</Text> {contest.sponsors.join(', ')}
            </Text>
          </TabPanel>

          <TabPanel>
            <List spacing={3}>
              {contest.prizes.map((prize, index) => (
                <ListItem key={index} color="white">
                  <HStack>
                    <StarIcon color="yellow.400" />
                    <Text>{prize}</Text>
                  </HStack>
                </ListItem>
              ))}
            </List>
          </TabPanel>

          <TabPanel>
            <VStack spacing={4} align="stretch">
              {contest.previousWinners.map((winner, index) => (
                <HStack key={index} spacing={4}>
                  <Avatar 
                    size="md" 
                    name={winner.name} 
                    src={winner.avatar} 
                    bg={`${contestPlatformColor}.500`}
                  />
                  <Box>
                    <Text color="white" fontWeight="bold">{winner.name}</Text>
                    <Text color="gray.300">{winner.country}</Text>
                  </Box>
                  <Badge ml="auto" colorScheme="yellow">#{index + 1}</Badge>
                </HStack>
              ))}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <HStack mt={6} justifyContent="center" spacing={4}>
        <Button
          onClick={() => navigate('/contests')}
          colorScheme="blue"
          variant="outline"
        >
          Back to All Contests
        </Button>
        
        {isBookmarked ? (
          <Button
            onClick={handleBookmarkToggle}
            leftIcon={<FaBookmark />}
            colorScheme="red"
            variant="solid"
          >
            Remove Bookmark
          </Button>
        ) : (
          <Button
            onClick={handleBookmarkToggle}
            leftIcon={<FaRegBookmark />}
            colorScheme="blue"
            variant="solid"
          >
            Bookmark Contest
          </Button>
        )}
      </HStack>
    </Container>
  );
}

export default ContestDetails;
