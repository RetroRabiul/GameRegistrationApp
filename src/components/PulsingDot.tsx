import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface PulsingDotProps {
  color?: string;
  size?: number;
  style?: any;
}

export const PulsingDot: React.FC<PulsingDotProps> = ({ color, size = 8, style }) => {
  const { colors } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.2,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color || colors.primary,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
};
