import { Platform } from 'react-native';

export const theme = {
  colors: {
    primary: '#D73027',       // Red - primary brand color
    secondary: '#222222',     // Dark gray/black - secondary brand color
    tertiary: '#4a90e2',      // Blue accent
    background: '#1a1a1a',    // Light background
    surface: '#ffffff',       // White surface
    text: '#333333',          // Dark text
    textSecondary: '#666666', // Secondary text
    accent: '#e30613',        // Red accent (same as primary)
    white: '#FFFFFF',
    black: '#000000',
    success: '#4caf50',       // Green for success states
    warning: '#ff9800',       // Orange for warning states
    error: '#f44336',         // Red for error states
    border: '#e0e0e0',        // Light gray border
    yellow: '#FFD700',
    green: '#4CAF50',
    red: '#FF4444',
  },
  fonts: {
    regular: Platform.select({ ios: 'Montserrat-Regular', android: 'Montserrat-Regular', default: 'System' }),
    medium: Platform.select({ ios: 'Montserrat-Medium', android: 'Montserrat-Medium', default: 'System' }),
    bold: Platform.select({ ios: 'Montserrat-Bold', android: 'Montserrat-Bold', default: 'System' }),
    size: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 22,
      xxl: 28,
      xxxl: 36,
    },
    primary: 'Montserrat',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    xl: 16,
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    },
  },
}; 