import React, { useState, useEffect, useRef } from 'react';
import {
  IconButton,
  Box,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  VStack,
  HStack,
  Badge,
  useDisclosure,
  Divider,
  Link,
  Icon
} from '@chakra-ui/react';
import { BellIcon } from '@chakra-ui/icons';
import { FaExternalLinkAlt, FaClock } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';
import { format } from 'date-fns';

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialFocusRef = useRef();

  useEffect(() => {
    // In a real app, you would fetch notifications from the server
    // For now, let's generate some mock notifications
    
    // Get bookmarked contests from localStorage
    const savedBookmarks = localStorage.getItem('bookmarkedContests');
    
    if (savedBookmarks) {
      try {
        const bookmarkIds = JSON.parse(savedBookmarks);
        
        // Mock notifications for bookmarked contests
        const mockNotifications = [
          {
            id: '1',
            type: 'reminder',
            title: 'Contest Starting Soon',
            message: 'Codeforces Round #775 starts in 2 hours',
            date: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            read: false,
            link: 'https://codeforces.com/contests',
            contestId: bookmarkIds[0] || 'https://codeforces.com/contests',
          },
          {
            id: '2',
            type: 'registration',
            title: 'Registration Open',
            message: 'LeetCode Weekly Contest 333 registration is now open',
            date: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
            read: false,
            link: 'https://leetcode.com/contest/',
            contestId: bookmarkIds[1] || 'https://leetcode.com/contest/',
          },
          {
            id: '3',
            type: 'solution',
            title: 'Solution Available',
            message: 'Video solution for CodeChef Starters 77 is now available',
            date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            read: true,
            link: 'https://youtube.com/watch?v=example',
            contestId: 'https://codechef.com/contests',
          },
        ];
        
        setNotifications(mockNotifications);
        
        // Count unread notifications
        const unread = mockNotifications.filter(notif => !notif.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error parsing bookmarks:', error);
      }
    } else {
      // If no bookmarks, add default notifications
      const defaultNotifications = [
        {
          id: '1',
          type: 'welcome',
          title: 'Welcome to Contest Tracker',
          message: 'Bookmark contests to receive notifications',
          date: new Date(),
          read: false,
          link: '/contests',
          contestId: 'welcome',
        },
      ];
      
      setNotifications(defaultNotifications);
      setUnreadCount(1);
    }
  }, []);

  const handleNotificationClick = (id) => {
    // Mark notification as read
    const updatedNotifications = notifications.map(notif => {
      if (notif.id === id && !notif.read) {
        return { ...notif, read: true };
      }
      return notif;
    });
    
    setNotifications(updatedNotifications);
    
    // Update unread count
    const unread = updatedNotifications.filter(notif => !notif.read).length;
    setUnreadCount(unread);
  };

  const getNotificationTypeColor = (type) => {
    switch (type) {
      case 'reminder':
        return 'red';
      case 'registration':
        return 'green';
      case 'solution':
        return 'blue';
      case 'welcome':
        return 'purple';
      default:
        return 'gray';
    }
  };

  return (
    <Popover
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      placement="bottom-end"
      initialFocusRef={initialFocusRef}
    >
      <PopoverTrigger>
        <Box position="relative" display="inline-block">
          <IconButton
            aria-label="Notifications"
            icon={<BellIcon />}
            variant="ghost"
            color="white"
            fontSize="20px"
            _hover={{ bg: 'whiteAlpha.200' }}
          />
          {unreadCount > 0 && (
            <Badge
              colorScheme="red"
              borderRadius="full"
              position="absolute"
              top="-2px"
              right="-2px"
              fontSize="0.8em"
              minW="1.6em"
              textAlign="center"
            >
              {unreadCount}
            </Badge>
          )}
        </Box>
      </PopoverTrigger>
      <PopoverContent
        bg="gray.800"
        borderColor="whiteAlpha.300"
        color="white"
        maxW="350px"
        boxShadow="xl"
      >
        <PopoverArrow bg="gray.800" />
        <PopoverHeader
          fontWeight="bold"
          borderBottomWidth="1px"
          borderColor="whiteAlpha.300"
        >
          Notifications
        </PopoverHeader>
        <PopoverBody p={0}>
          {notifications.length > 0 ? (
            <VStack 
              spacing={0} 
              divider={<Divider borderColor="whiteAlpha.200" />}
              maxH="400px"
              overflowY="auto"
              css={{
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'gray.700',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'gray.500',
                  borderRadius: '24px',
                },
              }}
            >
              {notifications.map((notification) => (
                <Box
                  key={notification.id}
                  p={3}
                  w="100%"
                  bg={notification.read ? 'transparent' : 'whiteAlpha.100'}
                  onClick={() => handleNotificationClick(notification.id)}
                  cursor="pointer"
                  transition="background 0.2s"
                  _hover={{ bg: 'whiteAlpha.200' }}
                >
                  <HStack spacing={3} align="start">
                    <Badge
                      colorScheme={getNotificationTypeColor(notification.type)}
                      alignSelf="flex-start"
                      mt={1}
                    >
                      {notification.type}
                    </Badge>
                    <Box flex="1">
                      <Text fontWeight="bold" fontSize="sm">
                        {notification.title}
                      </Text>
                      <Text fontSize="sm" color="gray.300" mb={1}>
                        {notification.message}
                      </Text>
                      <HStack fontSize="xs" color="gray.400">
                        <Icon as={FaClock} />
                        <Text>{format(notification.date, 'MMM d, h:mm a')}</Text>
                        
                        {notification.link && (
                          <Link 
                            href={notification.link.startsWith('http') ? notification.link : null}
                            as={notification.link.startsWith('http') ? undefined : RouterLink}
                            to={notification.link.startsWith('http') ? undefined : notification.link}
                            color="blue.300"
                            ml="auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Icon as={FaExternalLinkAlt} boxSize="0.7em" />
                          </Link>
                        )}
                      </HStack>
                    </Box>
                  </HStack>
                </Box>
              ))}
            </VStack>
          ) : (
            <Box py={4} px={3} textAlign="center">
              <Text color="gray.400">No notifications</Text>
            </Box>
          )}
          
          <Box p={2} bg="gray.700" textAlign="center">
            <Link
              as={RouterLink}
              to="/settings"
              fontSize="sm"
              color="blue.300"
              _hover={{ textDecoration: 'underline' }}
              onClick={onClose}
            >
              Notification Settings
            </Link>
          </Box>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationBell;
