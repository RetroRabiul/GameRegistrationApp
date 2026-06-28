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
  const archWidth = iconSize * 0.7;
  const archHeight = iconSize * 0.8;
  const pillarWidth = iconSize * 0.15;
  const playSize = iconSize * 0.25;

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
      {/* Gate arch */}
      <View
        style={[
          styles.arch,
          {
            width: archWidth,
            height: archHeight,
            borderRadius: archWidth * 0.5,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderWidth: iconSize * 0.08,
            borderColor: Colors.primary,
            borderTopColor: Colors.primary,
          },
        ]}
      />

      {/* Left pillar */}
      <View
        style={[
          styles.pillar,
          {
            width: pillarWidth,
            height: iconSize * 0.5,
            left: (iconSize - archWidth) / 2,
            bottom: iconSize * 0.1,
            backgroundColor: Colors.primary,
            borderRadius: iconSize * 0.02,
          },
        ]}
      />

      {/* Right pillar */}
      <View
        style={[
          styles.pillar,
          {
            width: pillarWidth,
            height: iconSize * 0.5,
            right: (iconSize - archWidth) / 2,
            bottom: iconSize * 0.1,
            backgroundColor: Colors.primary,
            borderRadius: iconSize * 0.02,
          },
        ]}
      />

      {/* Play triangle in center */}
      <View
        style={[
          styles.playContainer,
          {
            width: playSize,
            height: playSize,
          },
        ]}
      >
        <View
          style={[
            styles.playTriangle,
            {
              borderLeftWidth: playSize * 0.4,
              borderTopWidth: playSize * 0.5,
              borderBottomWidth: playSize * 0.5,
              borderTopColor: 'transparent',
              borderBottomColor: 'transparent',
              borderLeftColor: Colors.secondary,
            },
          ]}
        />
      </View>

      {/* Glow effect */}
      <Animated.View
        style={[
          styles.glow,
          {
            width: iconSize * 0.3,
            height: iconSize * 0.3,
            borderRadius: iconSize * 0.15,
            backgroundColor: Colors.secondary,
            opacity: glowAnim.interpolate({
              inputRange: [0.5, 1],
              outputRange: [0.2, 0.5],
            }),
          },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arch: {
    position: 'absolute',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '0deg' }],
  },
  pillar: {
    position: 'absolute',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  playContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  playTriangle: {
    width: 0,
    height: 0,
    marginLeft: 2,
  },
  glow: {
    position: 'absolute',
    zIndex: 1,
  },
});
