import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Spacing, FontSize, BorderRadius } from '../constants';
import { useTheme } from '../theme/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'danger' | 'text';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: any;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  fullWidth = true,
}) => {
  const { colors } = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.secondary;
      case 'tertiary': return colors.surfaceVariant;
      case 'danger': return colors.error;
      case 'outline': return 'transparent';
      case 'text': return 'transparent';
      default: return colors.primary;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary': return colors.background;
      case 'secondary': return colors.white;
      case 'tertiary': return colors.text;
      case 'danger': return colors.white;
      case 'outline': return colors.primary;
      case 'text': return colors.primary;
      default: return colors.background;
    }
  };

  const getBorderColor = () => {
    switch (variant) {
      case 'outline': return colors.primary;
      default: return 'transparent';
    }
  };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={getTextColor()} />;
    }
    return (
      <>
        {icon}
        {icon ? <Text style={{ width: Spacing.md }} /> : null}
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
          {title}
        </Text>
      </>
    );
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          opacity: disabled ? 0.5 : 1,
          width: fullWidth ? '100%' : undefined,
          alignSelf: fullWidth ? undefined : 'flex-start',
        },
        style,
      ]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xxxl,
    borderRadius: BorderRadius.standard,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderWidth: 1,
  },
  text: {
    fontSize: FontSize.bodyLg,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
