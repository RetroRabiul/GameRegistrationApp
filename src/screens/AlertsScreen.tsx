import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Spacing, FontSize, BorderRadius } from '../constants';
import { useTheme } from '../theme/ThemeContext';
import { Card } from '../components/Card';

export const AlertsScreen: React.FC = () => {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: colors.text }]}>Alerts</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        Notifications and updates
      </Text>

      <Card style={styles.emptyCard}>
        <Text style={[styles.emptyIcon, { color: colors.textMuted }]}>⚑</Text>
        <Text style={[styles.emptyText, { color: colors.text }]}>
          No alerts yet
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
          You'll receive notifications about events, payments, and updates here.
        </Text>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
  },
  title: {
    fontSize: FontSize.hero,
    fontWeight: '900',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.body,
    marginBottom: Spacing.xxl,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.xl,
  },
  emptyText: {
    fontSize: FontSize.bodyLg,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  emptySubtext: {
    fontSize: FontSize.body,
    textAlign: 'center',
    lineHeight: 22,
  },
});
