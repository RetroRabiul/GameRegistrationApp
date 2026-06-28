import React from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useAuthStore } from '../store/authStore';
import { Spacing, FontSize } from '../constants';
import { TopAppBar } from '../components/TopAppBar';

import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { ManageEventsScreen } from '../screens/admin/ManageEventsScreen';
import { CreateEventScreen } from '../screens/admin/CreateEventScreen';
import { EditEventScreen } from '../screens/admin/EditEventScreen';
import { ViewRegistrationsScreen } from '../screens/admin/ViewRegistrationsScreen';
import { AdminPlayersScreen } from '../screens/admin/AdminPlayersScreen';

import { EventDetailScreen } from '../screens/player/EventDetailScreen';
import { MyRegistrationsScreen } from '../screens/player/MyRegistrationsScreen';
import { PaymentScreen } from '../screens/player/PaymentScreen';
import { ProfileScreen } from '../screens/player/ProfileScreen';

import { HubScreen } from '../screens/HubScreen';

import { GameEvent } from '../types';

export type MainStackParamList = {
  MainTabs: undefined;
  EventDetail: { event: GameEvent };
  Payment: { eventId: string; registrationId: string; amount: number; eventTitle: string };
  CreateEvent: undefined;
  EditEvent: { event: GameEvent };
  ViewRegistrations: { event: GameEvent };
};

export type PlayerTabParamList = {
  Hub: undefined;
  Registrations: undefined;
  Profile: undefined;
};

export type AdminTabParamList = {
  Dashboard: undefined;
  Events: undefined;
  Players: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();
const PlayerTab = createBottomTabNavigator<PlayerTabParamList>();
const AdminTab = createBottomTabNavigator<AdminTabParamList>();

const PlayerTabs: React.FC = () => {
  const { colors } = useTheme();

  return (
    <PlayerTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
          switch (route.name) {
            case 'Hub': iconName = focused ? 'game-controller' : 'game-controller-outline'; break;
            case 'Registrations': iconName = focused ? 'ticket' : 'ticket-outline'; break;
            case 'Profile': iconName = focused ? 'person' : 'person-outline'; break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#00E5FF',
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: FontSize.label, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.surfaceVariant, borderTopWidth: 1, paddingBottom: Spacing.sm, paddingTop: Spacing.sm, height: 64, elevation: 8 },
      })}
    >
      <PlayerTab.Screen name="Hub" component={HubScreen} />
      <PlayerTab.Screen name="Registrations" component={MyRegistrationsScreen} />
      <PlayerTab.Screen name="Profile" component={ProfileScreen} />
    </PlayerTab.Navigator>
  );
};

const AdminTabs: React.FC = () => {
  const { colors } = useTheme();

  return (
    <AdminTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
          switch (route.name) {
            case 'Dashboard': iconName = focused ? 'stats-chart' : 'stats-chart-outline'; break;
            case 'Events': iconName = focused ? 'trophy' : 'trophy-outline'; break;
            case 'Players': iconName = focused ? 'people' : 'people-outline'; break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#00E5FF',
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: FontSize.label, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.surfaceVariant, borderTopWidth: 1, paddingBottom: Spacing.sm, paddingTop: Spacing.sm, height: 64, elevation: 8 },
      })}
    >
      <AdminTab.Screen name="Dashboard" component={AdminDashboardScreen} />
      <AdminTab.Screen name="Events" component={ManageEventsScreen} />
      <AdminTab.Screen name="Players" component={AdminPlayersScreen} />
    </AdminTab.Navigator>
  );
};

export const MainNavigator: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopAppBar />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="MainTabs" component={isAdmin ? AdminTabs : PlayerTabs} />
        <Stack.Screen name="EventDetail" component={EventDetailScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
        <Stack.Screen name="EditEvent" component={EditEventScreen} />
        <Stack.Screen name="ViewRegistrations" component={ViewRegistrationsScreen} />
      </Stack.Navigator>
    </View>
  );
};
