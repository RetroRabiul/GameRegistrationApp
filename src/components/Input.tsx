import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle } from 'react-native';
import { Spacing, FontSize, BorderRadius } from '../constants';
import { useTheme } from '../theme/ThemeContext';

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
  leadingIcon?: React.ReactNode;
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
  leadingIcon,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          multiline && styles.multiline,
          !editable && { opacity: 0.6 },
          {
            backgroundColor: colors.surface,
            borderColor: error
              ? colors.error
              : isFocused
              ? colors.primary
              : colors.surfaceVariant,
          },
        ]}
      >
        {leadingIcon && (
          <View style={styles.iconContainer}>{leadingIcon}</View>
        )}
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              paddingLeft: leadingIcon ? Spacing.md : Spacing.xl,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.standard,
    minHeight: 48,
  },
  iconContainer: {
    position: 'absolute',
    left: Spacing.xl,
    zIndex: 1,
  },
  input: {
    flex: 1,
    fontSize: FontSize.body,
    paddingVertical: Spacing.md + 4,
    paddingRight: Spacing.xl,
  },
  multiline: {
    minHeight: 100,
    paddingTop: Spacing.md + 4,
  },
  error: {
    fontSize: FontSize.caption,
    marginTop: Spacing.xs,
  },
});
