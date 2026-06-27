import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useRegistrationStore } from '../../store/registrationStore';
import { Registration, GameEvent } from '../../types';

type AdminStackParamList = {
  ManageEvents: undefined;
  CreateEvent: undefined;
  EditEvent: undefined;
  ViewRegistrations: { event: GameEvent };
};

interface ViewRegistrationsScreenProps {
  route: RouteProp<AdminStackParamList, 'ViewRegistrations'>;
}

export const ViewRegistrationsScreen: React.FC<ViewRegistrationsScreenProps> = ({ route }) => {
  const { event } = route.params;
  const { fetchEventRegistrations } = useRegistrationStore();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    setLoading(true);
    const data = await fetchEventRegistrations(event.id);
    setRegistrations(data);
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
      case 'paid': return Colors.success;
      case 'pending': return Colors.warning;
      case 'failed': return Colors.error;
      default: return Colors.textLight;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.subtitle}>Registrations</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{registrations.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: Colors.success }]}>{paidCount}</Text>
          <Text style={styles.statLabel}>Paid</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: Colors.warning }]}>
            {registrations.length - paidCount}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: Colors.primary }]}>৳{totalRevenue}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>

      {registrations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No registrations yet</Text>
        </View>
      ) : (
        <FlatList
          data={registrations}
          renderItem={({ item }) => {
            const profile = item.profile;
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.playerName}>{profile?.full_name || 'Unknown'}</Text>
                    <Text style={styles.playerEmail}>{profile?.email || ''}</Text>
                  </View>
                  <View style={[
                    styles.paymentBadge,
                    { backgroundColor: getPaymentColor(item.payment_status) + '20' },
                  ]}>
                    <Text style={[styles.paymentText, { color: getPaymentColor(item.payment_status) }]}>
                      {item.payment_status}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDetails}>
                  {profile?.phone && (
                    <Text style={styles.detailText}>📱 {profile.phone}</Text>
                  )}
                  <Text style={styles.detailText}>
                    📅 Registered: {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                  <Text style={styles.detailText}>
                    Status: {item.status}
                  </Text>
                </View>
              </View>
            );
          }}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    margin: Spacing.xs,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  listContent: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  playerName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  playerEmail: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  paymentBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  paymentText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  detailText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
});
