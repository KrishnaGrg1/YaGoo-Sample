import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    let token = null;
     
    if (Platform.OS !== 'web') {
      // Use SecureStore for native platforms
      token = await SecureStore.getItemAsync('token');
    } else {
      // Use localStorage for web platform
      token = localStorage.getItem('token');
      router.replace('/(root)/(tabs)/home'); 
    }

    if (!token) {
      router.replace('/login');
    }
  };

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(root)" />
        <Stack.Screen name="(auth)" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}