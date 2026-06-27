import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Spacing, BorderRadius } from '../constants';
import { useTheme } from '../theme/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'hero' | 'metric' | 'auth';
  borderColor?: string;
}

export const Card: React.FC<CardProps> = ({ children, style, variant = 'default', borderColor }) => {
  const { colors } = useTheme();

  const getRadius = () => {
    switch (variant) {
      case 'hero':
      case 'auth':
        return BorderRadius.hero;
      case 'metric':
        return BorderRadius.metric;
      default:
        return BorderRadius.standard;
    }
  };

  const getPadding = () => {
    switch (variant) {
      case 'hero':
      case 'auth':
        return Spacing.hero;
      default:
        return Spacing.xl;
    }
  };

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: getRadius(),
          borderWidth: 1,
          borderColor: borderColor || colors.surfaceVariant,
          padding: getPadding(),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
