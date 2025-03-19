import React, { useState, useEffect } from 'react';
import axios from '../api';
import {
  Box,
  Container,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  HStack,
  Select,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  IconButton,
} from '@chakra-ui/react';
import { AddIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { format } from 'date-fns';

function Admin() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContest, setSelectedContest] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [pastContestsWithLinks, setPastContestsWithLinks] = useState([]);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchContests();
    // In a real app, we would also fetch past contests with YouTube links
    // Here we're using mock data for demonstration
    setPastContestsWithLinks([
      {
        id: '1',
        name: 'Codeforces Round #719 (Div. 3)',
        platform: 'Codeforces',
        date: '2025-02-05T14:35:00.000Z',
        youtubeLink: 'https://www.youtube.com/watch?v=example1'
      },
      {
        id: '2',
        name: 'Weekly Contest 380',
        platform: 'LeetCode',
        date: '2025-02-16T15:00:00Z',
        youtubeLink: 'https://www.youtube.com/watch?v=example2'
      },
    ]);
  }, []);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/contests/all');
      
      // Filter to only get past contests
      const pastContests = response.data.filter(contest => 
        new Date(contest.date) < new Date()
      );
      
      setContests(pastContests);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to fetch past contests',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedContest || !youtubeLink) {
      toast({
        title: 'Error',
        description: 'Please select a contest and provide a YouTube link',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setSubmitLoading(true);
    
    try {
      // In a real app, this would be an API call
      // await axios.post('http://localhost:5000/api/contest/youtube-link', {
      //   contestId: selectedContest,
      //   youtubeLink
      // });
      
      // For now, we'll just simulate a successful response
      setTimeout(() => {
        // Find the contest that was selected
        const contest = contests.find(c => c.link === selectedContest);
        
        // Add it to our list of contests with links
        if (contest) {
          setPastContestsWithLinks([
            ...pastContestsWithLinks,
            {
              id: Math.random().toString(),
              name: contest.name,
              platform: contest.platform,
              date: contest.date,
              youtubeLink
            }
          ]);
        }
        
        toast({
          title: 'Success',
          description: 'YouTube link added successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Reset form
        setSelectedContest('');
        setYoutubeLink('');
        onClose();
        
        setSubmitLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add YouTube link',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setSubmitLoading(false);
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
        <HStack justifyContent="space-between" mb={6}>
          <Heading as="h1" size="xl" color="white">
            Admin Panel
          </Heading>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={onOpen}
            bgGradient="linear(to-r, blue.400, purple.500)"
            _hover={{
              bgGradient: 'linear(to-r, blue.500, purple.600)',
            }}
          >
            Add YouTube Link
          </Button>
        </HStack>

        <Text color="gray.300" mb={8}>
          Here you can add YouTube solution links for past contests from TLE Eliminators channel.
        </Text>

        {/* Past Contests with YouTube Links */}
        <Box overflowX="auto">
          <Heading as="h2" size="md" color="white" mb={4}>
            Past Contests with Solutions
          </Heading>
          
          <Table variant="simple" colorScheme="whiteAlpha">
            <Thead>
              <Tr>
                <Th color="gray.300">Platform</Th>
                <Th color="gray.300">Contest Name</Th>
                <Th color="gray.300">Date</Th>
                <Th color="gray.300">YouTube Link</Th>
              </Tr>
            </Thead>
            <Tbody>
              {pastContestsWithLinks.map((contest) => (
                <Tr key={contest.id}>
                  <Td>
                    <Badge colorScheme={getPlatformColor(contest.platform)}>
                      {contest.platform}
                    </Badge>
                  </Td>
                  <Td color="white">{contest.name}</Td>
                  <Td color="white">
                    {format(new Date(contest.date), 'PPP')}
                  </Td>
                  <Td>
                    <Link href={contest.youtubeLink} isExternal color="blue.400">
                      View Solution <ExternalLinkIcon mx="2px" />
                    </Link>
                  </Td>
                </Tr>
              ))}
              {pastContestsWithLinks.length === 0 && (
                <Tr>
                  <Td colSpan={4} textAlign="center" color="gray.400">
                    No contests with solution links yet.
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Add YouTube Link Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent bg="gray.900" color="white" borderColor="whiteAlpha.200" borderWidth="1px">
          <ModalHeader>Add YouTube Solution Link</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} as="form" onSubmit={handleSubmit}>
              <FormControl id="contest" isRequired>
                <FormLabel>Select Contest</FormLabel>
                <Select
                  placeholder="Select contest"
                  value={selectedContest}
                  onChange={(e) => setSelectedContest(e.target.value)}
                  bg="whiteAlpha.100"
                  borderColor="whiteAlpha.300"
                >
                  {contests.map((contest) => (
                    <option key={contest.link} value={contest.link}>
                      {contest.name} ({contest.platform})
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl id="youtube-link" isRequired>
                <FormLabel>YouTube Link</FormLabel>
                <Input
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                  bg="whiteAlpha.100"
                  borderColor="whiteAlpha.300"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button 
              colorScheme="blue" 
              mr={3} 
              onClick={handleSubmit}
              isLoading={submitLoading}
              bgGradient="linear(to-r, blue.400, purple.500)"
              _hover={{
                bgGradient: 'linear(to-r, blue.500, purple.600)',
              }}
            >
              Save
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}

export default Admin;
