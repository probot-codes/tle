import React from 'react';
import { IconButton, useColorMode, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';

const ColorModeToggle = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const iconColor = useColorModeValue('gray.700', 'white');
  
  return (
    <Tooltip label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
      <IconButton
        aria-label={`Toggle ${colorMode === 'light' ? 'Dark' : 'Light'} Mode`}
        icon={colorMode === 'light' ? <MoonIcon color={iconColor} /> : <SunIcon color={iconColor} />}
        onClick={toggleColorMode}
        variant="ghost"
        size="md"
        borderRadius="full"
        bg="transparent"
        _hover={{
          bg: useColorModeValue('gray.200', 'rgba(255, 255, 255, 0.1)')
        }}
      />
    </Tooltip>
  );
};

export default ColorModeToggle;
