import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useEventStore } from '../../store/eventStore';

type AdminStackParamList = {
  ManageEvents: undefined;
  CreateEvent: undefined;
  EditEvent: undefined;
  ViewRegistrations: undefined;
};

interface CreateEventScreenProps {
  navigation: NativeStackNavigationProp<AdminStackParamList, 'CreateEvent'>;
}

export const CreateEventScreen: React.FC<CreateEventScreenProps> = ({ navigation }) => {
  const { createEvent, loading } = useEventStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
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
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.title}>Create New Event</Text>
        <Text style={styles.subtitle}>Fill in the event details</Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Event Title *"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., BGMI Tournament Season 3"
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
          label="Price (BDT) *"
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
  createButton: {
    marginTop: Spacing.md,
  },
});
