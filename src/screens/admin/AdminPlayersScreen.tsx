import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius, CURRENCY_SYMBOL } from '../../constants';
import { Card } from '../../components/Card';
import { MetricCard } from '../../components/MetricCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useRegistrationStore } from '../../store/registrationStore';
import { useTheme } from '../../theme/ThemeContext';

export const AdminPlayersScreen: React.FC = () => {
  const { allRegistrations, loading, fetchAllRegistrations } = useRegistrationStore();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAllRegistrations();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllRegistrations();
    setRefreshing(false);
  };

  const paidCount = allRegistrations.filter((r: any) => r.payment_status === 'paid').length;
  const pendingCount = allRegistrations.filter((r: any) => r.payment_status === 'pending').length;
  const totalRevenue = allRegistrations
    .filter((r: any) => r.payment_status === 'paid')
    .reduce((sum: number, r: any) => sum + (r.event?.price || 0), 0);

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'paid': return colors.tertiary;
      case 'pending': return colors.gold;
      case 'failed': return colors.error;
      default: return colors.textMuted;
    }
  };

  if (loading && allRegistrations.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Ionicons name="people" size={28} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>All Players</Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {allRegistrations.length} total registrations
        </Text>
      </View>

      <View style={styles.statsRow}>
        <MetricCard icon="people-outline" value={allRegistrations.length} label="Total" accentColor={colors.primary} />
        <MetricCard icon="checkmark-circle-outline" value={paidCount} label="Paid" accentColor={colors.tertiary} />
        <MetricCard icon="time-outline" value={pendingCount} label="Pending" accentColor={colors.gold} />
        <MetricCard icon="cash-outline" value={String(totalRevenue)} label="Revenue" accentColor={colors.primary} />
      </View>

      {allRegistrations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Card style={styles.emptyCard}>
            <Ionicons name="people-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No registrations yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
              Players will appear here once they register for events
            </Text>
          </Card>
        </View>
      ) : (
        <FlatList
          data={allRegistrations}
          renderItem={({ item }) => {
            const profile = (item as any).profile;
            const event = (item as any).event;
            return (
              <Card style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.playerInfo}>
                    <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.avatarText, { color: colors.primary }]}>
                        {profile?.full_name?.charAt(0).toUpperCase() || '?'}
                      </Text>
                    </View>
                    <View style={styles.playerDetails}>
                      <Text style={[styles.playerName, { color: colors.text }]}>
                        {profile?.full_name || 'Unknown Player'}
                      </Text>
                      <Text style={[styles.playerEmail, { color: colors.textMuted }]}>
                        {profile?.email || ''}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: getPaymentColor(item.payment_status) + '15',
                        borderColor: getPaymentColor(item.payment_status),
                      },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: getPaymentColor(item.payment_status) }]}>
                      {item.payment_status}
                    </Text>
                  </View>
                </View>
                <View style={[styles.cardBody, { borderTopColor: colors.surfaceVariant }]}>
                  <View style={styles.infoRow}>
                    <Ionicons name="phone-portrait-outline" size={14} color={colors.textMuted} />
                    <Text style={[styles.infoText, { color: colors.textMuted }]}>
                      {profile?.phone || 'No phone'}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="trophy-outline" size={14} color={colors.textMuted} />
                    <Text style={[styles.infoText, { color: colors.text }]}>
                      {event?.title || 'Unknown Event'}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                    <Text style={[styles.infoText, { color: colors.textMuted }]}>
                      Registered: {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="pricetag-outline" size={14} color={colors.textMuted} />
                    <Text style={[styles.infoText, { color: colors.primary, fontWeight: '700' }]}>
                      Entry Fee: {CURRENCY_SYMBOL}{event?.price || 0}
                    </Text>
                  </View>
                </View>
              </Card>
            );
          }}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: Spacing.xl, paddingBottom: Spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  title: { fontSize: FontSize.hero, fontWeight: '900' },
  subtitle: { fontSize: FontSize.body, marginTop: Spacing.xs },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  listContent: { padding: Spacing.xl, paddingTop: 0 },
  card: { marginBottom: Spacing.lg },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  playerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  avatarText: { fontSize: FontSize.bodyLg, fontWeight: '900' },
  playerDetails: { flex: 1 },
  playerName: { fontSize: FontSize.bodyLg, fontWeight: '700' },
  playerEmail: { fontSize: FontSize.caption, marginTop: 2 },
  badge: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.metric, borderWidth: 1 },
  badgeText: { fontSize: FontSize.label, fontWeight: '700', textTransform: 'capitalize' },
  cardBody: { borderTopWidth: 1, paddingTop: Spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  infoText: { fontSize: FontSize.body },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyCard: { alignItems: 'center', paddingVertical: Spacing.xxxl * 2 },
  emptyText: { fontSize: FontSize.bodyLg, fontWeight: '700', marginBottom: Spacing.md, marginTop: Spacing.xl },
  emptySubtext: { fontSize: FontSize.body, textAlign: 'center' },
});
