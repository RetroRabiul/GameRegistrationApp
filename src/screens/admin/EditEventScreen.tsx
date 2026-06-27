import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useEventStore } from '../../store/eventStore';
import { GameEvent } from '../../types';

type AdminStackParamList = {
  ManageEvents: undefined;
  CreateEvent: undefined;
  EditEvent: { event: GameEvent };
  ViewRegistrations: undefined;
};

interface EditEventScreenProps {
  navigation: NativeStackNavigationProp<AdminStackParamList, 'EditEvent'>;
  route: RouteProp<AdminStackParamList, 'EditEvent'>;
}

export const EditEventScreen: React.FC<EditEventScreenProps> = ({ navigation, route }) => {
  const { event } = route.params;
  const { updateEvent, loading } = useEventStore();

  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description || '');
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
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.title}>Edit Event</Text>
        <Text style={styles.subtitle}>Update event details</Text>
      </View>

      <View style={styles.form}>
        <Input label="Event Title *" value={title} onChangeText={setTitle} />
        <Input label="Description" value={description} onChangeText={setDescription} multiline />
        <Input label="Date *" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
        <Input label="Time *" value={time} onChangeText={setTime} placeholder="HH:MM" />
        <Input label="Location *" value={location} onChangeText={setLocation} />
        <Input label="Price (BDT) *" value={price} onChangeText={setPrice} keyboardType="numeric" />
        <Input label="Max Slots *" value={maxSlots} onChangeText={setMaxSlots} keyboardType="numeric" />

        <View style={styles.statusSection}>
          <Text style={styles.statusLabel}>Event Status</Text>
          <View style={styles.statusOptions}>
            {(['upcoming', 'ongoing', 'completed', 'cancelled'] as const).map((s) => (
              <Button
                key={s}
                title={s}
                onPress={() => setStatus(s)}
                variant={status === s ? 'primary' : 'outline'}
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
      </View>
    </ScrollView>
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
  form: {
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    marginTop: 0,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statusSection: {
    marginBottom: Spacing.md,
  },
  statusLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statusButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 38,
  },
  saveButton: {
    marginTop: Spacing.md,
  },
});
