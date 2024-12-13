import { Tabs } from 'expo-router';
import React from 'react';
import { TabBarIcon } from '@/components/navigation/TabBarIcon'; // Adjust based on your project structure
import { Colors } from '@/constants/Colors';

import { useColorScheme } from '@/hooks/useColorScheme'

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
      }}
    >
      {/* Profile Screen */}
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
          ),
        }}
      />

      {/* Post Screen - New Tab Added */}
      <Tabs.Screen
        name="Post"
        options={{
          title: 'Post',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'create' : 'create-outline'} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}
