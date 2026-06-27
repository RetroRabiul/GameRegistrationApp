import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants';
import { Button } from '../../components/Button';
import { useRegistrationStore } from '../../store/registrationStore';
import { GameEvent } from '../../types';

type PlayerStackParamList = {
  EventList: undefined;
  EventDetail: { event: GameEvent };
  MyRegistrations: undefined;
};

interface EventDetailScreenProps {
  navigation: NativeStackNavigationProp<PlayerStackParamList, 'EventDetail'>;
  route: RouteProp<PlayerStackParamList, 'EventDetail'>;
}

export const EventDetailScreen: React.FC<EventDetailScreenProps> = ({ navigation, route }) => {
  const { event } = route.params;
  const { registerForEvent, loading } = useRegistrationStore();
  const [registering, setRegistering] = useState(false);

  const slotsLeft = event.max_slots - event.filled_slots;
  const isFull = slotsLeft <= 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleRegister = async () => {
    setRegistering(true);
    const result = await registerForEvent(event.id);
    setRegistering(false);

    if (result.success && result.registrationId) {
      Alert.alert(
        'Registration Successful!',
        `You've registered for ${event.title}.\n\nAmount to pay: ৳${event.price}\n\nPlease complete the payment via bKash to confirm your spot.`,
        [
          { text: 'Pay Later', style: 'cancel' },
          {
            text: 'Pay Now',
            onPress: () => {
              navigation.navigate('MyRegistrations');
            },
          },
        ]
      );
    } else {
      Alert.alert('Error', 'Failed to register. You may already be registered or the event is full.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imageIcon}>🎮</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.statusRow}>
          <View style={[
            styles.statusBadge,
            event.status === 'upcoming' && styles.statusUpcoming,
          ]}>
            <Text style={styles.statusText}>{event.status}</Text>
          </View>
          {isFull && (
            <View style={styles.fullBadge}>
              <Text style={styles.fullText}>FULL</Text>
            </View>
          )}
        </View>

        <Text style={styles.title}>{event.title}</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📅</Text>
            <View>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{formatDate(event.date)}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🕐</Text>
            <View>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>{event.time?.substring(0, 5)}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <View>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{event.location}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>👥</Text>
            <View>
              <Text style={styles.infoLabel}>Slots</Text>
              <Text style={styles.infoValue}>
                {event.filled_slots} / {event.max_slots} ({slotsLeft} remaining)
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>About this Event</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        <View style={styles.priceCard}>
          <View>
            <Text style={styles.priceLabel}>Registration Fee</Text>
            <Text style={styles.priceValue}>৳{event.price}</Text>
          </View>
          <Button
            title={isFull ? 'Event Full' : 'Register Now'}
            onPress={handleRegister}
            loading={registering || loading}
            disabled={isFull}
            style={styles.registerButton}
          />
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
  imagePlaceholder: {
    height: 200,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIcon: {
    fontSize: 80,
  },
  content: {
    padding: Spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
  statusUpcoming: {
    backgroundColor: Colors.info + '20',
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
    color: Colors.text,
  },
  fullBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.error + '20',
  },
  fullText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.error,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
    marginTop: 2,
  },
  infoLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  descriptionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  descriptionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  priceCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  priceLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  priceValue: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.primary,
  },
  registerButton: {
    minWidth: 160,
  },
});
