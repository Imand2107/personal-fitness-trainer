/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

export const COLORS = {
  primary: "#FF6B6B",
  primaryDark: "#E85D5D",
  primaryLight: "#FF8787",
  secondary: "#FFB84C",
  success: "#51CF66",
  background: "#FFF9F9",
  card: "#FFFFFF",
  text: "#2D3436",
  textSecondary: "#636E72",
  border: "#FFE5E5",
  error: "#e74c3c",
  divider: "#FFE5E5",
  shadow: "#2D3436",
};

export default {
  light: {
    text: COLORS.text,
    background: COLORS.background,
    tint: COLORS.primary,
    tabIconDefault: COLORS.textSecondary,
    tabIconSelected: COLORS.primary,
  },
  dark: {
    text: COLORS.card,
    background: COLORS.text,
    tint: COLORS.primaryLight,
    tabIconDefault: COLORS.textSecondary,
    tabIconSelected: COLORS.primaryLight,
  },
};
