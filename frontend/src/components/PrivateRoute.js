import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useToast, Spinner, Flex } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

/**
 * A wrapper for routes that require authentication
 * Redirects to login if not authenticated
 */
const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const toast = useToast();

  // If authentication is still being checked, show a spinner
  if (loading) {
    return (
      <Flex justify="center" align="center" height="50vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Flex>
    );
  }

  // If user is not authenticated, redirect to login
  if (!currentUser) {
    toast({
      title: 'Authentication Required',
      description: 'Please log in to access this page',
      status: 'warning',
      duration: 3000,
      isClosable: true,
    });
    
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected component
  return children;
};

export default PrivateRoute;
