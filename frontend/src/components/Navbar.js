import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  IconButton,
  useDisclosure,
  Collapse,
  chakra,
  HStack,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorModeValue,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';
import ColorModeToggle from './ColorModeToggle';

function Navbar() {
  const { isOpen, onToggle } = useDisclosure();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const isLoggedIn = !!currentUser;
  
  // No longer need useEffect since we're using AuthContext

  return (
    <Box
      position="sticky"
      top="0"
      zIndex="10"
      backdropFilter="blur(8px)"
      bg="transparent"
      borderBottom="1px solid"
      borderColor={{
        _dark: 'whiteAlpha.200',
        _light: 'gray.200'
      }}
    >
      <Flex
        color={{
          _dark: 'white',
          _light: 'gray.800'
        }}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        align={'center'}
        justify="space-between"
        maxW="1200px"
        mx="auto"
      >
        <Flex
          flex={{ base: 1 }}
          justify={{ base: 'start', md: 'start' }}
          align="center"
        >
          <Text
            as={RouterLink}
            to="/"
            textAlign="left"
            fontFamily={'heading'}
            fontSize="xl"
            fontWeight="bold"
            bgGradient="linear(to-r, cyan.400, blue.500, purple.600)"
            bgClip="text"
          >
            CodeContestTracker
          </Text>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav />
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={4}
          align={'center'}
        >
          {/* Always show the color mode toggle */}
          <ColorModeToggle />
          
          {isLoggedIn ? (
            <>
              <NotificationBell />
              
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  cursor={'pointer'}
                  minW={0}
                >
                  <Avatar
                    size={'sm'}
                    name={currentUser?.username || 'User'}
                    bg="blue.500"
                  />
                </MenuButton>
                <MenuList bg={'gray.900'} borderColor={'whiteAlpha.300'}>
                  <MenuItem
                    _hover={{ bg: 'whiteAlpha.200' }}
                    as={RouterLink}
                    to='/dashboard'
                  >
                    Dashboard
                  </MenuItem>
                  <MenuItem
                    _hover={{ bg: 'whiteAlpha.200' }}
                    as={RouterLink}
                    to='/bookmarks'
                  >
                    My Bookmarks
                  </MenuItem>
                  <MenuItem
                    _hover={{ bg: 'whiteAlpha.200' }}
                    as={RouterLink}
                    to='/settings'
                  >
                    Settings
                  </MenuItem>
                  <MenuDivider borderColor={'whiteAlpha.300'} />
                  <MenuItem
                    _hover={{ bg: 'whiteAlpha.200' }}
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                  >
                    Sign out
                  </MenuItem>
                </MenuList>
              </Menu>
            </>
          ) : (
            <>
              <Button
                as={RouterLink}
                fontSize={'sm'}
                fontWeight={400}
                variant={'link'}
                to={'/login'}
                color={{
                  _dark: 'white',
                  _light: 'gray.700'
                }}
              >
                Login
              </Button>
              <Button
                as={RouterLink}
                display={{ base: 'none', md: 'inline-flex' }}
                fontSize={'sm'}
                fontWeight={600}
                to={'/register'}
                colorScheme={'blue'}
                bgGradient="linear(to-r, blue.400, purple.500)"
                _hover={{
                  bgGradient: 'linear(to-r, blue.500, purple.600)',
                }}
              >
                Register
              </Button>
            </>
          )}
        </Stack>
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          onClick={onToggle}
          icon={
            isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
          }
          variant={'ghost'}
          aria-label={'Toggle Navigation'}
          color={{
            _dark: 'white',
            _light: 'gray.700'
          }}
        />
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  );
}

const DesktopNav = () => {
  const linkColor = useColorModeValue('gray.700', 'gray.200');
  const linkHoverColor = useColorModeValue('blue.600', 'white');

  return (
    <HStack spacing={8} align="center">
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <chakra.a
            as={RouterLink}
            to={navItem.href}
            p={2}
            fontSize={'sm'}
            fontWeight={500}
            color={linkColor}
            _hover={{
              textDecoration: 'none',
              color: linkHoverColor,
            }}
          >
            {navItem.label}
          </chakra.a>
        </Box>
      ))}
    </HStack>
  );
};

const MobileNav = () => {
  return (
    <Stack
      bg={useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(0, 0, 0, 0.9)')}
      p={4}
      display={{ md: 'none' }}
      borderBottom="1px solid"
      borderColor={useColorModeValue('gray.200', 'whiteAlpha.200')}
    >
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, href }) => {
  return (
    <Stack spacing={4}>
      <Flex
        py={2}
        as={RouterLink}
        to={href}
        justify={'space-between'}
        align={'center'}
        _hover={{
          textDecoration: 'none',
        }}
      >
        <Text fontWeight={600} color={useColorModeValue('gray.700', 'white')}>
          {label}
        </Text>
      </Flex>
    </Stack>
  );
};

const NAV_ITEMS = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Contests',
    href: '/contests',
  },
  {
    label: 'Bookmarks',
    href: '/bookmarks',
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    label: 'Admin',
    href: '/admin',
  },
];

export default Navbar;
