import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius, CURRENCY_SYMBOL } from '../../constants';
import { Card } from '../../components/Card';
import { MetricCard } from '../../components/MetricCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useRegistrationStore } from '../../store/registrationStore';
import { useTheme } from '../../theme/ThemeContext';
import { Registration, GameEvent } from '../../types';
import { MainStackParamList } from '../../navigation/MainNavigator';

interface ViewRegistrationsScreenProps {
  route: RouteProp<MainStackParamList, 'ViewRegistrations'>;
}

export const ViewRegistrationsScreen: React.FC<ViewRegistrationsScreenProps> = ({ route }) => {
  const { event } = route.params;
  const { fetchEventRegistrations } = useRegistrationStore();
  const { colors } = useTheme();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    setLoading(true);
    const data = await fetchEventRegistrations(event.id);
    const sorted = [...data].sort((a, b) => (a.slot_number ?? 999) - (b.slot_number ?? 999));
    setRegistrations(sorted);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRegistrations();
    setRefreshing(false);
  };

  const paidCount = registrations.filter(r => r.payment_status === 'paid').length;
  const totalRevenue = paidCount * event.price;

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'paid': return colors.tertiary;
      case 'pending': return colors.gold;
      case 'failed': return colors.error;
      default: return colors.textMuted;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{event.title}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Registrations</Text>
      </View>

      <View style={styles.statsRow}>
        <MetricCard icon="people-outline" value={registrations.length} label="Total" />
        <MetricCard icon="checkmark-circle-outline" value={paidCount} label="Paid" accentColor={colors.tertiary} />
        <MetricCard icon="time-outline" value={registrations.length - paidCount} label="Pending" accentColor={colors.gold} />
        <MetricCard icon="cash-outline" value={totalRevenue} label="Revenue" accentColor={colors.primary} />
      </View>

      {registrations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Card style={styles.emptyCard}>
            <Ionicons name="people-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No registrations yet</Text>
          </Card>
        </View>
      ) : (
        <FlatList
          data={registrations}
          renderItem={({ item }) => {
            const profile = item.profile;
            return (
              <Card style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.playerInfo}>
                    <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.avatarText, { color: colors.primary }]}>
                        {profile?.full_name?.charAt(0).toUpperCase() || '?'}
                      </Text>
                    </View>
                    <View>
                      <Text style={[styles.playerName, { color: colors.text }]}>
                        {profile?.full_name || 'Unknown'}
                      </Text>
                      <Text style={[styles.playerEmail, { color: colors.textMuted }]}>
                        {profile?.email || ''}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.paymentBadge,
                      {
                        backgroundColor: getPaymentColor(item.payment_status) + '15',
                        borderColor: getPaymentColor(item.payment_status),
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.paymentText,
                        { color: getPaymentColor(item.payment_status) },
                      ]}
                    >
                      {item.payment_status}
                    </Text>
                  </View>
                </View>

                <View style={[styles.cardDetails, { borderTopColor: colors.surfaceVariant }]}>
                  {item.slot_number != null && (
                    <View style={styles.slotBadgeRow}>
                      <View style={[styles.slotBadge, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
                        <Ionicons name="grid-outline" size={14} color={colors.primary} />
                        <Text style={[styles.slotBadgeText, { color: colors.primary }]}>
                          Slot #{item.slot_number}
                        </Text>
                      </View>
                    </View>
                  )}
                  {profile?.phone && (
                    <View style={styles.detailRow}>
                      <Ionicons name="phone-portrait-outline" size={14} color={colors.textMuted} />
                      <Text style={[styles.detailText, { color: colors.textMuted }]}>
                        {profile.phone}
                      </Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                    <Text style={[styles.detailText, { color: colors.textMuted }]}>
                      Registered: {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="pricetag-outline" size={14} color={colors.textMuted} />
                    <Text style={[styles.detailText, { color: colors.primary, fontWeight: '700' }]}>
                      Entry Fee: {CURRENCY_SYMBOL}{event.price}
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
  title: { fontSize: FontSize.title, fontWeight: '900' },
  subtitle: { fontSize: FontSize.body, marginTop: Spacing.xs },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  listContent: { padding: Spacing.xl, paddingTop: 0 },
  card: { marginBottom: Spacing.lg },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  playerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  avatarText: { fontSize: FontSize.body, fontWeight: '900' },
  playerName: { fontSize: FontSize.bodyLg, fontWeight: '700' },
  playerEmail: { fontSize: FontSize.caption, marginTop: 2 },
  paymentBadge: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.metric, borderWidth: 1 },
  paymentText: { fontSize: FontSize.label, fontWeight: '700', textTransform: 'capitalize' },
  cardDetails: { borderTopWidth: 1, paddingTop: Spacing.md },
  slotBadgeRow: { marginBottom: Spacing.md },
  slotBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.metric, borderWidth: 1, alignSelf: 'flex-start' },
  slotBadgeText: { fontSize: FontSize.label, fontWeight: '700' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  detailText: { fontSize: FontSize.body },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyCard: { alignItems: 'center', paddingVertical: Spacing.xxxl * 2 },
  emptyText: { fontSize: FontSize.bodyLg, fontWeight: '700', marginTop: Spacing.xl },
});
