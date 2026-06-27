import React, { useRef, useState } from 'react';
import { View, TextInput, Text, StyleSheet, Animated, ViewStyle } from 'react-native';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  error?: string;
  multiline?: boolean;
  style?: ViewStyle;
  editable?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  error,
  multiline,
  style,
  editable = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const glowAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isFocused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.5,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isFocused]);

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [Colors.border, Colors.primary, Colors.border],
  });

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View style={[
        styles.inputWrapper,
        multiline && styles.multiline,
        error ? styles.inputError : null,
        !editable && styles.disabled,
        { borderColor: error ? Colors.error : borderColor },
      ]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textLight}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </Animated.View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  input: {
    fontSize: FontSize.md,
    color: Colors.text,
    paddingVertical: Spacing.sm + 4,
  },
  multiline: {
    minHeight: 100,
    paddingTop: Spacing.sm + 4,
  },
  inputError: {
    borderColor: Colors.error,
  },
  disabled: {
    backgroundColor: Colors.surface,
    opacity: 0.6,
  },
  error: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
});
