export const DarkColors = {
  background: '#0A0E17',
  surface: '#131B2A',
  surfaceVariant: '#1B263B',
  primary: '#00E5FF',
  secondary: '#FF6D00',
  tertiary: '#00E676',
  text: '#F0F4F8',
  textMuted: '#8B949E',
  error: '#FF3B30',
  gold: '#FFD700',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.7)',
  codeBackground: '#070A10',
  codeText: '#00FF88',
};

export const LightColors = {
  background: '#F4F6F9',
  surface: '#FFFFFF',
  surfaceVariant: '#E2E8F0',
  primary: '#0284C7',
  secondary: '#4F46E5',
  tertiary: '#00E676',
  text: '#1E293B',
  textMuted: '#64748B',
  error: '#FF3B30',
  gold: '#FFD700',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.3)',
  codeBackground: '#1E293B',
  codeText: '#00FF88',
};

export type ThemeColors = typeof DarkColors;

export const Colors = DarkColors;

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  xxxl: 24,
  hero: 20,
  screen: 16,
};

export const FontSize = {
  label: 11,
  caption: 12,
  body: 14,
  bodyLg: 16,
  cardTitle: 16,
  heading: 18,
  title: 20,
  hero: 22,
  xxl: 24,
  display: 28,
};

export const BorderRadius = {
  metric: 10,
  standard: 12,
  auth: 16,
  hero: 16,
  full: 9999,
};

export const SUPABASE_URL = 'https://bkkoydsrmkegvgenmylv.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJra295ZHNybWtlZ3ZnZW5teWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MzIwOTEsImV4cCI6MjA5ODEwODA5MX0.3HZxcgWA53ftAgq0Jb7ba9amWRJdX04CoG3jFQScCNY';

export const BKASH_CONFIG = {
  BASE_URL: 'https://tokenized.sandbox.bka.sh/v1.2.0-beta',
  APP_KEY: 'YOUR_BKASH_APP_KEY',
};
