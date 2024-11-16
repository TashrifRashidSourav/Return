// app/_layout.tsx
import React from 'react';
import { Stack, Slot } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hides the header for all routes
      }}
    >
      {/* Ensure Slot is used correctly */}
      <Slot />
    </Stack>
  );
}
