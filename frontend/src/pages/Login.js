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
  useColorModeValue,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  Icon,
  useToast,
  Container,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const { login, error: authError } = useAuth();
  
  // Get the redirect path from location state or default to contests page
  const from = location.state?.from?.pathname || '/contests';
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setFormErrors({});
    let errors = {};
    
    // Validate fields
    if (!email) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use auth context login
      await login({ email, password });
      
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      navigate(from);
    } catch (error) {
      let errorMessage = authError || 'Login failed';
      
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast({
        title: 'Login Failed',
        description: errorMessage,
        status: 'error',
        duration: 3000,
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
            >
              Welcome Back
            </Heading>
            <Text fontSize={'lg'} color={'gray.400'}>
              Login to track your favorite coding contests ✌️
            </Text>
          </Stack>

          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
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

              <Stack spacing={6}>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  loadingText="Logging in..."
                  size="lg"
                  bg="blue.500"
                  color="white"
                  _hover={{ bg: 'blue.600' }}
                  bgGradient="linear(to-r, blue.400, purple.500)"
                  _active={{ bg: 'blue.700' }}
                >
                  Sign in
                </Button>
              </Stack>

              <Stack pt={6}>
                <Text align={'center'} color="gray.400">
                  Don't have an account?{' '}
                  <Text
                    as={RouterLink}
                    to="/register"
                    color={'blue.400'}
                    _hover={{ color: 'blue.300' }}
                  >
                    Register here
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

export default Login;
