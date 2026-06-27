import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Dimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants';

const { width, height } = Dimensions.get('window');

export const AnimatedBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const animatedValue1 = useRef(new Animated.Value(0)).current;
  const animatedValue2 = useRef(new Animated.Value(0)).current;
  const animatedValue3 = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.timing(animatedValue1, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue2, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue3, {
          toValue: 1,
          duration: 12000,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 0.6,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 0.3,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        ),
      ])
    ).start();
  }, []);

  const translate1 = animatedValue1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-100, width / 2, width + 100],
  });

  const translate2 = animatedValue2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [height + 100, height / 2, -100],
  });

  const translate3 = animatedValue3.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [width + 100, width / 2, -100],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.backgroundLight, Colors.background]}
        style={StyleSheet.absoluteFill}
      />
      
      <Animated.View
        style={[
          styles.blob1,
          {
            transform: [{ translateX: translate1 }, { translateY: translate1 }],
            opacity: pulseAnim,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.blob2,
          {
            transform: [{ translateY: translate2 }, { translateX: translate2 }],
            opacity: pulseAnim,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.blob3,
          {
            transform: [{ translateX: translate3 }, { translateY: translate3 }],
            opacity: pulseAnim,
          },
        ]}
      />
      
      <View style={styles.gridOverlay} />
      
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: Colors.primary + '25',
    top: -100,
    left: -100,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 50,
    elevation: 10,
  },
  blob2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.secondary + '20',
    bottom: -80,
    right: -80,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 50,
    elevation: 10,
  },
  blob3: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: Colors.accent + '18',
    top: height / 2 - 100,
    right: -50,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 50,
    elevation: 10,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border + '10',
  },
  content: {
    flex: 1,
  },
});
