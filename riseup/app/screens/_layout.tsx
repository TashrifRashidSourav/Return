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
        tabBarActiveTintColor: 'blue', // Active tab color set to blue
        headerShown: false, // Default: no header
      }}
    >

         {/* Post Screen with Home Icon */}
         <Tabs.Screen
        name="Post"
        options={{
          title: 'Home', // Updated Title for Home
          headerShown: false, // No header for Home
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
     <Tabs.Screen
        name="postcreate"
        options={{
          title: 'Post',
          headerShown: false, // No header for Post
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'create' : 'create-outline'} color={color} />
          ),
        }}
      />

      {/* Profile Screen - Header shown */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile', // Title for the Profile screen
          headerShown: true, // Show header for Profile screen
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
          ),
        }}
      />

      {/* Update Profile Screen */}
      <Tabs.Screen
        name="updateprofile"
        options={{
          title: 'Update Profile',
          headerShown: false, // No header for Update Profile
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'refresh' : 'refresh-outline'} color={color} />
          ),
        }}
      />


      {/* Chats List Screen */}
      <Tabs.Screen
        name="ChatsListScreen"
        options={{
          title: 'Chats',
          headerShown: false, // No header for Chats
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'chatbubbles' : 'chatbubbles-outline'} color={color} />
          ),
        }}
      />

      {/* Routine Manager Screen */}
      <Tabs.Screen
        name="RoutineManagerScreen"
        options={{
          title: 'Routine',
          headerShown: false, // No header for Routine
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'calendar' : 'calendar-outline'} color={color} />
          ), // Using calendar icons for Routine
        }}
      />

<Tabs.Screen
        name="quotes"
        options={{
          title: 'Routine',
          headerShown: false, // No header for Routine
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'calendar' : 'calendar-outline'} color={color} />
          ), // Using calendar icons for Routine
        }}
      />

      {/* Message Screen - Hidden from Tab Bar */}
      <Tabs.Screen
        name="ChatMessagesScreen"
        options={{
          title: 'Messages',
          headerShown: false, // No header for Messages
          tabBarButton: () => null, // Hide from the Tab Bar
        }}
      />


    </Tabs>
  );
}
