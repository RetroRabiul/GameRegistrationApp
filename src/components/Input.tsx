import React from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle } from 'react-native';
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
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          error ? styles.inputError : null,
          !editable && styles.disabled,
        ]}
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
      />
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
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    fontSize: FontSize.md,
    color: Colors.text,
    minHeight: 48,
  },
  multiline: {
    minHeight: 100,
    paddingTop: Spacing.sm + 4,
  },
  inputError: {
    borderColor: Colors.error,
  },
  disabled: {
    backgroundColor: Colors.background,
    color: Colors.textSecondary,
  },
  error: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
});
