import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { AuthProvider } from '../hooks/useAuth';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen
            name="detail/[id]"
            options={{
              headerShown: true,
              title: 'Detail Kejadian Banjir',
              headerStyle: { backgroundColor: COLORS.primary },
              headerTintColor: COLORS.white,
            }}
          />
          <Stack.Screen
            name="admin"
            options={{
              headerShown: true,
              title: 'Panel Verifikasi Admin',
              headerStyle: { backgroundColor: COLORS.primary },
              headerTintColor: COLORS.white,
            }}
          />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}