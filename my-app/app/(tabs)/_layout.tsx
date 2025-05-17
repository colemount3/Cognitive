import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#111' },
        tabBarActiveTintColor: '#0ff',
        tabBarInactiveTintColor: '#888',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'index') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'preGame') {
            iconName = focused ? 'play-circle' : 'play-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Welcome' }} />
      <Tabs.Screen name="preGame" options={{ title: 'Evaluation' }} />
      <Tabs.Screen name="GameHistory" options={{ title: 'Evaluation History' }} />

      {/* Hide these tabs from the UI, but they can still be navigated to */}
      <Tabs.Screen name="game" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="TransferScreen" options={{ href: null }} />
      <Tabs.Screen name="TracingGame" options={{ href: null }} />
      <Tabs.Screen name="reactionTransfer" options={{ href: null }} />

    </Tabs>
  );
}