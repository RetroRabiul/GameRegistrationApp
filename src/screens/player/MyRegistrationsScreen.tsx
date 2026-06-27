import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useRegistrationStore } from '../../store/registrationStore';
import { Registration } from '../../types';

type PlayerStackParamList = {
  EventList: undefined;
  EventDetail: undefined;
  MyRegistrations: undefined;
  Payment: { eventId: string; registrationId: string; amount: number; eventTitle: string };
};

interface MyRegistrationsScreenProps {
  navigation: NativeStackNavigationProp<PlayerStackParamList, 'MyRegistrations'>;
}

export const MyRegistrationsScreen: React.FC<MyRegistrationsScreenProps> = ({ navigation }) => {
  const { registrations, loading, fetchMyRegistrations, cancelRegistration } = useRegistrationStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMyRegistrations();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyRegistrations();
    setRefreshing(false);
  };

  const handleCancel = (id: string, eventTitle: string) => {
    Alert.alert(
      'Cancel Registration',
      `Are you sure you want to cancel your registration for "${eventTitle}"?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            const success = await cancelRegistration(id);
            if (success) {
              Alert.alert('Success', 'Registration cancelled successfully');
            } else {
              Alert.alert('Error', 'Failed to cancel registration');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return Colors.success;
      case 'pending': return Colors.warning;
      case 'failed': return Colors.error;
      default: return Colors.textLight;
    }
  };

  const getRegistrationStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return Colors.success;
      case 'pending': return Colors.warning;
      case 'cancelled': return Colors.error;
      default: return Colors.textLight;
    }
  };

  if (loading && registrations.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Registrations</Text>
        <Text style={styles.subtitle}>{registrations.length} registrations</Text>
      </View>

      {registrations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No registrations yet</Text>
          <Text style={styles.emptySubtext}>Register for an event to see it here</Text>
        </View>
      ) : (
        <FlatList
          data={registrations}
          renderItem={({ item }) => {
            const event = item.event;
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.eventTitle} numberOfLines={1}>{event?.title || 'Unknown Event'}</Text>
                  <View style={[
                    styles.regStatusBadge,
                    { backgroundColor: getRegistrationStatusColor(item.status) + '20' },
                  ]}>
                    <Text style={[styles.regStatusText, { color: getRegistrationStatusColor(item.status) }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                {event && (
                  <>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailIcon}>📅</Text>
                      <Text style={styles.detailText}>{formatDate(event.date)} at {event.time?.substring(0, 5)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailIcon}>📍</Text>
                      <Text style={styles.detailText}>{event.location}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailIcon}>💰</Text>
                      <Text style={styles.detailText}>৳{event.price}</Text>
                    </View>
                  </>
                )}

                <View style={styles.paymentRow}>
                  <View style={styles.paymentStatusContainer}>
                    <Text style={styles.paymentLabel}>Payment:</Text>
                    <View style={[
                      styles.paymentBadge,
                      { backgroundColor: getPaymentStatusColor(item.payment_status) + '20' },
                    ]}>
                      <Text style={[styles.paymentStatusText, { color: getPaymentStatusColor(item.payment_status) }]}>
                        {item.payment_status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.actionButtons}>
                    {item.status !== 'cancelled' && item.payment_status === 'pending' && event && (
                      <Button
                        title="Pay Now"
                        onPress={() => navigation.navigate('Payment', {
                          eventId: event.id,
                          registrationId: item.id,
                          amount: event.price,
                          eventTitle: event.title,
                        })}
                        style={styles.payButton}
                      />
                    )}
                    {item.status !== 'cancelled' && (
                      <Button
                        title="Cancel"
                        onPress={() => handleCancel(item.id, event?.title || '')}
                        variant="danger"
                        style={styles.cancelButton}
                      />
                    )}
                  </View>
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
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  eventTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  regStatusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  regStatusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  detailIcon: {
    fontSize: FontSize.sm,
    marginRight: Spacing.sm,
  },
  detailText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    marginTop: Spacing.sm,
  },
  paymentStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  paymentBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  paymentStatusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  payButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 36,
  },
  cancelButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 36,
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
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});
