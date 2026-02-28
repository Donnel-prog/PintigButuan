import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Pintig Butuan Theme Palette ──────────────────────────────────────────────────────

export const DarkColors = {
  primary: '#0066FF', // Vibrant Digital Blue
  primaryLight: '#3385FF',
  primaryDark: '#0044AA',
  cyan: '#00D4FF',
  cyanLight: '#80EAFF',
  green: '#00E676',
  greenLight: '#69F0AE',
  purple: '#D500F9',
  purpleLight: '#E040FB',
  alert: '#FF3355', // Neon Alert Red
  alertLight: '#FF6688',
  warning: '#FFCC00', // Warning/Verified Yellow

  background: '#050505', // Deep Digital Black
  surface: 'rgba(255, 255, 255, 0.05)',
  surfaceLight: 'rgba(255, 255, 255, 0.1)',
  border: 'rgba(255, 255, 255, 0.1)',
  borderGlow: 'rgba(0, 102, 255, 0.3)',

  textPrimary: '#FFFFFF',
  textSecondary: '#AAAAAA',
  textMuted: '#666666',
  success: '#00E676',
};

export const LightColors = {
  primary: '#0066FF',
  primaryLight: '#448AFF',
  primaryDark: '#004BA0',
  cyan: '#0097A7',
  cyanLight: '#4DD0E1',
  green: '#2E7D32',
  greenLight: '#4CAF50',
  purple: '#7B1FA2',
  purpleLight: '#9C27B0',
  alert: '#C62828',
  alertLight: '#EF5350',
  warning: '#F57C00',

  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceLight: '#F8F9FA',
  border: '#E1E4E8',
  borderGlow: 'rgba(0, 102, 255, 0.1)',

  textPrimary: '#1A1A1A',
  textSecondary: '#4A4A4A',
  textMuted: '#7A7A7A',
  success: '#2E7D32',
};

// Default export for backward compatibility
export const PintigColors = DarkColors;

// ─── Responsive Helpers ──────────────────────────────────────────────────────

export const isSmallScreen = SCREEN_WIDTH < 375;
export const responsive = {
  fontSize: (base: number) => isSmallScreen ? base - 1 : base,
  padding: (base: number) => isSmallScreen ? base - 4 : base,
  iconSize: (base: number) => isSmallScreen ? base - 2 : base,
  cardRadius: 24,
  buttonRadius: 16,
};
