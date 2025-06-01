import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const storeSession = async (key: string, value: string) => {
  console.log(`Storing session: ${key} = ${value}`); // Debugging log
  if (Platform.OS !== 'web') {
    await SecureStore.setItemAsync(key, value);
  } else {
    localStorage.setItem(key, value);
  }
};

export const getSession = async (key: string) => {
  const value =
    Platform.OS !== 'web'
      ? await SecureStore.getItemAsync(key)
      : localStorage.getItem(key);
  console.log(`Retrieved session: ${key} = ${value}`); // Debugging log
  return value;
};

export const clearSession = async (key: string) => {
  if (Platform.OS !== 'web') {
    await SecureStore.deleteItemAsync(key);
  } else {
    localStorage.removeItem(key);
  }
};

// Other exports


const IP_Address = process.env.EXPO_PUBLIC_ADDRESS;

export async function getUserRole(): Promise<string> {
  try {
    const token = await getSession('accessToken');
    if (!token) throw new Error('Access token not found');

    const response = await axios.get(
      `http://${IP_Address}:8002/profile/details`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Bearer token
        },
      }
    );

    const role = response.data.user?.role;
    return role === 'rider' ? 'rider' : 'customer';
  } catch (error) {
    console.error('Error fetching user role:', error);
    return 'guest'; // Fallback or handle as needed
  }
}

