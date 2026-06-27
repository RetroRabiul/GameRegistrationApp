import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Spacing, FontSize, BorderRadius } from '../../constants';
import { Card } from '../../components/Card';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useEventStore } from '../../store/eventStore';
import { useTheme } from '../../theme/ThemeContext';
import { GameEvent } from '../../types';
import { MainStackParamList } from '../../navigation/MainNavigator';

export const EventsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { events, loading, fetchEvents } = useEventStore();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  const handleEventPress = (event: GameEvent) => {
    navigation.navigate('EventDetail', { event });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading && events.length === 0) {
    return <LoadingSpinner />;
  }

  const upcomingEvents = events.filter(e => e.status === 'upcoming');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>All Events</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {upcomingEvents.length} upcoming events
        </Text>
      </View>

      {upcomingEvents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyIcon, { color: colors.textMuted }]}>⊕</Text>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No upcoming events
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
              Check back later for new tournaments
            </Text>
          </Card>
        </View>
      ) : (
        <FlatList
          data={upcomingEvents}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleEventPress(item)}>
              <Card style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
                    <Text style={[styles.statusText, { color: colors.primary }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.description, { color: colors.textMuted }]} numberOfLines={2}>
                  {item.description}
                </Text>

                <View style={styles.details}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailIcon, { color: colors.primary }]}></Text>
                    <Text style={[styles.detailText, { color: colors.textMuted }]}>
                      {formatDate(item.date)}
                    </Text>
                    <Text style={[styles.detailIcon, { color: colors.primary }]}></Text>
                    <Text style={[styles.detailText, { color: colors.textMuted }]}>
                      {item.time?.substring(0, 5)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailIcon, { color: colors.primary }]}></Text>
                    <Text style={[styles.detailText, { color: colors.textMuted }]} numberOfLines={1}>
                      {item.location}
                    </Text>
                  </View>
                </View>

                <View style={[styles.footer, { borderTopColor: colors.surfaceVariant }]}>
                  <Text style={[styles.price, { color: colors.primary }]}>{item.price}</Text>
                  <Text style={[styles.slots, { color: colors.tertiary }]}>
                    {item.max_slots - item.filled_slots} slots left
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          )}
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
  details: {
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  detailIcon: {
    fontSize: FontSize.body,
    marginRight: Spacing.sm,
  },
  detailText: {
    fontSize: FontSize.body,
    marginRight: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: Spacing.md,
  },
  price: {
    fontSize: FontSize.cardTitle,
    fontWeight: '700',
  },
  slots: {
    fontSize: FontSize.body,
    fontWeight: '600',
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
