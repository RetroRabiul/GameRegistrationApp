import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Spacing, FontSize, BorderRadius } from '../constants';
import { useTheme } from '../theme/ThemeContext';
import { Card } from '../components/Card';

export const ApiScreen: React.FC = () => {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: colors.text }]}>API</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        Developer tools and endpoints
      </Text>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Endpoints
        </Text>
        <View
          style={[
            styles.codeBlock,
            {
              backgroundColor: colors.codeBackground,
              borderColor: colors.surfaceVariant,
            },
          ]}
        >
          <Text style={[styles.codeText, { color: colors.codeText }]}>
            {`GET  /events\nPOST /events\nGET  /events/:id\nPUT  /events/:id\nDEL  /events/:id\n\nPOST /register/:eventId\nGET  /registrations\nPOST /payment/create\nPOST /payment/execute`}
          </Text>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Auth Token
        </Text>
        <View
          style={[
            styles.codeBlock,
            {
              backgroundColor: colors.codeBackground,
              borderColor: colors.surfaceVariant,
            },
          ]}
        >
          <Text style={[styles.codeText, { color: colors.codeText }]} numberOfLines={1}>
            Bearer eyJhbGciOi...
          </Text>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Base URL
        </Text>
        <View
          style={[
            styles.codeBlock,
            {
              backgroundColor: colors.codeBackground,
              borderColor: colors.surfaceVariant,
            },
          ]}
        >
          <Text style={[styles.codeText, { color: colors.codeText }]}>
            https://bkkoydsrmkegvgenmylv.supabase.co
          </Text>
        </View>
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
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.cardTitle,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  codeBlock: {
    borderRadius: BorderRadius.metric,
    borderWidth: 1,
    padding: Spacing.xl,
  },
  codeText: {
    fontSize: FontSize.body,
    fontFamily: 'monospace',
    lineHeight: 22,
  },
});
