import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, FontSize } from '../../constants';
import { EventCard } from '../../components/EventCard';
import { AnimatedCard } from '../../components/AnimatedCard';
import { AnimatedBackground } from '../../components/AnimatedBackground';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useEventStore } from '../../store/eventStore';
import { GameEvent } from '../../types';

type PlayerStackParamList = {
  EventList: undefined;
  EventDetail: { event: GameEvent };
  MyRegistrations: undefined;
};

interface EventListScreenProps {
  navigation: NativeStackNavigationProp<PlayerStackParamList, 'EventList'>;
}

export const EventListScreen: React.FC<EventListScreenProps> = ({ navigation }) => {
  const { events, loading, fetchEvents } = useEventStore();
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

  if (loading && events.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <AnimatedBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Upcoming Events</Text>
          <Text style={styles.subtitle}>{events.length} events available</Text>
        </View>

        {events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎮</Text>
            <Text style={styles.emptyText}>No events available yet</Text>
            <Text style={styles.emptySubtext}>Check back later!</Text>
          </View>
        ) : (
          <FlatList
            data={events.filter(e => e.status === 'upcoming')}
            renderItem={({ item, index }) => (
              <AnimatedCard delay={index * 100}>
                <EventCard event={item} onPress={() => handleEventPress(item)} />
              </AnimatedCard>
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
            }
          />
        )}
      </View>
    </AnimatedBackground>
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
