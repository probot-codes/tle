import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Badge,
  Flex,
  Button,
  HStack,
  Icon,
  VStack,
  Spinner,
  useToast,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { format, formatDistance } from 'date-fns';
import { FaExternalLinkAlt, FaBookmark, FaArrowLeft, FaClock, FaCalendarAlt } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as bookmarkService from '../services/bookmarkService';

function Bookmarks() {
  const [bookmarkedContests, setBookmarkedContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchBookmarkedContests();
  }, [currentUser]);

  const fetchBookmarkedContests = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const bookmarks = await bookmarkService.getBookmarkedContests();
      setBookmarkedContests(bookmarks);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookmarked contests:', err);
      setError('Failed to load your bookmarked contests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (contest) => {
    try {
      await bookmarkService.removeBookmark(contest.contestId, contest.platform);
      setBookmarkedContests(bookmarkedContests.filter(c => c.contestId !== contest.contestId));
      
      toast({
        title: 'Contest Removed',
        description: 'Contest removed from bookmarks',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove bookmark',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'codeforces':
        return 'red';
      case 'codechef':
        return 'orange';
      case 'leetcode':
        return 'yellow';
      case 'hackerrank':
        return 'green';
      case 'hackerearth':
        return 'purple';
      case 'atcoder':
        return 'blue';
      case 'topcoder':
        return 'cyan';
      default:
        return 'blue';
    }
  };

  if (!currentUser) {
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
        
        <Alert status="warning" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" borderRadius="lg" py={5}>
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">Authentication Required</AlertTitle>
          <AlertDescription maxWidth="sm">
            You need to be logged in to view your bookmarked contests.
          </AlertDescription>
          <HStack mt={4} spacing={4}>
            <Button colorScheme="blue" onClick={() => navigate('/login')}>Login</Button>
            <Button variant="outline" onClick={() => navigate('/register')}>Register</Button>
          </HStack>
        </Alert>
      </Container>
    );
  }

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

      <Heading mb={6} size="xl">Your Bookmarked Contests</Heading>
      
      {loading ? (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text mt={4}>Loading your bookmarked contests...</Text>
        </Box>
      ) : error ? (
        <Box textAlign="center" py={10} color="red.500">
          <Heading size="md" mb={4}>Error</Heading>
          <Text>{error}</Text>
        </Box>
      ) : bookmarkedContests.length === 0 ? (
        <Alert status="info" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" borderRadius="lg" py={5}>
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">No Bookmarked Contests</AlertTitle>
          <AlertDescription maxWidth="sm">
            You haven't bookmarked any contests yet. Browse contests and click the bookmark icon to add them here.
          </AlertDescription>
          <Button mt={4} colorScheme="blue" onClick={() => navigate('/contests')}>Browse Contests</Button>
        </Alert>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {bookmarkedContests.map((contest) => (
            <Box
              key={contest.contestId}
              p={5}
              borderRadius="lg"
              bg="rgba(0, 10, 25, 0.8)"
              borderWidth="1px"
              borderColor="whiteAlpha.200"
              boxShadow="xl"
              transition="all 0.2s"
              _hover={{
                transform: 'translateY(-5px)',
                boxShadow: '2xl',
              }}
              position="relative"
              cursor="pointer"
              onClick={() => navigate(`/contests/${contest.platform}/${contest.slug || contest.contestId}`)}
            >
              <Flex justifyContent="space-between" alignItems="flex-start" mb={3}>
                <HStack>
                  <Badge
                    colorScheme={getPlatformColor(contest.platform)}
                    px={2}
                    py={1}
                    borderRadius="md"
                  >
                    {contest.platform}
                  </Badge>
                  <Badge
                    colorScheme={contest.status === 'ONGOING' ? 'green' : contest.status === 'UPCOMING' ? 'blue' : 'gray'}
                    px={2}
                    py={1}
                    borderRadius="md"
                  >
                    {contest.status || (new Date(contest.date) > new Date() ? 'UPCOMING' : 'FINISHED')}
                  </Badge>
                </HStack>
                <Button
                  size="sm"
                  variant="ghost"
                  color="yellow.400"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBookmark(contest);
                  }}
                  aria-label="Remove bookmark"
                >
                  <Icon as={FaBookmark} boxSize={4} />
                </Button>
              </Flex>

              <Heading as="h3" size="md" color="white" mb={3}>
                <Text as={RouterLink} to={`/contests/${contest.platform}/${contest.slug || contest.contestId}`} _hover={{ textDecoration: 'none', color: 'blue.300' }} onClick={(e) => e.stopPropagation()}>
                  {contest.name}
                </Text>
              </Heading>

              <Divider mb={3} />

              <VStack align="stretch" spacing={2}>
                <HStack>
                  <Icon as={FaCalendarAlt} color="gray.500" />
                  <Text color="gray.300" fontSize="sm">
                    {contest.date ? format(new Date(contest.date), 'PPp') : 'Date not available'}
                  </Text>
                </HStack>

                {contest.duration && (
                  <HStack>
                    <Icon as={FaClock} color="gray.500" />
                    <Text color="gray.300" fontSize="sm">
                      {contest.duration}
                    </Text>
                  </HStack>
                )}

                {contest.url && (
                  <Button
                    as="a"
                    href={contest.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    mt={2}
                    rightIcon={<FaExternalLinkAlt />}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Visit Contest
                  </Button>
                )}
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}

export default Bookmarks;
