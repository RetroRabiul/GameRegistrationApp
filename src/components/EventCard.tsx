import React, { useRef } from 'react';
import { Animated, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius } from '../constants';
import { useTheme } from '../theme/ThemeContext';
import { GameEvent } from '../types';
import { PulsingDot } from './PulsingDot';

interface EventCardProps {
  event: GameEvent;
  onPress: () => void;
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

export const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slotsLeft = event.max_slots - event.filled_slots;
  const isFull = slotsLeft <= 0;
  const isLive = event.status === 'ongoing';

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
      tension: 40,
    }).start();
  };

  const getStatusColor = () => {
    switch (event.status) {
      case 'upcoming': return colors.primary;
      case 'ongoing': return colors.primary;
      case 'completed': return colors.textMuted;
      case 'cancelled': return colors.error;
      default: return colors.textMuted;
    }
  };

  const gameType = event.game_type || 'other';
  const gameMode = event.game_mode || 'squad';
  const prizePool = event.prize_pool || 0;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: isLive ? colors.surfaceVariant : colors.surface,
              borderColor: isLive ? colors.primary : colors.surfaceVariant,
            },
          ]}
        >
          <View style={styles.gameBadge}>
            <Ionicons name={GAME_ICONS[gameType] || 'game-controller'} size={18} color={colors.primary} />
            <Text style={[styles.gameLabel, { color: colors.primary }]}>
              {GAME_LABELS[gameType] || gameType}
            </Text>
            <Text style={[styles.modeLabel, { color: colors.textMuted }]}>
              {gameMode.toUpperCase()}
            </Text>
          </View>

          <View style={styles.header}>
            <View style={styles.titleRow}>
              {isLive && <PulsingDot color={colors.primary} size={8} style={styles.liveDot} />}
              <Text
                style={[styles.title, { color: colors.text }]}
                numberOfLines={1}
              >
                {event.title}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  borderColor: getStatusColor(),
                  backgroundColor: getStatusColor() + '15',
                },
              ]}
            >
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {event.status}
              </Text>
            </View>
          </View>

          <Text style={[styles.description, { color: colors.textMuted }]} numberOfLines={2}>
            {event.description}
          </Text>

          {prizePool > 0 && (
            <View style={[styles.prizeBanner, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.prizeLabel, { color: colors.textMuted }]}>Prize Pool</Text>
              <Text style={[styles.prizeValue, { color: colors.primary }]}>৳{prizePool}</Text>
            </View>
          )}

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailText, { color: colors.textMuted }]}>
                {formatDate(event.date)}
              </Text>
              <Text style={[styles.detailSeparator, { color: colors.surfaceVariant }]}>|</Text>
              <Text style={[styles.detailText, { color: colors.textMuted }]}>
                {event.time?.substring(0, 5)}
              </Text>
            </View>
            <Text style={[styles.detailText, { color: colors.textMuted }]} numberOfLines={1}>
              {event.location}
            </Text>
          </View>

          <View style={[styles.footer, { borderTopColor: colors.surfaceVariant }]}>
            <Text style={[styles.price, { color: colors.primary }]}>
              {event.price}
            </Text>
            <Text
              style={[
                styles.slots,
                { color: isFull ? colors.error : colors.tertiary },
              ]}
            >
              {isFull ? 'FULL' : `${slotsLeft} slots left`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.standard,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    padding: Spacing.xl,
  },
  gameBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  gameLabel: {
    fontSize: FontSize.label,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modeLabel: {
    fontSize: FontSize.label,
    fontWeight: '700',
    marginLeft: Spacing.sm,
    textTransform: 'uppercase',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.md,
  },
  liveDot: {
    marginRight: Spacing.md,
  },
  title: {
    fontSize: FontSize.cardTitle,
    fontWeight: '700',
    flex: 1,
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
  description: {
    fontSize: FontSize.body,
    marginBottom: Spacing.md,
  },
  prizeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.metric,
    marginBottom: Spacing.md,
  },
  prizeLabel: {
    fontSize: FontSize.label,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  prizeValue: {
    fontSize: FontSize.title,
    fontWeight: '900',
  },
  details: {
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  detailText: {
    fontSize: FontSize.body,
  },
  detailSeparator: {
    marginHorizontal: Spacing.md,
    fontSize: FontSize.body,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: Spacing.md,
  },
  price: {
    fontSize: FontSize.title,
    fontWeight: '900',
  },
  slots: {
    fontSize: FontSize.body,
    fontWeight: '700',
  },
});
