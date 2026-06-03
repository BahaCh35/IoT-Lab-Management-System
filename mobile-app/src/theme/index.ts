import { MD3LightTheme } from 'react-native-paper';

export const Colors = {
  primary: '#4361EE',
  primaryLight: '#818CF8',
  primaryDark: '#3730A3',
  secondary: '#7c3aed',
  secondaryLight: '#a855f7',
  secondaryDark: '#6d28d9',
  success: '#22C55E',
  successLight: '#86EFAC',
  successDark: '#16A34A',
  warning: '#F59E0B',
  warningLight: '#FCD34D',
  warningDark: '#D97706',
  error: '#EF4444',
  errorLight: '#FCA5A5',
  errorDark: '#DC2626',
  info: '#3B82F6',
  infoLight: '#93C5FD',
  infoDark: '#2563EB',
  background: '#F8F9FA',
  surface: '#ffffff',
  surfaceVariant: '#F1F5F9',
  border: '#E2E8F0',
  divider: '#E2E8F0',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textDisabled: '#94A3B8',
  white: '#ffffff',
  black: '#000000',
  grey50: '#f9fafb',
  grey100: '#f3f4f6',
  grey200: '#e5e7eb',
  grey300: '#d1d5db',
  grey400: '#9ca3af',
  grey500: '#6b7280',
  grey600: '#4b5563',
  grey700: '#374151',
  grey800: '#1f2937',
  grey900: '#111827',
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    primaryContainer: Colors.primaryLight,
    secondary: Colors.secondary,
    secondaryContainer: Colors.secondaryLight,
    background: Colors.background,
    surface: Colors.surface,
    surfaceVariant: Colors.surfaceVariant,
    error: Colors.error,
    onPrimary: Colors.white,
    onSecondary: Colors.white,
    onBackground: Colors.textPrimary,
    onSurface: Colors.textPrimary,
    outline: Colors.border,
  },
  fonts: {
    ...MD3LightTheme.fonts,
  },
  roundness: 2, // 8px in paper's unit system
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FontSize = {
  xs: 11,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
};
