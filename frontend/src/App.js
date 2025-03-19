import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { extendTheme } from '@chakra-ui/react';
import { AuthProvider } from './contexts/AuthContext';

// Configure the color mode settings
const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

// Extend the theme with our color mode config and customizations
const theme = extendTheme({ 
  config,
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? '#121212' : 'white',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      },
    }),
  },
});

// Import components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Contests from './pages/Contests';
import ContestDetail from './pages/ContestDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Bookmarks from './pages/Bookmarks';
// import ThreeBackground from './components/ThreeBackground';

function App() {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <AuthProvider>
        <Router>
      <Box 
        position="relative" 
        minHeight="100vh" 
        overflow="hidden" 
        bg="transparent"
        color={{
          _dark: 'white',
          _light: 'gray.800'
        }}
      >
        {/* Temporarily commented out Three.js background for debugging */}
        {/* <ThreeBackground /> */}
        
        {/* Content */}
        <Box position="relative" zIndex="1">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contests" element={<Contests />} />
            <Route path="/contests/:platform/:slug" element={<ContestDetail />} />
            <Route path="/bookmarks" element={<PrivateRoute><Bookmarks /></PrivateRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          </Routes>
        </Box>
      </Box>
        </Router>
        </AuthProvider>
      </ChakraProvider>
    </>
  );
}

export default App;
