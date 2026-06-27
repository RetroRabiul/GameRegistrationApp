import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Spacing, FontSize } from '../../constants';
import { EventCard } from '../../components/EventCard';
import { AnimatedCard } from '../../components/AnimatedCard';
import { Card } from '../../components/Card';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useEventStore } from '../../store/eventStore';
import { useTheme } from '../../theme/ThemeContext';
import { GameEvent } from '../../types';
import { MainStackParamList } from '../../navigation/MainNavigator';

export const EventListScreen: React.FC = () => {
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

  const upcomingEvents = events.filter(e => e.status === 'upcoming' || e.status === 'ongoing');

  if (loading && events.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Events</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {upcomingEvents.length} events available
        </Text>
      </View>

      {upcomingEvents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyIcon, { color: colors.textMuted }]}>◫</Text>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No events available yet
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
              Check back later!
            </Text>
          </Card>
        </View>
      ) : (
        <FlatList
          data={upcomingEvents}
          renderItem={({ item, index }) => (
            <AnimatedCard delay={index * 100}>
              <EventCard event={item} onPress={() => handleEventPress(item)} />
            </AnimatedCard>
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
