import AppButton from '@/components/Button';
import Input from '@/components/Input';
import { storeSession } from '@/usableFunction/Session';
import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { Phone, Text as LucideText } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function VerifyPassword() {
    const { email } = useLocalSearchParams();
    const [errors, setErrors] = useState<string[]>([]);
    const [OTP, setOtp] = useState('');
    const [newPassword, setPassword] = useState('');
    const [retypePassword, setReTypePassword] = useState('');

    const handleVerify = async () => {
        if (!email || !OTP || !newPassword || !retypePassword) {
            setErrors(['All fields are required.']);
            return;
        }

        if (newPassword !== retypePassword) {
            setErrors(['Passwords do not match.']);
            return;
        }

        try {
            const userData = {
                email,
                OTP,
                newPassword,
                retypePassword,
            };

            const IP_Address = process.env.EXPO_PUBLIC_ADDRESS;
      console.log("IP Address:", IP_Address); // Debugging log
      const response = await axios.post(`http://${IP_Address}:8002/auth/changePassword`, userData);
            const data = response.data;
            console.log(data);

            await storeSession('accessToken', String(data.token));
            router.replace('/(root)/(tabs)/home');
        } catch (error: any) {
            console.log("Full error:", error);

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
        <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.container}>
            <Text style={styles.title}>Verify Password</Text>
            <Text style={styles.subtitle}>We’ve sent an OTP to: {email}</Text>

            {errors.length > 0 && errors.map((err, i) => (
                <Text key={i} style={styles.error}>• {err}</Text>
            ))}

            <Input
                icon={<Phone size={20} />}
                placeholder="OTP"
                value={OTP}
                setValue={setOtp}
                keyboardType="numeric"
            />
            <Input
                icon={<LucideText size={20} />}
                placeholder="New Password"
                value={newPassword}
                setValue={setPassword}
                secureTextEntry
            />
            <Input
                icon={<LucideText size={20} />}
                placeholder="Retype Password"
                value={retypePassword}
                setValue={setReTypePassword}
                secureTextEntry
            />
            <AppButton title="Verify" onPress={handleVerify} />
            </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        marginTop: 100,
        backgroundColor: '#f9f9f9',
    },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    error: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
        fontSize: 14,
    },
});
