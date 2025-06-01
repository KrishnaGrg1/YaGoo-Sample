import AppButton from '@/components/Button';
import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SwitchRole() {
    const {email}=useLocalSearchParams();
    const [errors, setErrors] = React.useState<string[]>([]);

    const handleCustomer = async () => {
        const userData = {
           
            email
        };

        try {

            const IP_Address = process.env.EXPO_PUBLIC_ADDRESS;
            console.log("IP Address:", IP_Address); // Debugging log
            const response = await axios.post(`http://${IP_Address}:8002/auth/sendOTP`, userData);
            const data = await response.data;

            console.log(data);
            router.replace({
                pathname: '/verify-email',
                params: { email: email}
            });

        } catch (error: any) {
            console.log("Full error:", error);

            if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
                const errorMessages = error.response.data.details.map((err: any) => err.message);
                setErrors(errorMessages);
            } else if (error.response?.data?.message) {
                setErrors([error.response.data.message]); // fallback if message is provided
            } else {
                setErrors(["Something went wrong."]);
            }
        }

    };

    const handleRider = async () => {
        try {
            router.replace({
                pathname: '/rider-register',
                params: { email: email }, // Pass email here
            });

        } catch (error: any) {
            console.log("Full error:", error);

            if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
                const errorMessages = error.response.data.details.map((err: any) => err.message);
                setErrors(errorMessages);
            } else if (error.response?.data?.message) {
                setErrors([error.response.data.message]); // fallback if message is provided
            } else {
                setErrors(["Something went wrong."]);
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Want to become a Rider?</Text>
            <AppButton title="Yes" onPress={handleRider} style={styles.button} />
            <AppButton title="No" onPress={handleCustomer} style={styles.button} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    button: {
        marginVertical: 10,
        width: '80%',
    },
});