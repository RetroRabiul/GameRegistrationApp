import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useTheme } from '../theme/ThemeContext';
import { notificationService } from '../lib/notifications';

export const RootNavigator: React.FC = () => {
  const { user, loading, initialize } = useAuthStore();
  const { colors } = useTheme();

  useEffect(() => {
    initialize();
    // Request notification permissions
    notificationService.requestPermissions();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthNavigator />;
  }

  return <MainNavigator />;
};
