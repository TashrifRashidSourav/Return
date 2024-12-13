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
        headerShown: true,
      }}
    >
      {/* Home Screen */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person' : 'home-outline'} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="updateprofile"
        options={{
          title: 'updateprofile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'fast-food' : 'fast-food-outline'} color={color} />
          ),
        }}
      />

      {/* Meal Form Screen */}
      <Tabs.Screen
        name="MealForm"
        options={{
          title: 'Meal Form',
          tabBarButton: () => null,  // Hides the screen from the tab bar
        }}
      />

      {/* Meals Screen */}
      <Tabs.Screen
        name="MealScreen"
        options={{
          title: 'Meals',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'restaurant' : 'restaurant-outline'} color={color} />
          ),
        }}
      />

      {/* Users Screen */}
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'people' : 'people-outline'} color={color} />
          ),
        }}
      />

      {/* Wallet Screen */}
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'wallet' : 'wallet-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
