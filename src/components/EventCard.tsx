import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants';
import { GameEvent } from '../types';

interface EventCardProps {
  event: GameEvent;
  onPress: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const slotsLeft = event.max_slots - event.filled_slots;
  const isFull = slotsLeft <= 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
        <View style={[
          styles.statusBadge,
          event.status === 'upcoming' && styles.statusUpcoming,
          event.status === 'ongoing' && styles.statusOngoing,
          event.status === 'completed' && styles.statusCompleted,
          event.status === 'cancelled' && styles.statusCancelled,
        ]}>
          <Text style={styles.statusText}>{event.status}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>{event.description}</Text>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📅</Text>
          <Text style={styles.detailText}>{formatDate(event.date)}</Text>
          <Text style={styles.detailIcon}>🕐</Text>
          <Text style={styles.detailText}>{event.time?.substring(0, 5)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📍</Text>
          <Text style={styles.detailText} numberOfLines={1}>{event.location}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.price}>৳{event.price}</Text>
        <Text style={[styles.slots, isFull && styles.slotsFull]}>
          {isFull ? 'Full' : `${slotsLeft} slots left`}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusUpcoming: {
    backgroundColor: Colors.info + '20',
  },
  statusOngoing: {
    backgroundColor: Colors.success + '20',
  },
  statusCompleted: {
    backgroundColor: Colors.textLight + '20',
  },
  statusCancelled: {
    backgroundColor: Colors.error + '20',
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
    color: Colors.text,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  details: {
    marginBottom: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  detailIcon: {
    fontSize: FontSize.sm,
    marginRight: Spacing.xs,
  },
  detailText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginRight: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  price: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.primary,
  },
  slots: {
    fontSize: FontSize.sm,
    color: Colors.success,
    fontWeight: '600',
  },
  slotsFull: {
    color: Colors.error,
  },
});
