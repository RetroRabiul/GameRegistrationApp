import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { AuthNavigator } from './AuthNavigator';
import { PlayerNavigator } from './PlayerNavigator';
import { AdminNavigator } from './AdminNavigator';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const RootNavigator: React.FC = () => {
  const { user, loading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthNavigator />;
  }

  if (user.role === 'admin') {
    return <AdminNavigator />;
  }

  return <PlayerNavigator />;
};
