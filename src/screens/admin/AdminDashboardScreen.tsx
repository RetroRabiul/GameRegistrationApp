import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Spacing, FontSize, BorderRadius } from '../../constants';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Card } from '../../components/Card';
import { MetricCard } from '../../components/MetricCard';
import { PulsingDot } from '../../components/PulsingDot';
import { useRegistrationStore } from '../../store/registrationStore';
import { useTheme } from '../../theme/ThemeContext';
import { DashboardStats } from '../../types';

export const AdminDashboardScreen: React.FC = () => {
  const { getDashboardStats, loading } = useRegistrationStore();
  const { colors } = useTheme();
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalRegistrations: 0,
    totalRevenue: 0,
    upcomingEvents: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const data = await getDashboardStats();
    setStats(data);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  if (loading && stats.totalEvents === 0) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.heroCard}>
        <LinearGradient
          colors={[colors.primary + '26', colors.secondary + '26']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <View style={styles.heroLiveRow}>
            <PulsingDot color={colors.primary} size={8} />
            <Text style={[styles.heroLiveText, { color: colors.primary }]}>
              LIVE DASHBOARD
            </Text>
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            Command Center
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
            Monitor your events, registrations, and revenue in real time.
          </Text>
        </LinearGradient>
      </View>

      <View style={styles.statsGrid}>
        <MetricCard
          icon="◫"
          value={stats.totalEvents}
          label="Total Events"
          accentColor={colors.primary}
        />
        <MetricCard
          icon="◷"
          value={stats.upcomingEvents}
          label="Upcoming"
          accentColor={colors.secondary}
        />
        <MetricCard
          icon="⊕"
          value={stats.totalRegistrations}
          label="Paid Registrations"
          accentColor={colors.tertiary}
        />
        <MetricCard
          icon="◈"
          value={`৳${stats.totalRevenue}`}
          label="Total Revenue"
          accentColor={colors.gold}
        />
      </View>

      <Card style={styles.actionsCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Quick Actions
        </Text>
        <View style={styles.actionsRow}>
          <View style={[styles.actionItem, { borderColor: colors.surfaceVariant }]}>
            <Text style={[styles.actionIcon, { color: colors.primary }]}>⊕</Text>
            <Text style={[styles.actionText, { color: colors.text }]}>
              Create Event
            </Text>
          </View>
          <View style={[styles.actionItem, { borderColor: colors.surfaceVariant }]}>
            <Text style={[styles.actionIcon, { color: colors.secondary }]}>⚔</Text>
            <Text style={[styles.actionText, { color: colors.text }]}>
              View Registrations
            </Text>
          </View>
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
  heroCard: {
    borderRadius: BorderRadius.hero,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  heroGradient: {
    padding: Spacing.hero,
  },
  heroLiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  heroLiveText: {
    fontSize: FontSize.label,
    fontWeight: '700',
    marginLeft: Spacing.md,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: FontSize.hero,
    fontWeight: '900',
    marginBottom: Spacing.md,
  },
  heroSubtitle: {
    fontSize: FontSize.body,
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.xl,
  },
  actionsCard: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.heading,
    fontWeight: '900',
    marginBottom: Spacing.xl,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.standard,
    padding: Spacing.xxl,
  },
  actionIcon: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  actionText: {
    fontSize: FontSize.body,
    fontWeight: '700',
    textAlign: 'center',
  },
});
