import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme/ThemeContext';
import { useAuthStore } from '../store/authStore';
import { Spacing, FontSize } from '../constants';
import { TopAppBar } from '../components/TopAppBar';

import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { ManageEventsScreen } from '../screens/admin/ManageEventsScreen';
import { CreateEventScreen } from '../screens/admin/CreateEventScreen';
import { EditEventScreen } from '../screens/admin/EditEventScreen';
import { ViewRegistrationsScreen } from '../screens/admin/ViewRegistrationsScreen';

import { EventListScreen } from '../screens/player/EventListScreen';
import { EventDetailScreen } from '../screens/player/EventDetailScreen';
import { MyRegistrationsScreen } from '../screens/player/MyRegistrationsScreen';
import { PaymentScreen } from '../screens/player/PaymentScreen';

import { AlertsScreen } from '../screens/AlertsScreen';
import { ApiScreen } from '../screens/ApiScreen';

import { GameEvent } from '../types';

export type MainStackParamList = {
  MainTabs: undefined;
  EventDetail: { event: GameEvent };
  Payment: { eventId: string; registrationId: string; amount: number; eventTitle: string };
  CreateEvent: undefined;
  EditEvent: { event: GameEvent };
  ViewRegistrations: { event: GameEvent };
};

export type MainTabParamList = {
  Hub: undefined;
  Brackets: undefined;
  Entry: undefined;
  Alerts: undefined;
  API: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const HubScreen: React.FC = () => {
  const { user } = useAuthStore();
  return user?.role === 'admin' ? <AdminDashboardScreen /> : <EventListScreen />;
};

const BracketsScreen: React.FC = () => {
  const { user } = useAuthStore();
  return user?.role === 'admin' ? <ManageEventsScreen /> : <MyRegistrationsScreen />;
};

const EntryScreen: React.FC = () => {
  const { user } = useAuthStore();
  return user?.role === 'admin' ? <ManageEventsScreen /> : <EventListScreen />;
};

const MainTabs: React.FC = () => {
  const { colors } = useTheme();

  const tabIcons: Record<string, string> = {
    Hub: '◫',
    Brackets: '⚔',
    Entry: '⊕',
    Alerts: '⚑',
    API: '⟨⟩',
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Text style={[styles.tabIcon, { color }]}>{tabIcons[route.name]}</Text>
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: FontSize.label,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surfaceVariant,
          borderTopWidth: 1,
          paddingBottom: Spacing.sm,
          paddingTop: Spacing.sm,
          height: 64,
          elevation: 8,
        },
      })}
    >
      <Tab.Screen name="Hub" component={HubScreen} />
      <Tab.Screen name="Brackets" component={BracketsScreen} />
      <Tab.Screen name="Entry" component={EntryScreen} />
      <Tab.Screen name="Alerts" component={AlertsScreen} />
      <Tab.Screen name="API" component={ApiScreen} />
    </Tab.Navigator>
  );
};

export const MainNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopAppBar />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="EventDetail" component={EventDetailScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
        <Stack.Screen name="EditEvent" component={EditEventScreen} />
        <Stack.Screen name="ViewRegistrations" component={ViewRegistrationsScreen} />
      </Stack.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 22,
    fontWeight: '700',
  },
});
