import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useRegistrationStore } from '../../store/registrationStore';
import { DashboardStats } from '../../types';

export const AdminDashboardScreen: React.FC = () => {
  const { getDashboardStats, loading } = useRegistrationStore();
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
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Overview of your events</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📅</Text>
          <Text style={styles.statValue}>{stats.totalEvents}</Text>
          <Text style={styles.statLabel}>Total Events</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🔜</Text>
          <Text style={styles.statValue}>{stats.upcomingEvents}</Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>👥</Text>
          <Text style={styles.statValue}>{stats.totalRegistrations}</Text>
          <Text style={styles.statLabel}>Paid Registrations</Text>
        </View>

        <View style={[styles.statCard, styles.revenueCard]}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={[styles.statValue, styles.revenueValue]}>৳{stats.totalRevenue}</Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <View style={styles.actionHint}>
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionText}>Create Event</Text>
          </View>
          <View style={styles.actionHint}>
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionText}>View Registrations</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.md,
  },
  statCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    margin: '1.5%',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  revenueCard: {
    backgroundColor: Colors.primary + '10',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  revenueValue: {
    color: Colors.primary,
  },
  statLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  quickActions: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionHint: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '45%',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  actionText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
  },
});
