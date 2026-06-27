import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';

const AppContent: React.FC = () => {
  const { isDark } = useTheme();
  return (
    <>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
