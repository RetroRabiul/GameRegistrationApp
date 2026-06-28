import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius, CURRENCY_SYMBOL } from '../../constants';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useEventStore } from '../../store/eventStore';
import { useTheme } from '../../theme/ThemeContext';
import { GameEvent } from '../../types';
import { MainStackParamList } from '../../navigation/MainNavigator';

export const ManageEventsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { events, loading, fetchEvents, deleteEvent } = useEventStore();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return colors.primary;
      case 'ongoing': return colors.tertiary;
      case 'completed': return colors.textMuted;
      case 'cancelled': return colors.error;
      default: return colors.textMuted;
    }
  };

  if (loading && events.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Manage Events</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {events.length} total events
          </Text>
        </View>
        <Button
          title="+ New"
          onPress={() => navigation.navigate('CreateEvent')}
          fullWidth={false}
          style={styles.createButton}
        />
      </View>

      {events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Card style={styles.emptyCard}>
            <Ionicons name="trophy-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No events created yet</Text>
            <Button
              title="Create Your First Event"
              onPress={() => navigation.navigate('CreateEvent')}
              style={styles.emptyButton}
            />
          </Card>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { borderColor: getStatusColor(item.status), backgroundColor: getStatusColor(item.status) + '15' },
                  ]}
                >
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.details}>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                  <Text style={[styles.detailText, { color: colors.textMuted }]}>
                    {formatDate(item.date)} | {item.time?.substring(0, 5)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                  <Text style={[styles.detailText, { color: colors.textMuted }]}>
                    {item.location}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="people-outline" size={14} color={colors.textMuted} />
                  <Text style={[styles.detailText, { color: colors.textMuted }]}>
                    {item.filled_slots}/{item.max_slots} slots
                  </Text>
                  <Text style={[styles.detailText, { color: colors.primary, fontWeight: '700', marginLeft: Spacing.md }]}>
                    {CURRENCY_SYMBOL}{item.price}
                  </Text>
                </View>
              </View>

              <View style={[styles.actions, { borderTopColor: colors.surfaceVariant }]}>
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: colors.primary + '40', backgroundColor: colors.primary + '10' }]}
                  onPress={() => navigation.navigate('ViewRegistrations', { event: item })}
                  activeOpacity={0.7}
                >
                  <Ionicons name="people-outline" size={16} color={colors.primary} />
                  <Text style={[styles.actionBtnText, { color: colors.primary }]}>Players</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: colors.secondary + '40', backgroundColor: colors.secondary + '10' }]}
                  onPress={() => navigation.navigate('EditEvent', { event: item })}
                  activeOpacity={0.7}
                >
                  <Ionicons name="create-outline" size={16} color={colors.secondary} />
                  <Text style={[styles.actionBtnText, { color: colors.secondary }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: colors.error + '40', backgroundColor: colors.error + '10' }]}
                  onPress={() => handleDelete(item.id, item.title)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.error} />
                  <Text style={[styles.actionBtnText, { color: colors.error }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.xl, paddingBottom: Spacing.md },
  title: { fontSize: FontSize.hero, fontWeight: '900' },
  subtitle: { fontSize: FontSize.body, marginTop: Spacing.xs },
  createButton: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, minHeight: 40 },
  listContent: { padding: Spacing.xl, paddingTop: 0 },
  card: { marginBottom: Spacing.xl },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  eventTitle: { fontSize: FontSize.cardTitle, fontWeight: '700', flex: 1, marginRight: Spacing.md },
  statusBadge: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.metric, borderWidth: 1 },
  statusText: { fontSize: FontSize.label, fontWeight: '700', textTransform: 'capitalize' },
  details: { marginBottom: Spacing.md },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  detailText: { fontSize: FontSize.body },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, paddingTop: Spacing.md, gap: Spacing.md },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.metric, borderWidth: 1, gap: Spacing.sm },
  actionBtnText: { fontSize: FontSize.caption, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyCard: { alignItems: 'center', paddingVertical: Spacing.xxxl * 2 },
  emptyText: { fontSize: FontSize.bodyLg, fontWeight: '700', marginBottom: Spacing.xl, marginTop: Spacing.xl },
  emptyButton: { minWidth: 200 },
});
