import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useEventStore } from '../../store/eventStore';
import { GameEvent } from '../../types';

type AdminStackParamList = {
  ManageEvents: undefined;
  CreateEvent: undefined;
  EditEvent: { event: GameEvent };
  ViewRegistrations: { event: GameEvent };
};

interface ManageEventsScreenProps {
  navigation: NativeStackNavigationProp<AdminStackParamList, 'ManageEvents'>;
}

export const ManageEventsScreen: React.FC<ManageEventsScreenProps> = ({ navigation }) => {
  const { events, loading, fetchEvents, deleteEvent } = useEventStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${title}"? This will also delete all registrations.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteEvent(id);
            if (success) {
              Alert.alert('Success', 'Event deleted');
            } else {
              Alert.alert('Error', 'Failed to delete event');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading && events.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Manage Events</Text>
          <Text style={styles.subtitle}>{events.length} total events</Text>
        </View>
        <Button
          title="+ New"
          onPress={() => navigation.navigate('CreateEvent')}
          style={styles.createButton}
        />
      </View>

      {events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyText}>No events created yet</Text>
          <Button
            title="Create Your First Event"
            onPress={() => navigation.navigate('CreateEvent')}
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
                <View style={[
                  styles.statusBadge,
                  item.status === 'upcoming' && styles.statusUpcoming,
                  item.status === 'completed' && styles.statusCompleted,
                  item.status === 'cancelled' && styles.statusCancelled,
                ]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              <View style={styles.details}>
                <Text style={styles.detailText}>📅 {formatDate(item.date)} | 🕐 {item.time?.substring(0, 5)}</Text>
                <Text style={styles.detailText}>📍 {item.location}</Text>
                <Text style={styles.detailText}>
                  👥 {item.filled_slots}/{item.max_slots} | 💰 ৳{item.price}
                </Text>
              </View>

              <View style={styles.actions}>
                <Button
                  title="Registrations"
                  onPress={() => navigation.navigate('ViewRegistrations', { event: item })}
                  variant="outline"
                  style={styles.actionButton}
                />
                <Button
                  title="Edit"
                  onPress={() => navigation.navigate('EditEvent', { event: item })}
                  style={styles.actionButton}
                />
                <Button
                  title="Delete"
                  onPress={() => handleDelete(item.id, item.title)}
                  variant="danger"
                  style={styles.actionButton}
                />
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  createButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 40,
  },
  listContent: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  eventTitle: {
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
  statusUpcoming: { backgroundColor: Colors.info + '20' },
  statusCompleted: { backgroundColor: Colors.success + '20' },
  statusCancelled: { backgroundColor: Colors.error + '20' },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
    color: Colors.text,
  },
  details: {
    marginBottom: Spacing.sm,
  },
  detailText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    minHeight: 38,
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
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    minWidth: 200,
  },
});
