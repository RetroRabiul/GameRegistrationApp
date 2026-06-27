import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '../constants';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { ManageEventsScreen } from '../screens/admin/ManageEventsScreen';
import { CreateEventScreen } from '../screens/admin/CreateEventScreen';
import { EditEventScreen } from '../screens/admin/EditEventScreen';
import { ViewRegistrationsScreen } from '../screens/admin/ViewRegistrationsScreen';
import { GameEvent } from '../types';
import { useAuthStore } from '../store/authStore';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export type AdminStackParamList = {
  Dashboard: undefined;
  ManageEvents: undefined;
  CreateEvent: undefined;
  EditEvent: { event: GameEvent };
  ViewRegistrations: { event: GameEvent };
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

export const AdminNavigator: React.FC = () => {
  const { signOut } = useAuthStore();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: Colors.background },
        headerRight: () => (
          <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="ManageEvents" component={ManageEventsScreen} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} options={{ title: 'Create Event' }} />
      <Stack.Screen name="EditEvent" component={EditEventScreen} options={{ title: 'Edit Event' }} />
      <Stack.Screen
        name="ViewRegistrations"
        component={ViewRegistrationsScreen}
        options={{ title: 'Registrations' }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  logoutText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
});
