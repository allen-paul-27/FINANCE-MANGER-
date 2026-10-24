import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FinanceProvider } from '@/context/FinanceContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <FinanceProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </FinanceProvider>
    </SafeAreaProvider>
  );
}
