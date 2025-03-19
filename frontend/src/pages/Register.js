import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Text,
  InputGroup,
  InputRightElement,
  Icon,
  useToast,
  Container,
  FormErrorMessage,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  const toast = useToast();
  const navigate = useNavigate();
  const { register, error: authError } = useAuth();

  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setFormErrors({});
    let errors = {};
    
    // Validate fields
    if (!username) errors.username = 'Username is required';
    if (!email) errors.email = 'Email is required';
    if (email && !validateEmail(email)) errors.email = 'Invalid email format';
    if (!password) errors.password = 'Password is required';
    if (password && password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
    if (password && confirmPassword && password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use auth context register
      await register({
        username,
        email,
        password
      });
      
      toast({
        title: 'Registration Successful',
        description: 'You can now login with your credentials',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      navigate('/login');
    } catch (error) {
      let errorMessage = authError || 'Registration failed';
      
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast({
        title: 'Registration Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="lg" py={{ base: 12, md: 24 }}>
      <Box
        bg="rgba(0, 0, 0, 0.7)"
        backdropFilter="blur(16px)"
        p={8}
        borderRadius="xl"
        boxShadow="xl"
        borderWidth="1px"
        borderColor="whiteAlpha.200"
      >
        <Stack spacing={8}>
          <Stack align="center">
            <Heading
              fontSize={'4xl'}
              bgGradient="linear(to-r, cyan.400, blue.500, purple.600)"
              bgClip="text"
              textAlign="center"
            >
              Create Your Account
            </Heading>
            <Text fontSize={'lg'} color={'gray.400'} textAlign="center">
              Join our community of competitive programmers ✌️
            </Text>
          </Stack>

          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="username" isInvalid={formErrors.username}>
                <FormLabel color="white">Username</FormLabel>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  bg="whiteAlpha.100"
                  color="white"
                  borderColor="whiteAlpha.300"
                  _placeholder={{ color: 'gray.400' }}
                  _hover={{ borderColor: 'blue.500' }}
                  _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                />
                <FormErrorMessage>{formErrors.username}</FormErrorMessage>
              </FormControl>

              <FormControl id="email" isInvalid={formErrors.email}>
                <FormLabel color="white">Email address</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  bg="whiteAlpha.100"
                  color="white"
                  borderColor="whiteAlpha.300"
                  _placeholder={{ color: 'gray.400' }}
                  _hover={{ borderColor: 'blue.500' }}
                  _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                />
                <FormErrorMessage>{formErrors.email}</FormErrorMessage>
              </FormControl>

              <FormControl id="password" isInvalid={formErrors.password}>
                <FormLabel color="white">Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    bg="whiteAlpha.100"
                    color="white"
                    borderColor="whiteAlpha.300"
                    _placeholder={{ color: 'gray.400' }}
                    _hover={{ borderColor: 'blue.500' }}
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                  />
                  <InputRightElement h={'full'}>
                    <Button
                      variant={'ghost'}
                      onClick={() => setShowPassword(!showPassword)}
                      color="gray.400"
                      _hover={{ color: 'white' }}
                    >
                      {showPassword ? (
                        <Icon as={ViewOffIcon} />
                      ) : (
                        <Icon as={ViewIcon} />
                      )}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{formErrors.password}</FormErrorMessage>
              </FormControl>

              <FormControl id="confirmPassword" isInvalid={formErrors.confirmPassword}>
                <FormLabel color="white">Confirm Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    bg="whiteAlpha.100"
                    color="white"
                    borderColor="whiteAlpha.300"
                    _placeholder={{ color: 'gray.400' }}
                    _hover={{ borderColor: 'blue.500' }}
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                  />
                  <InputRightElement h={'full'}>
                    <Button
                      variant={'ghost'}
                      onClick={() => setShowPassword(!showPassword)}
                      color="gray.400"
                      _hover={{ color: 'white' }}
                    >
                      {showPassword ? (
                        <Icon as={ViewOffIcon} />
                      ) : (
                        <Icon as={ViewIcon} />
                      )}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{formErrors.confirmPassword}</FormErrorMessage>
              </FormControl>

              <Stack spacing={6} pt={4}>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  loadingText="Creating Account..."
                  size="lg"
                  bg="blue.500"
                  color="white"
                  _hover={{ bg: 'blue.600' }}
                  bgGradient="linear(to-r, blue.400, purple.500)"
                  _active={{ bg: 'blue.700' }}
                >
                  Register
                </Button>
              </Stack>

              <Stack pt={6}>
                <Text align={'center'} color="gray.400">
                  Already have an account?{' '}
                  <Text
                    as={RouterLink}
                    to="/login"
                    color={'blue.400'}
                    _hover={{ color: 'blue.300' }}
                  >
                    Login here
                  </Text>
                </Text>
              </Stack>
            </Stack>
          </form>
        </Stack>
      </Box>
    </Container>
  );
}

export default Register;
