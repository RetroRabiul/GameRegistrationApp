import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors } from '../constants';
import { EventListScreen } from '../screens/player/EventListScreen';
import { EventDetailScreen } from '../screens/player/EventDetailScreen';
import { MyRegistrationsScreen } from '../screens/player/MyRegistrationsScreen';
import { PaymentScreen } from '../screens/player/PaymentScreen';
import { GameEvent } from '../types';
import { Text } from 'react-native';

export type PlayerStackParamList = {
  EventTabs: undefined;
  EventDetail: { event: GameEvent };
  Payment: { eventId: string; registrationId: string; amount: number; eventTitle: string };
};

export type PlayerTabParamList = {
  Events: undefined;
  MyRegistrations: undefined;
};

const Stack = createNativeStackNavigator<PlayerStackParamList>();
const Tab = createBottomTabNavigator<PlayerTabParamList>();

const EventTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Events"
        component={EventListScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🎮</Text>,
        }}
      />
      <Tab.Screen
        name="MyRegistrations"
        component={MyRegistrationsScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📋</Text>,
          tabBarLabel: 'My Registrations',
        }}
      />
    </Tab.Navigator>
  );
};

export const PlayerNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen
        name="EventTabs"
        component={EventTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ title: 'Event Details' }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ title: 'Payment' }}
      />
    </Stack.Navigator>
  );
};
