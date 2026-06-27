import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { Spacing, FontSize, BorderRadius } from '../../constants';
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
        <MetricCard icon="⊕" value={registrations.length} label="Total" />
        <MetricCard
          icon="◈"
          value={paidCount}
          label="Paid"
          accentColor={colors.tertiary}
        />
        <MetricCard
          icon="◷"
          value={registrations.length - paidCount}
          label="Pending"
          accentColor={colors.gold}
        />
        <MetricCard
          icon="◈"
          value={`৳${totalRevenue}`}
          label="Revenue"
          accentColor={colors.primary}
        />
      </View>

      {registrations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyIcon, { color: colors.textMuted }]}>⊕</Text>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No registrations yet
            </Text>
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
                  <View>
                    <Text style={[styles.playerName, { color: colors.text }]}>
                      {profile?.full_name || 'Unknown'}
                    </Text>
                    <Text style={[styles.playerEmail, { color: colors.textMuted }]}>
                      {profile?.email || ''}
                    </Text>
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
                  {profile?.phone && (
                    <Text style={[styles.detailText, { color: colors.textMuted }]}>
                      {profile.phone}
                    </Text>
                  )}
                  <Text style={[styles.detailText, { color: colors.textMuted }]}>
                    Registered: {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                  <Text style={[styles.detailText, { color: colors.textMuted }]}>
                    Status: {item.status}
                  </Text>
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
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: FontSize.body,
    marginTop: Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  listContent: {
    padding: Spacing.xl,
    paddingTop: 0,
  },
  card: {
    marginBottom: Spacing.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  playerName: {
    fontSize: FontSize.bodyLg,
    fontWeight: '700',
  },
  playerEmail: {
    fontSize: FontSize.caption,
    marginTop: 2,
  },
  paymentBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.metric,
    borderWidth: 1,
  },
  paymentText: {
    fontSize: FontSize.label,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  cardDetails: {
    borderTopWidth: 1,
    paddingTop: Spacing.md,
  },
  detailText: {
    fontSize: FontSize.body,
    marginBottom: Spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
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
  },
});
