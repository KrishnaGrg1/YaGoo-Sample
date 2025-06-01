import * as SecureStore from 'expo-secure-store';

export async function getSession(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function setSession(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error('Error setting session:', error);
  }
}

export async function clearSession(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}

export async function clearAllSessions(): Promise<void> {
  try {
    const keys = ['accessToken', 'refreshToken', 'userId', 'userRole'];
    await Promise.all(keys.map(key => SecureStore.deleteItemAsync(key)));
  } catch (error) {
    console.error('Error clearing all sessions:', error);
  }
} 