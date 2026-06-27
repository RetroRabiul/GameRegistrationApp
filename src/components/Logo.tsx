import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Colors } from '../constants';

interface LogoProps {
  size?: number;
  animated?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 80, animated = true }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.5,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animated]);

  const iconSize = size;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: iconSize,
          height: iconSize,
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <View style={[styles.background, { width: iconSize, height: iconSize, borderRadius: iconSize * 0.2 }]} />
      <View style={[styles.shape, { width: iconSize * 0.7, height: iconSize * 0.7 }]}>
        <View style={[styles.playTriangle, { borderLeftWidth: iconSize * 0.25 }]} />
      </View>
      <View style={[styles.dot, { width: iconSize * 0.12, height: iconSize * 0.12, borderRadius: iconSize * 0.06 }]} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    position: 'absolute',
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  shape: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderTopWidth: 15,
    borderBottomWidth: 15,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: Colors.background,
  },
  dot: {
    position: 'absolute',
    bottom: '15%',
    right: '15%',
    backgroundColor: Colors.secondary,
  },
});
