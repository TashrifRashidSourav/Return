import { Tabs } from 'expo-router';
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons'; // Import MaterialIcons for icons
import { useColorScheme } from '@/hooks/useColorScheme'; // Optional: Adjust colors based on theme

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colorScheme === 'dark' ? '#4CAF50' : '#28a745', // Active tab color (green)
        tabBarInactiveTintColor: 'gray', // Inactive tab color
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#333' : '#fff', // Background color based on theme
        },
        headerShown: false, // Hide headers for all tabs
      }}
    >
      {/* Counselor Screen */}
      <Tabs.Screen
        name="counselor"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name={focused ? 'home' : 'home'} size={24} color={color} />
          ),
        }}
      />

      {/* Quotes Screen */}
      <Tabs.Screen
        name="quotes"
        options={{
          title: 'Quotes',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name={focused ? 'format-quote' : 'format-quote'} size={24} color={color} />
          ),
        }}
      />

      {/* Write Story Screen */}
      <Tabs.Screen
        name="WriteStoryScreen"
        options={{
          title: 'Write Story',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name={focused ? 'edit' : 'edit-off'} size={24} color={color} />
          ),
        }}
      />
          <Tabs.Screen
        name="conselorprofile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name={focused ? 'person' : 'person'} size={24} color={color} />
          ),
        }}
      />
      
    </Tabs>
  );
}
