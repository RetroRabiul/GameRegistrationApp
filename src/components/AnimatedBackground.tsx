import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Dimensions, View } from 'react-native';
import { Colors } from '../constants';

const { width, height } = Dimensions.get('window');

export const AnimatedBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const animatedValue1 = useRef(new Animated.Value(0)).current;
  const animatedValue2 = useRef(new Animated.Value(0)).current;
  const animatedValue3 = useRef(new Animated.Value(0)).current;

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
      ])
    ).start();
  }, []);

  const translate1 = animatedValue1.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, width + 100],
  });

  const translate2 = animatedValue2.interpolate({
    inputRange: [0, 1],
    outputRange: [height + 100, -100],
  });

  const translate3 = animatedValue3.interpolate({
    inputRange: [0, 1],
    outputRange: [width + 100, -100],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.blob1,
          {
            transform: [{ translateX: translate1 }, { translateY: translate1 }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.blob2,
          {
            transform: [{ translateY: translate2 }, { translateX: translate2 }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.blob3,
          {
            transform: [{ translateX: translate3 }, { translateY: translate3 }],
          },
        ]}
      />
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
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.primary + '15',
    top: -100,
    left: -100,
  },
  blob2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: Colors.secondary + '12',
    bottom: -80,
    right: -80,
  },
  blob3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primary + '10',
    top: height / 2 - 100,
    right: -50,
  },
  content: {
    flex: 1,
  },
});
