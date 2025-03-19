import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
  Button,
  useToast,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  HStack,
  Divider,
  Badge,
  Flex,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from '../api';
import { useAuth } from '../contexts/AuthContext';

function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    profile: {
      username: '',
      email: '',
      bio: '',
    },
    notifications: {
      contestReminders: true,
      emailNotifications: true,
      reminderTime: '1hour',
      telegramUsername: '',
    },
    platforms: {
      codeforces: {
        enabled: true,
        handle: '',
      },
      leetcode: {
        enabled: true,
        handle: '',
      },
      codechef: {
        enabled: true,
        handle: '',
      },
    },
  });
  
  const toast = useToast();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  
  const { currentUser, token, loading: authLoading } = useAuth();
  
  useEffect(() => {
    // If auth state is loaded and no current user, redirect to login
    if (!authLoading && !currentUser) {
      navigate('/login');
      toast({
        title: 'Authentication required',
        description: 'Please log in to access settings',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // If we have a current user, set it and populate settings
    if (currentUser) {
      setUser(currentUser);
      
      // Pre-fill user data
      setSettings(prevSettings => ({
      ...prevSettings,
      profile: {
        ...prevSettings.profile,
        username: currentUser.username || '',
        email: currentUser.email || '',
      },
    }));
    }
    
    // In a real app, you would fetch user settings from the backend
    // For now we're using the initial state
  }, [navigate, toast]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      profile: {
        ...settings.profile,
        [name]: value,
      },
    });
  };

  const handleNotificationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [name]: type === 'checkbox' ? checked : value,
      },
    });
  };

  const handlePlatformToggle = (platform) => {
    setSettings({
      ...settings,
      platforms: {
        ...settings.platforms,
        [platform]: {
          ...settings.platforms[platform],
          enabled: !settings.platforms[platform].enabled,
        },
      },
    });
  };

  const handlePlatformHandleChange = (platform, handle) => {
    setSettings({
      ...settings,
      platforms: {
        ...settings.platforms,
        [platform]: {
          ...settings.platforms[platform],
          handle,
        },
      },
    });
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    
    try {
      // In a real app, you would send this to your backend
      // await axios.put('http://localhost:5000/api/users/settings', settings, {
      //   headers: {
      //     Authorization: `Bearer ${localStorage.getItem('token')}`,
      //   },
      // });
      
      // Update user in localStorage if username changed
      if (user.username !== settings.profile.username) {
        const updatedUser = {
          ...user,
          username: settings.profile.username,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      
      // For now we'll just simulate a successful save
      setTimeout(() => {
        toast({
          title: 'Settings saved',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <Container maxW="container.lg" py={8}>
      <Heading
        as="h1"
        size="xl"
        mb={6}
        bgGradient="linear(to-r, cyan.400, blue.500, purple.600)"
        bgClip="text"
      >
        Settings
      </Heading>

      <Box
        bg="rgba(0, 0, 0, 0.6)"
        borderRadius="lg"
        backdropFilter="blur(10px)"
        borderWidth="1px"
        borderColor="whiteAlpha.200"
        overflow="hidden"
        boxShadow="xl"
      >
        <Tabs colorScheme="blue" isFitted variant="enclosed">
          <TabList bg="whiteAlpha.100">
            <Tab color="gray.300" _selected={{ color: 'white', bg: 'whiteAlpha.200' }}>Profile</Tab>
            <Tab color="gray.300" _selected={{ color: 'white', bg: 'whiteAlpha.200' }}>Notifications</Tab>
            <Tab color="gray.300" _selected={{ color: 'white', bg: 'whiteAlpha.200' }}>Platforms</Tab>
            <Tab color="gray.300" _selected={{ color: 'white', bg: 'whiteAlpha.200' }}>Appearance</Tab>
          </TabList>

          <TabPanels>
            {/* Profile Settings */}
            <TabPanel>
              <VStack spacing={6} align="start">
                <Text color="gray.300">
                  Manage your profile information
                </Text>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                  <FormControl id="username">
                    <FormLabel color="white">Username</FormLabel>
                    <Input
                      name="username"
                      value={settings.profile.username}
                      onChange={handleProfileChange}
                      bg="whiteAlpha.100"
                      borderColor="whiteAlpha.300"
                      color="white"
                      _placeholder={{ color: 'gray.400' }}
                      _hover={{ borderColor: 'blue.500' }}
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                    />
                  </FormControl>

                  <FormControl id="email">
                    <FormLabel color="white">Email</FormLabel>
                    <Input
                      name="email"
                      type="email"
                      value={settings.profile.email}
                      onChange={handleProfileChange}
                      bg="whiteAlpha.100"
                      borderColor="whiteAlpha.300"
                      color="white"
                      _placeholder={{ color: 'gray.400' }}
                      _hover={{ borderColor: 'blue.500' }}
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl id="bio">
                  <FormLabel color="white">Bio</FormLabel>
                  <Input
                    name="bio"
                    value={settings.profile.bio}
                    onChange={handleProfileChange}
                    placeholder="Tell us about yourself"
                    bg="whiteAlpha.100"
                    borderColor="whiteAlpha.300"
                    color="white"
                    _placeholder={{ color: 'gray.400' }}
                    _hover={{ borderColor: 'blue.500' }}
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                  />
                </FormControl>
              </VStack>
            </TabPanel>

            {/* Notification Settings */}
            <TabPanel>
              <VStack spacing={6} align="start">
                <Text color="gray.300">
                  Configure how you want to be notified about contests
                </Text>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="contestReminders" mb="0" color="white">
                      Contest Reminders
                    </FormLabel>
                    <Switch
                      id="contestReminders"
                      name="contestReminders"
                      isChecked={settings.notifications.contestReminders}
                      onChange={handleNotificationChange}
                      colorScheme="blue"
                      ml="auto"
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="emailNotifications" mb="0" color="white">
                      Email Notifications
                    </FormLabel>
                    <Switch
                      id="emailNotifications"
                      name="emailNotifications"
                      isChecked={settings.notifications.emailNotifications}
                      onChange={handleNotificationChange}
                      colorScheme="blue"
                      ml="auto"
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl id="reminderTime">
                  <FormLabel color="white">Reminder Time</FormLabel>
                  <Select
                    name="reminderTime"
                    value={settings.notifications.reminderTime}
                    onChange={handleNotificationChange}
                    bg="whiteAlpha.100"
                    borderColor="whiteAlpha.300"
                    color="white"
                    _hover={{ borderColor: 'blue.500' }}
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                  >
                    <option value="30min">30 minutes before</option>
                    <option value="1hour">1 hour before</option>
                    <option value="3hours">3 hours before</option>
                    <option value="1day">1 day before</option>
                  </Select>
                </FormControl>

                <FormControl id="telegramUsername">
                  <FormLabel color="white">Telegram Username (Optional)</FormLabel>
                  <Input
                    name="telegramUsername"
                    value={settings.notifications.telegramUsername}
                    onChange={handleNotificationChange}
                    placeholder="@username"
                    bg="whiteAlpha.100"
                    borderColor="whiteAlpha.300"
                    color="white"
                    _placeholder={{ color: 'gray.400' }}
                    _hover={{ borderColor: 'blue.500' }}
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                  />
                </FormControl>
              </VStack>
            </TabPanel>

            {/* Platform Settings */}
            <TabPanel>
              <VStack spacing={6} align="start">
                <Text color="gray.300">
                  Connect your competitive programming accounts
                </Text>
                
                <VStack spacing={4} w="full">
                  {/* Codeforces */}
                  <Box
                    p={4}
                    borderRadius="md"
                    bg="rgba(0, 0, 0, 0.3)"
                    borderWidth="1px"
                    borderColor="whiteAlpha.200"
                    w="full"
                  >
                    <Flex justify="space-between" align="center" mb={3}>
                      <HStack>
                        <Badge colorScheme="red">Codeforces</Badge>
                        <Heading as="h3" size="sm" color="white">
                          Codeforces
                        </Heading>
                      </HStack>
                      <Switch
                        isChecked={settings.platforms.codeforces.enabled}
                        onChange={() => handlePlatformToggle('codeforces')}
                        colorScheme="red"
                      />
                    </Flex>
                    
                    {settings.platforms.codeforces.enabled && (
                      <FormControl id="codeforcesHandle">
                        <FormLabel color="white" fontSize="sm">Handle</FormLabel>
                        <Input
                          value={settings.platforms.codeforces.handle}
                          onChange={(e) => handlePlatformHandleChange('codeforces', e.target.value)}
                          placeholder="Your Codeforces handle"
                          size="sm"
                          bg="whiteAlpha.100"
                          borderColor="whiteAlpha.300"
                          color="white"
                          _placeholder={{ color: 'gray.400' }}
                        />
                      </FormControl>
                    )}
                  </Box>
                  
                  {/* LeetCode */}
                  <Box
                    p={4}
                    borderRadius="md"
                    bg="rgba(0, 0, 0, 0.3)"
                    borderWidth="1px"
                    borderColor="whiteAlpha.200"
                    w="full"
                  >
                    <Flex justify="space-between" align="center" mb={3}>
                      <HStack>
                        <Badge colorScheme="yellow">LeetCode</Badge>
                        <Heading as="h3" size="sm" color="white">
                          LeetCode
                        </Heading>
                      </HStack>
                      <Switch
                        isChecked={settings.platforms.leetcode.enabled}
                        onChange={() => handlePlatformToggle('leetcode')}
                        colorScheme="yellow"
                      />
                    </Flex>
                    
                    {settings.platforms.leetcode.enabled && (
                      <FormControl id="leetcodeHandle">
                        <FormLabel color="white" fontSize="sm">Handle</FormLabel>
                        <Input
                          value={settings.platforms.leetcode.handle}
                          onChange={(e) => handlePlatformHandleChange('leetcode', e.target.value)}
                          placeholder="Your LeetCode handle"
                          size="sm"
                          bg="whiteAlpha.100"
                          borderColor="whiteAlpha.300"
                          color="white"
                          _placeholder={{ color: 'gray.400' }}
                        />
                      </FormControl>
                    )}
                  </Box>
                  
                  {/* CodeChef */}
                  <Box
                    p={4}
                    borderRadius="md"
                    bg="rgba(0, 0, 0, 0.3)"
                    borderWidth="1px"
                    borderColor="whiteAlpha.200"
                    w="full"
                  >
                    <Flex justify="space-between" align="center" mb={3}>
                      <HStack>
                        <Badge colorScheme="green">CodeChef</Badge>
                        <Heading as="h3" size="sm" color="white">
                          CodeChef
                        </Heading>
                      </HStack>
                      <Switch
                        isChecked={settings.platforms.codechef.enabled}
                        onChange={() => handlePlatformToggle('codechef')}
                        colorScheme="green"
                      />
                    </Flex>
                    
                    {settings.platforms.codechef.enabled && (
                      <FormControl id="codechefHandle">
                        <FormLabel color="white" fontSize="sm">Handle</FormLabel>
                        <Input
                          value={settings.platforms.codechef.handle}
                          onChange={(e) => handlePlatformHandleChange('codechef', e.target.value)}
                          placeholder="Your CodeChef handle"
                          size="sm"
                          bg="whiteAlpha.100"
                          borderColor="whiteAlpha.300"
                          color="white"
                          _placeholder={{ color: 'gray.400' }}
                        />
                      </FormControl>
                    )}
                  </Box>
                </VStack>
              </VStack>
            </TabPanel>

            {/* Appearance Settings */}
            <TabPanel>
              <VStack spacing={6} align="start">
                <Text color="gray.300">
                  Customize the appearance of the app
                </Text>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="colorMode" mb="0" color="white">
                    Dark Mode
                  </FormLabel>
                  <Switch
                    id="colorMode"
                    isChecked={colorMode === 'dark'}
                    onChange={toggleColorMode}
                    colorScheme="blue"
                    ml="auto"
                  />
                </FormControl>
                
                <Divider borderColor="whiteAlpha.300" />
                
                <Text color="gray.400" fontSize="sm">
                  More appearance options coming soon...
                </Text>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      <Flex justify="flex-end" mt={6}>
        <Button
          bgGradient="linear(to-r, blue.400, purple.500)"
          _hover={{
            bgGradient: 'linear(to-r, blue.500, purple.600)',
          }}
          color="white"
          onClick={handleSaveSettings}
          isLoading={loading}
        >
          Save Settings
        </Button>
      </Flex>
    </Container>
  );
}

export default Settings;
