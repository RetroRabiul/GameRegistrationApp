import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Spacing, FontSize, BorderRadius } from '../../constants';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { useEventStore } from '../../store/eventStore';
import { useTheme } from '../../theme/ThemeContext';
import { GameType, GameMode, Platform } from '../../types';
import { MainStackParamList } from '../../navigation/MainNavigator';

interface CreateEventScreenProps {
  navigation: NativeStackNavigationProp<MainStackParamList, 'CreateEvent'>;
}

const GAME_TYPES: { value: GameType; label: string; icon: string }[] = [
  { value: 'freefire', label: 'Free Fire', icon: '' },
  { value: 'bgmi', label: 'BGMI', icon: '🎯' },
  { value: 'pubg', label: 'PUBG', icon: '' },
  { value: 'cod', label: 'Call of Duty', icon: '' },
  { value: 'valorant', label: 'Valorant', icon: '⚡' },
  { value: 'other', label: 'Other', icon: '🎮' },
];

const GAME_MODES: { value: GameMode; label: string }[] = [
  { value: 'solo', label: 'Solo' },
  { value: 'duo', label: 'Duo' },
  { value: 'squad', label: 'Squad' },
  { value: 'custom', label: 'Custom' },
];

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'mobile', label: 'Mobile' },
  { value: 'pc', label: 'PC' },
  { value: 'console', label: 'Console' },
  { value: 'cross-platform', label: 'Cross-Platform' },
];

export const CreateEventScreen: React.FC<CreateEventScreenProps> = ({ navigation }) => {
  const { createEvent, loading } = useEventStore();
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [gameType, setGameType] = useState<GameType>('freefire');
  const [gameMode, setGameMode] = useState<GameMode>('squad');
  const [platform, setPlatform] = useState<Platform>('mobile');
  const [prizePool, setPrizePool] = useState('');
  const [teamSize, setTeamSize] = useState('4');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [maxSlots, setMaxSlots] = useState('');

  const validate = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return false;
    }
    if (!date.trim()) {
      Alert.alert('Error', 'Date is required (format: YYYY-MM-DD)');
      return false;
    }
    if (!time.trim()) {
      Alert.alert('Error', 'Time is required (format: HH:MM)');
      return false;
    }
    if (!location.trim()) {
      Alert.alert('Error', 'Location is required');
      return false;
    }
    if (!price || parseFloat(price) < 0) {
      Alert.alert('Error', 'Valid price is required');
      return false;
    }
    if (!maxSlots || parseInt(maxSlots) < 1) {
      Alert.alert('Error', 'Valid max slots is required');
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!validate()) return;

    const success = await createEvent({
      title: title.trim(),
      description: description.trim(),
      game_type: gameType,
      game_mode: gameMode,
      platform: platform,
      prize_pool: parseFloat(prizePool) || 0,
      team_size: parseInt(teamSize) || 1,
      date,
      time,
      location: location.trim(),
      price: parseFloat(price),
      max_slots: parseInt(maxSlots),
      status: 'upcoming',
      created_by: '',
    });

    if (success) {
      Alert.alert('Success', 'Event created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Error', 'Failed to create event');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Create New Event</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Fill in the event details
        </Text>
      </View>

      <Card style={styles.form}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Game Info</Text>

        <View style={styles.gameTypeGrid}>
          {GAME_TYPES.map((game) => (
            <TouchableOpacity
              key={game.value}
              style={[
                styles.gameTypeButton,
                {
                  borderColor: gameType === game.value ? colors.primary : colors.surfaceVariant,
                  backgroundColor: gameType === game.value ? colors.primary + '20' : colors.surface,
                },
              ]}
              onPress={() => setGameType(game.value)}
            >
              <Text style={styles.gameTypeIcon}>{game.icon}</Text>
              <Text
                style={[
                  styles.gameTypeLabel,
                  { color: gameType === game.value ? colors.primary : colors.textMuted },
                ]}
              >
                {game.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.modeRow}>
          <Text style={[styles.subLabel, { color: colors.text }]}>Mode:</Text>
          {GAME_MODES.map((mode) => (
            <TouchableOpacity
              key={mode.value}
              style={[
                styles.modeButton,
                {
                  borderColor: gameMode === mode.value ? colors.primary : colors.surfaceVariant,
                  backgroundColor: gameMode === mode.value ? colors.primary + '20' : 'transparent',
                },
              ]}
              onPress={() => setGameMode(mode.value)}
            >
              <Text
                style={[
                  styles.modeLabel,
                  { color: gameMode === mode.value ? colors.primary : colors.textMuted },
                ]}
              >
                {mode.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.modeRow}>
          <Text style={[styles.subLabel, { color: colors.text }]}>Platform:</Text>
          {PLATFORMS.map((plat) => (
            <TouchableOpacity
              key={plat.value}
              style={[
                styles.modeButton,
                {
                  borderColor: platform === plat.value ? colors.primary : colors.surfaceVariant,
                  backgroundColor: platform === plat.value ? colors.primary + '20' : 'transparent',
                },
              ]}
              onPress={() => setPlatform(plat.value)}
            >
              <Text
                style={[
                  styles.modeLabel,
                  { color: platform === plat.value ? colors.primary : colors.textMuted },
                ]}
              >
                {plat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Input
              label="Prize Pool (BDT)"
              value={prizePool}
              onChangeText={setPrizePool}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfInput}>
            <Input
              label="Team Size"
              value={teamSize}
              onChangeText={setTeamSize}
              placeholder="4"
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.text, marginTop: Spacing.lg }]}>
          Event Details
        </Text>

        <Input
          label="Event Title *"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Free Fire Tournament Season 3"
        />
        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the event, rules, prizes, etc."
          multiline
        />
        <Input
          label="Date *"
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
        />
        <Input
          label="Time *"
          value={time}
          onChangeText={setTime}
          placeholder="HH:MM (24-hour format)"
        />
        <Input
          label="Location *"
          value={location}
          onChangeText={setLocation}
          placeholder="e.g., Online / Dhaka Cyber Arena"
        />
        <Input
          label="Entry Fee (BDT) *"
          value={price}
          onChangeText={setPrice}
          placeholder="0"
          keyboardType="numeric"
        />
        <Input
          label="Max Slots *"
          value={maxSlots}
          onChangeText={setMaxSlots}
          placeholder="50"
          keyboardType="numeric"
        />

        <Button
          title="Create Event"
          onPress={handleCreate}
          loading={loading}
          style={styles.createButton}
        />
      </Card>
    </ScrollView>
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
  form: {
    margin: Spacing.xl,
    marginTop: 0,
  },
  sectionLabel: {
    fontSize: FontSize.bodyLg,
    fontWeight: '800',
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subLabel: {
    fontSize: FontSize.body,
    fontWeight: '700',
    marginRight: Spacing.md,
  },
  gameTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  gameTypeButton: {
    width: '30%',
    padding: Spacing.md,
    borderRadius: BorderRadius.standard,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  gameTypeIcon: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  gameTypeLabel: {
    fontSize: FontSize.label,
    fontWeight: '700',
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: Spacing.lg,
  },
  modeButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.metric,
    borderWidth: 1,
    marginRight: Spacing.md,
    marginBottom: Spacing.sm,
  },
  modeLabel: {
    fontSize: FontSize.label,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  createButton: {
    marginTop: Spacing.md,
  },
});
