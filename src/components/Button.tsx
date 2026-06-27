import React, { useRef } from 'react';
import { Animated, TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const isOutline = variant === 'outline';

  React.useEffect(() => {
    if (!disabled && variant === 'primary') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.5,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [disabled, variant]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
      tension: 40,
    }).start();
  };

  const getGlowStyle = () => {
    if (variant === 'primary') {
      return {
        shadowColor: Colors.neonGlow,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: glowAnim,
        shadowRadius: 15,
        elevation: 8,
      };
    }
    return {};
  };

  const getGradientColors = (): [string, string] => {
    switch (variant) {
      case 'primary':
        return [Colors.gradient1, Colors.gradient2];
      case 'secondary':
        return [Colors.secondary, Colors.accent];
      case 'danger':
        return [Colors.error, '#CC0033'];
      default:
        return [Colors.gradient1, Colors.gradient2];
    }
  };

  const renderButtonContent = () => {
    if (loading) {
      return <ActivityIndicator color={isOutline ? Colors.primary : Colors.white} />;
    }
    return (
      <Text style={[styles.text, isOutline && styles.outlineText]}>
        {title}
      </Text>
    );
  };

  if (isOutline) {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          style={[styles.button, styles.outline, disabled && styles.disabled, style]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={0.7}
        >
          {renderButtonContent()}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, getGlowStyle()]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.7}
        style={disabled && styles.disabled}
      >
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.button, style]}
        >
          {renderButtonContent()}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  outlineText: {
    color: Colors.primary,
  },
});
