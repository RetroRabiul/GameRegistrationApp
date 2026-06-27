import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Spacing, FontSize, BorderRadius } from '../../constants';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { PulsingDot } from '../../components/PulsingDot';
import { useRegistrationStore } from '../../store/registrationStore';
import { useTheme } from '../../theme/ThemeContext';
import { GameEvent } from '../../types';
import { MainStackParamList } from '../../navigation/MainNavigator';

interface EventDetailScreenProps {
  navigation: NativeStackNavigationProp<MainStackParamList, 'EventDetail'>;
  route: RouteProp<MainStackParamList, 'EventDetail'>;
}

export const EventDetailScreen: React.FC<EventDetailScreenProps> = ({ navigation, route }) => {
  const { event } = route.params;
  const { registerForEvent, loading } = useRegistrationStore();
  const { colors } = useTheme();
  const [registering, setRegistering] = useState(false);

  const slotsLeft = event.max_slots - event.filled_slots;
  const isFull = slotsLeft <= 0;
  const isLive = event.status === 'ongoing';

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
              navigation.navigate('Payment', {
                eventId: event.id,
                registrationId: result.registrationId!,
                amount: event.price,
                eventTitle: event.title,
              });
            },
          },
        ]
      );
    } else {
      Alert.alert('Error', 'Failed to register. You may already be registered or the event is full.');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.imagePlaceholder, { backgroundColor: colors.primary + '15' }]}>
        <Text style={styles.imageIcon}>🎮</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.statusRow}>
          {isLive && (
            <View style={styles.liveBadge}>
              <PulsingDot color={colors.primary} size={6} />
              <Text style={[styles.liveText, { color: colors.primary }]}>LIVE</Text>
            </View>
          )}
          <View
            style={[
              styles.statusBadge,
              {
                borderColor: colors.primary,
                backgroundColor: colors.primary + '15',
              },
            ]}
          >
            <Text style={[styles.statusText, { color: colors.primary }]}>
              {event.status}
            </Text>
          </View>
          {isFull && (
            <View style={[styles.fullBadge, { backgroundColor: colors.error + '15', borderColor: colors.error }]}>
              <Text style={[styles.fullText, { color: colors.error }]}>FULL</Text>
            </View>
          )}
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{event.title}</Text>

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Date</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{formatDate(event.date)}</Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: colors.surfaceVariant }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Time</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{event.time?.substring(0, 5)}</Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: colors.surfaceVariant }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Location</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{event.location}</Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: colors.surfaceVariant }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Slots</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {event.filled_slots} / {event.max_slots} ({slotsLeft} remaining)
            </Text>
          </View>
        </Card>

        <Card style={styles.descriptionCard}>
          <Text style={[styles.descriptionTitle, { color: colors.text }]}>About this Event</Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>{event.description}</Text>
        </Card>

        <Card style={styles.priceCard}>
          <View>
            <Text style={[styles.priceLabel, { color: colors.textMuted }]}>Registration Fee</Text>
            <Text style={[styles.priceValue, { color: colors.primary }]}>৳{event.price}</Text>
          </View>
          <Button
            title={isFull ? 'Event Full' : 'Register Now'}
            onPress={handleRegister}
            loading={registering || loading}
            disabled={isFull}
            fullWidth={false}
            style={styles.registerButton}
          />
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imagePlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIcon: {
    fontSize: 80,
  },
  content: {
    padding: Spacing.xl,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.metric,
    borderWidth: 1,
    borderColor: '#00E5FF',
    backgroundColor: '#00E5FF15',
  },
  liveText: {
    fontSize: FontSize.label,
    fontWeight: '700',
    marginLeft: Spacing.md,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.metric,
    borderWidth: 1,
  },
  statusText: {
    fontSize: FontSize.label,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  fullBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.metric,
    borderWidth: 1,
  },
  fullText: {
    fontSize: FontSize.label,
    fontWeight: '700',
  },
  title: {
    fontSize: FontSize.hero,
    fontWeight: '900',
    marginBottom: Spacing.xl,
  },
  infoCard: {
    marginBottom: Spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  infoDivider: {
    height: 1,
  },
  infoLabel: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: FontSize.body,
    fontWeight: '700',
  },
  descriptionCard: {
    marginBottom: Spacing.xl,
  },
  descriptionTitle: {
    fontSize: FontSize.cardTitle,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: FontSize.body,
    lineHeight: 24,
  },
  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: FontSize.body,
    marginBottom: Spacing.xs,
  },
  priceValue: {
    fontSize: FontSize.hero,
    fontWeight: '900',
  },
  registerButton: {
    minWidth: 160,
  },
});
