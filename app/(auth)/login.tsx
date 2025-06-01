import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import axios from 'axios';
import Input from '@/components/Input';
import AppButton from '@/components/Button';
import { storeSession } from '@/usableFunction/Session';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        alert('Please enter both email and password.');
        return;
      }

      const IP_Address = process.env.EXPO_PUBLIC_ADDRESS;
      console.log('IP Address:', IP_Address); // Debugging log

      const response = await axios.post(`http://${IP_Address}:8002/auth/login`, {
        email,
        password,
      });

      console.log('Response:', response.data); // Debugging log
      const { token } = response.data;

      if (!token) {
        console.error('Token is missing in the response.');
        alert('Login failed. Please try again.');
        return;
      }

      console.log('Token received:', token); // Debugging log
      await storeSession('accessToken', token);
      console.log('Token stored successfully:', token); // Debugging log

      router.replace('/(root)/(tabs)/home'); // Navigate to the home screen
    } catch (error: any) {
      console.log('Full error:', error);

      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        const errorMessages = error.response.data.details.map((err: any) => err.message);
        setErrors(errorMessages);
      } else if (error.response?.data?.message) {
        setErrors([error.response.data.message]);
      } else {
        setErrors(['Something went wrong.']);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

      {errors.length > 0 &&
        errors.map((err, index) => (
          <Text key={index} style={styles.error}>
            {err}
          </Text>
        ))}

      <Input
        icon={<Mail size={20} />}
        placeholder="Email"
        value={email}
        setValue={setEmail}
        keyboardType="email-address"
      />
      <Input
        icon={<Lock size={20} />}
        placeholder="Password"
        value={password}
        setValue={setPassword}
        secureTextEntry
      />

      <AppButton title="Login" onPress={handleLogin} />
      <AppButton
        title="Don't have an account? Register"
        onPress={() => router.push('/register')}
        style={{ backgroundColor: 'transparent' }}
        textStyle={{ color: '#2196F3' }}
      />
      <AppButton
        title="Forget Password?"
        onPress={() => router.push('/forgot-password')}
        style={{ backgroundColor: 'transparent' }}
        textStyle={{ color: '#2196F3' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
});