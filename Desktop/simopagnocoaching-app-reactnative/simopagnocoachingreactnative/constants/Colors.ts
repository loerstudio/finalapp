/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

// New fitness app color palette
const primaryYellow = '#FFD700'; // Bright yellow for primary actions
const primaryGreen = '#00FF7F'; // Lime green for accents
const darkBackground = '#0A0A0A'; // Very dark background
const darkSurface = '#1A1A1A'; // Slightly lighter dark surface
const darkCard = '#2A2A2A'; // Dark card background
const textPrimary = '#FFFFFF'; // White text
const textSecondary = '#B0B0B0'; // Light gray text
const textMuted = '#808080'; // Muted text

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
  // New fitness app colors
  fitness: {
    primary: primaryYellow,
    accent: primaryGreen,
    background: darkBackground,
    surface: darkSurface,
    card: darkCard,
    textPrimary: textPrimary,
    textSecondary: textSecondary,
    textMuted: textMuted,
    success: primaryGreen,
    error: '#FF6B6B',
    warning: '#FFA500',
    info: '#4ECDC4',
  }
};
