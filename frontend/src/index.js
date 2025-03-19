import React from 'react';
import ReactDOM from 'react-dom';
import './api'; // Import the API configuration
import App from './App';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

// Extend the theme to include custom colors, fonts, etc
const theme = extendTheme({
  fonts: {
    heading: "'Poppins', sans-serif",
    body: "'Poppins', sans-serif",
  },
  colors: {
    brand: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
});

ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
