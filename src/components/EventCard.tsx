import React, { useRef } from 'react';
import { Animated, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants';
import { GameEvent } from '../types';

interface EventCardProps {
  event: GameEvent;
  onPress: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const slotsLeft = event.max_slots - event.filled_slots;
  const isFull = slotsLeft <= 0;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

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

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.border, Colors.primary],
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
      >
        <Animated.View style={[styles.card, { borderColor }]}>
          <LinearGradient
            colors={[Colors.surface, Colors.surfaceLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
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
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  cardGradient: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
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
    borderWidth: 1,
  },
  statusUpcoming: {
    backgroundColor: Colors.info + '20',
    borderColor: Colors.info,
  },
  statusOngoing: {
    backgroundColor: Colors.success + '20',
    borderColor: Colors.success,
  },
  statusCompleted: {
    backgroundColor: Colors.textLight + '20',
    borderColor: Colors.textLight,
  },
  statusCancelled: {
    backgroundColor: Colors.error + '20',
    borderColor: Colors.error,
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
