import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius, CURRENCY_SYMBOL } from '../../constants';
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

const GAME_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  freefire: 'flame',
  bgmi: 'aperture',
  pubg: 'shield',
  cod: 'hardware-chip',
  valorant: 'flash',
  other: 'game-controller',
};

const GAME_LABELS: Record<string, string> = {
  freefire: 'Free Fire',
  bgmi: 'BGMI',
  pubg: 'PUBG',
  cod: 'COD',
  valorant: 'Valorant',
  other: 'Other',
};

export const EventDetailScreen: React.FC<EventDetailScreenProps> = ({ navigation, route }) => {
  const { event } = route.params;
  const { registerForEvent, loading } = useRegistrationStore();
  const { colors } = useTheme();
  const [registering, setRegistering] = useState(false);

  const slotsLeft = event.max_slots - event.filled_slots;
  const isFull = slotsLeft <= 0;
  const isLive = event.status === 'ongoing';
  const gameType = event.game_type || 'other';
  const gameMode = event.game_mode || 'squad';

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleRegister = async () => {
    setRegistering(true);
    const result = await registerForEvent(event.id);
    setRegistering(false);

    if (result.success && result.registrationId) {
      const slotInfo = result.slotNumber ? `\n\nYour assigned slot: #${result.slotNumber}` : '';
      Alert.alert(
        'Registration Successful!',
        `You've registered for ${event.title}.${slotInfo}\n\nAmount to pay: ${CURRENCY_SYMBOL}${event.price}\n\nPlease complete the payment via bKash to confirm your spot.`,
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
      Alert.alert('Registration Failed', result.message || 'Failed to register for this event.');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.imagePlaceholder, { backgroundColor: colors.primary + '15' }]}>
        <Ionicons name={GAME_ICONS[gameType] || 'game-controller'} size={80} color={colors.primary} />
        <View style={styles.gameBadgeOverlay}>
          <Text style={[styles.gameBadgeText, { color: colors.primary }]}>
            {GAME_LABELS[gameType] || gameType}
          </Text>
          <Text style={[styles.gameModeText, { color: colors.textMuted }]}>
            {gameMode.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.statusRow}>
          {isLive && (
            <View style={styles.liveBadge}>
              <PulsingDot color={colors.primary} size={6} />
              <Text style={[styles.liveText, { color: colors.primary }]}>LIVE</Text>
            </View>
          )}
          <View style={[styles.statusBadge, { borderColor: colors.primary, backgroundColor: colors.primary + '15' }]}>
            <Text style={[styles.statusText, { color: colors.primary }]}>{event.status}</Text>
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
            <View style={styles.infoLabelRow}>
              <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Date</Text>
            </View>
            <Text style={[styles.infoValue, { color: colors.text }]}>{formatDate(event.date)}</Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: colors.surfaceVariant }]} />
          <View style={styles.infoRow}>
            <View style={styles.infoLabelRow}>
              <Ionicons name="time-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Time</Text>
            </View>
            <Text style={[styles.infoValue, { color: colors.text }]}>{event.time?.substring(0, 5)}</Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: colors.surfaceVariant }]} />
          <View style={styles.infoRow}>
            <View style={styles.infoLabelRow}>
              <Ionicons name="location-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Location</Text>
            </View>
            <Text style={[styles.infoValue, { color: colors.text }]}>{event.location}</Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: colors.surfaceVariant }]} />
          <View style={styles.infoRow}>
            <View style={styles.infoLabelRow}>
              <Ionicons name="people-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Slots</Text>
            </View>
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
            <Text style={[styles.priceValue, { color: colors.primary }]}>{CURRENCY_SYMBOL}{event.price}</Text>
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
  container: { flex: 1 },
  imagePlaceholder: { height: 200, justifyContent: 'center', alignItems: 'center' },
  gameBadgeOverlay: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.md },
  gameBadgeText: { fontSize: FontSize.bodyLg, fontWeight: '800', textTransform: 'uppercase' },
  gameModeText: { fontSize: FontSize.caption, fontWeight: '700', textTransform: 'uppercase' },
  content: { padding: Spacing.xl },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, gap: Spacing.md },
  liveBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.metric, borderWidth: 1, borderColor: '#00E5FF', backgroundColor: '#00E5FF15' },
  liveText: { fontSize: FontSize.label, fontWeight: '700', marginLeft: Spacing.md },
  statusBadge: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.metric, borderWidth: 1 },
  statusText: { fontSize: FontSize.label, fontWeight: '700', textTransform: 'capitalize' },
  fullBadge: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.metric, borderWidth: 1 },
  fullText: { fontSize: FontSize.label, fontWeight: '700' },
  title: { fontSize: FontSize.hero, fontWeight: '900', marginBottom: Spacing.xl },
  infoCard: { marginBottom: Spacing.xl },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md },
  infoLabelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  infoDivider: { height: 1 },
  infoLabel: { fontSize: FontSize.caption, fontWeight: '700', textTransform: 'uppercase' },
  infoValue: { fontSize: FontSize.body, fontWeight: '700' },
  descriptionCard: { marginBottom: Spacing.xl },
  descriptionTitle: { fontSize: FontSize.cardTitle, fontWeight: '700', marginBottom: Spacing.md },
  description: { fontSize: FontSize.body, lineHeight: 24 },
  priceCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: FontSize.body, marginBottom: Spacing.xs },
  priceValue: { fontSize: FontSize.hero, fontWeight: '900' },
  registerButton: { minWidth: 160 },
});
