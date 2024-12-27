import { Tabs } from 'expo-router';
import React from 'react';
import { TabBarIcon } from '@/components/navigation/TabBarIcon'; // Ensure this component exists and works
import { Colors } from '@/constants/Colors'; // Ensure this is properly defined
import { useColorScheme } from '@/hooks/useColorScheme'; // Ensure this is properly defined

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false, // Hide the header globally
      }}
    >
      {/* Profile Screen */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile', // You can set this if you want the title in the tab bar.
          headerShown: true, // Show header only for this screen
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
          ),
        }}
      />

      {/* Update Profile Screen */}
      <Tabs.Screen
        name="updateprofile"
        options={{
          title: 'Update Profile', // Set title for tab bar if needed
          headerShown: false, // Hide header
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'refresh' : 'refresh-outline'} color={color} />
          ),
        }}
      />

      {/* Post Screen */}
      <Tabs.Screen
        name="Post"
        options={{
          title: 'Post', // Title for tab bar if needed
          headerShown: false, // Hide header
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'create' : 'create-outline'} color={color} />
          ),
        }}
      />

      {/* Meals Screen */}
      <Tabs.Screen
        name="MealScreen"
        options={{
          title: 'Meals', // Title for tab bar if needed
          headerShown: false, // Hide header
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'restaurant' : 'restaurant-outline'} color={color} />
          ),
        }}
      />

      {/* Users Screen */}
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users', // Title for tab bar if needed
          headerShown: false, // Hide header
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'people' : 'people-outline'} color={color} />
          ),
        }}
      />

      {/* Wallet Screen */}
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet', // Title for tab bar if needed
          headerShown: false, // Hide header
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'wallet' : 'wallet-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
