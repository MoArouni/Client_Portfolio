import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme } from '@mui/material/styles';

// Create context
export const ThemeContext = createContext();

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

// Create a futuristic theme with dark and light modes
const createAppTheme = (darkMode) => {
  const baseTheme = {
    typography: {
      fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        letterSpacing: '-0.025em',
      },
      h2: {
        fontWeight: 600,
        letterSpacing: '-0.025em',
      },
      h3: {
        fontWeight: 600,
      },
      button: {
        fontWeight: 600,
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '10px 24px',
            boxShadow: 'none',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
            },
          },
          containedPrimary: {
            background: darkMode ? 
              'linear-gradient(45deg, #5e35b1 0%, #3949ab 100%)' :
              'linear-gradient(45deg, #7c4dff 0%, #536dfe 100%)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: darkMode ? 
              '0 10px 20px rgba(0, 0, 0, 0.3)' : 
              '0 10px 30px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: darkMode ? 
                '0 15px 30px rgba(0, 0, 0, 0.4)' : 
                '0 15px 40px rgba(0, 0, 0, 0.15)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            backdropFilter: 'blur(10px)',
            backgroundColor: darkMode ? 
              'rgba(18, 18, 32, 0.8)' : 
              'rgba(255, 255, 255, 0.8)',
          },
        },
      },
    },
  };

  if (darkMode) {
    return createTheme({
      ...baseTheme,
      palette: {
        mode: 'dark',
        primary: {
          main: '#7c4dff',
          light: '#b47cff',
          dark: '#3f1dcb',
        },
        secondary: {
          main: '#00e5ff',
          light: '#6effff',
          dark: '#00b2cc',
        },
        background: {
          default: '#121220',
          paper: 'rgba(30, 30, 45, 0.8)',
          contrast: '#0e0e18',
        },
        text: {
          primary: '#f5f5f5',
          secondary: '#b0b0b0',
        },
        divider: 'rgba(255, 255, 255, 0.1)',
      },
    });
  } else {
    return createTheme({
      ...baseTheme,
      palette: {
        mode: 'light',
        primary: {
          main: '#5e35b1',
          light: '#9162e4',
          dark: '#280680',
        },
        secondary: {
          main: '#00b0ff',
          light: '#69e2ff',
          dark: '#0081cb',
        },
        background: {
          default: '#f7f9fc',
          paper: 'rgba(255, 255, 255, 0.9)',
          contrast: '#ffffff',
        },
        text: {
          primary: '#2d2d2d',
          secondary: '#5f5f5f',
        },
        divider: 'rgba(0, 0, 0, 0.08)',
      },
    });
  }
};

export const ThemeProvider = ({ children }) => {
  // Check if user has previously selected dark mode
  const storedMode = localStorage.getItem('darkMode');
  const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const [darkMode, setDarkMode] = useState(
    storedMode !== null ? JSON.parse(storedMode) : prefersDarkMode
  );
  
  // Create and memoize the theme to prevent unnecessary re-renders
  const theme = useMemo(() => createAppTheme(darkMode), [darkMode]);
  
  // Toggle between dark and light mode
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };
  
  // Store dark mode preference when it changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    
    // Apply theme color to meta tag for mobile browsers
    const metaThemeColor = document.querySelector('meta[name=theme-color]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', 
        darkMode ? theme.palette.background.contrast : theme.palette.background.default
      );
    }
  }, [darkMode, theme]);
  
  // The context value that will be supplied to any descendants
  const contextValue = {
    theme,
    darkMode,
    toggleDarkMode
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}; 