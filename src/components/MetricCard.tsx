import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius } from '../constants';
import { useTheme } from '../theme/ThemeContext';

interface MetricCardProps {
  icon: string;
  value: string | number;
  label: string;
  accentColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ icon, value, label, accentColor }) => {
  const { colors } = useTheme();
  const iconColor = accentColor || colors.primary;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.surfaceVariant,
        },
      ]}
    >
      <Ionicons name={icon as any} size={20} color={iconColor} style={styles.icon} />
      <Text style={[styles.value, { color: accentColor || colors.text }]}>
        {value}
      </Text>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    margin: Spacing.xs,
    borderRadius: BorderRadius.metric,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  icon: {
    marginBottom: Spacing.md,
    opacity: 0.8,
  },
  value: {
    fontSize: FontSize.title,
    fontWeight: '900',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    textAlign: 'center',
  },
});
