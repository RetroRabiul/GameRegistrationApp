import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Spacing, FontSize, BorderRadius } from '../../constants';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { useEventStore } from '../../store/eventStore';
import { useTheme } from '../../theme/ThemeContext';
import { GameEvent, GameType, GameMode, Platform } from '../../types';
import { MainStackParamList } from '../../navigation/MainNavigator';

interface EditEventScreenProps {
  navigation: NativeStackNavigationProp<MainStackParamList, 'EditEvent'>;
  route: RouteProp<MainStackParamList, 'EditEvent'>;
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

export const EditEventScreen: React.FC<EditEventScreenProps> = ({ navigation, route }) => {
  const { event } = route.params;
  const { updateEvent, loading } = useEventStore();
  const { colors } = useTheme();

  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description || '');
  const [gameType, setGameType] = useState<GameType>(event.game_type || 'freefire');
  const [gameMode, setGameMode] = useState<GameMode>(event.game_mode || 'squad');
  const [platform, setPlatform] = useState<Platform>(event.platform || 'mobile');
  const [prizePool, setPrizePool] = useState((event.prize_pool || 0).toString());
  const [teamSize, setTeamSize] = useState((event.team_size || 1).toString());
  const [date, setDate] = useState(event.date);
  const [time, setTime] = useState(event.time);
  const [location, setLocation] = useState(event.location);
  const [price, setPrice] = useState(event.price.toString());
  const [maxSlots, setMaxSlots] = useState(event.max_slots.toString());
  const [status, setStatus] = useState(event.status);

  const handleUpdate = async () => {
    if (!title.trim() || !date.trim() || !time.trim() || !location.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const success = await updateEvent(event.id, {
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
      status: status as GameEvent['status'],
    });

    if (success) {
      Alert.alert('Success', 'Event updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Error', 'Failed to update event');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Edit Event</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Update event details
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

        <Input label="Event Title *" value={title} onChangeText={setTitle} />
        <Input label="Description" value={description} onChangeText={setDescription} multiline />
        <Input label="Date *" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
        <Input label="Time *" value={time} onChangeText={setTime} placeholder="HH:MM" />
        <Input label="Location *" value={location} onChangeText={setLocation} />
        <Input label="Entry Fee (BDT) *" value={price} onChangeText={setPrice} keyboardType="numeric" />
        <Input label="Max Slots *" value={maxSlots} onChangeText={setMaxSlots} keyboardType="numeric" />

        <View style={styles.statusSection}>
          <Text style={[styles.statusLabel, { color: colors.text }]}>Event Status</Text>
          <View style={styles.statusOptions}>
            {(['upcoming', 'ongoing', 'completed', 'cancelled'] as const).map((s) => (
              <Button
                key={s}
                title={s}
                onPress={() => setStatus(s)}
                variant={status === s ? 'primary' : 'outline'}
                fullWidth={false}
                style={styles.statusButton}
              />
            ))}
          </View>
        </View>

        <Button
          title="Save Changes"
          onPress={handleUpdate}
          loading={loading}
          style={styles.saveButton}
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
  statusSection: {
    marginBottom: Spacing.xl,
  },
  statusLabel: {
    fontSize: FontSize.body,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statusButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    minHeight: 38,
  },
  saveButton: {
    marginTop: Spacing.md,
  },
});
