import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius } from '../constants';
import { EventCard } from '../components/EventCard';
import { AnimatedCard } from '../components/AnimatedCard';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useEventStore } from '../store/eventStore';
import { useTheme } from '../theme/ThemeContext';
import { GameEvent, GameType } from '../types';
import { MainStackParamList } from '../navigation/MainNavigator';

const GAME_TYPES: { value: GameType | 'all'; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'all', label: 'All', icon: 'apps' },
  { value: 'freefire', label: 'Free Fire', icon: 'flame' },
  { value: 'bgmi', label: 'BGMI', icon: 'aperture' },
  { value: 'pubg', label: 'PUBG', icon: 'shield' },
  { value: 'cod', label: 'COD', icon: 'hardware-chip' },
  { value: 'valorant', label: 'Valorant', icon: 'flash' },
  { value: 'other', label: 'Other', icon: 'game-controller' },
];

export const HubScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { events, loading, fetchEvents } = useEventStore();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGameType, setSelectedGameType] = useState<GameType | 'all'>('all');

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

  const filteredEvents = upcomingEvents.filter(event => {
    const matchesSearch = searchQuery === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGameType = selectedGameType === 'all' || event.game_type === selectedGameType;
    
    return matchesSearch && matchesGameType;
  });

  if (loading && events.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Ionicons name="game-controller" size={28} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>Game Events</Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {filteredEvents.length} events available
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.surfaceVariant }]}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search events..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Game Type Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {GAME_TYPES.map((game) => (
          <TouchableOpacity
            key={game.value}
            style={[
              styles.filterChip,
              {
                borderColor: selectedGameType === game.value ? colors.primary : colors.surfaceVariant,
                backgroundColor: selectedGameType === game.value ? colors.primary + '20' : colors.surface,
              },
            ]}
            onPress={() => setSelectedGameType(game.value)}
          >
            <Ionicons
              name={game.icon}
              size={16}
              color={selectedGameType === game.value ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.filterText,
                { color: selectedGameType === game.value ? colors.primary : colors.textMuted },
              ]}
            >
              {game.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredEvents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Card style={styles.emptyCard}>
            <Ionicons name="trophy-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              {searchQuery || selectedGameType !== 'all' ? 'No events match your filters' : 'No events available yet'}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
              {searchQuery || selectedGameType !== 'all' ? 'Try adjusting your search or filters' : 'Check back later for upcoming tournaments!'}
            </Text>
          </Card>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  title: {
    fontSize: FontSize.hero,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: FontSize.body,
    marginTop: Spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.standard,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.body,
  },
  filterContainer: {
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.metric,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  filterText: {
    fontSize: FontSize.caption,
    fontWeight: '700',
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
  emptyText: {
    fontSize: FontSize.bodyLg,
    fontWeight: '700',
    marginBottom: Spacing.md,
    marginTop: Spacing.xl,
  },
  emptySubtext: {
    fontSize: FontSize.body,
    textAlign: 'center',
  },
});
