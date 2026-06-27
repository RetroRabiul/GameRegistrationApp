import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Spacing, FontSize, BorderRadius } from '../../constants';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useRegistrationStore } from '../../store/registrationStore';
import { useTheme } from '../../theme/ThemeContext';
import { Registration } from '../../types';
import { MainStackParamList } from '../../navigation/MainNavigator';

export const MyRegistrationsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { registrations, loading, fetchMyRegistrations, cancelRegistration } = useRegistrationStore();
  const { colors } = useTheme();
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
      case 'paid': return colors.tertiary;
      case 'pending': return colors.gold;
      case 'failed': return colors.error;
      default: return colors.textMuted;
    }
  };

  const getRegistrationStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return colors.tertiary;
      case 'pending': return colors.gold;
      case 'cancelled': return colors.error;
      default: return colors.textMuted;
    }
  };

  if (loading && registrations.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>My Registrations</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {registrations.length} registrations
        </Text>
      </View>

      {registrations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyIcon, { color: colors.textMuted }]}>⊕</Text>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No registrations yet
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
              Register for an event to see it here
            </Text>
          </Card>
        </View>
      ) : (
        <FlatList
          data={registrations}
          renderItem={({ item }) => {
            const event = item.event;
            return (
              <Card style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text
                    style={[styles.eventTitle, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {event?.title || 'Unknown Event'}
                  </Text>
                  <View
                    style={[
                      styles.regStatusBadge,
                      {
                        backgroundColor: getRegistrationStatusColor(item.status) + '15',
                        borderColor: getRegistrationStatusColor(item.status),
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.regStatusText,
                        { color: getRegistrationStatusColor(item.status) },
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                {event && (
                  <>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailText, { color: colors.textMuted }]}>
                        {formatDate(event.date)} at {event.time?.substring(0, 5)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailText, { color: colors.textMuted }]}>
                        {event.location}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailText, { color: colors.primary, fontWeight: '700' }]}>
                        ৳{event.price}
                      </Text>
                    </View>
                  </>
                )}

                <View style={[styles.paymentRow, { borderTopColor: colors.surfaceVariant }]}>
                  <View style={styles.paymentStatusContainer}>
                    <Text style={[styles.paymentLabel, { color: colors.textMuted }]}>Payment:</Text>
                    <View
                      style={[
                        styles.paymentBadge,
                        {
                          backgroundColor: getPaymentStatusColor(item.payment_status) + '15',
                          borderColor: getPaymentStatusColor(item.payment_status),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.paymentStatusText,
                          { color: getPaymentStatusColor(item.payment_status) },
                        ]}
                      >
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
                        fullWidth={false}
                        style={styles.payButton}
                      />
                    )}
                    {item.status !== 'cancelled' && (
                      <Button
                        title="Cancel"
                        onPress={() => handleCancel(item.id, event?.title || '')}
                        variant="danger"
                        fullWidth={false}
                        style={styles.cancelButton}
                      />
                    )}
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
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.hero,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: FontSize.body,
    marginTop: Spacing.xs,
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
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  eventTitle: {
    fontSize: FontSize.cardTitle,
    fontWeight: '700',
    flex: 1,
    marginRight: Spacing.md,
  },
  regStatusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.metric,
    borderWidth: 1,
  },
  regStatusText: {
    fontSize: FontSize.label,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  detailRow: {
    marginBottom: Spacing.xs,
  },
  detailText: {
    fontSize: FontSize.body,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: Spacing.md,
    marginTop: Spacing.md,
  },
  paymentStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: FontSize.body,
    marginRight: Spacing.md,
  },
  paymentBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.metric,
    borderWidth: 1,
  },
  paymentStatusText: {
    fontSize: FontSize.label,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  payButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    minHeight: 36,
  },
  cancelButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    minHeight: 36,
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
    marginBottom: Spacing.md,
  },
  emptySubtext: {
    fontSize: FontSize.body,
  },
});
