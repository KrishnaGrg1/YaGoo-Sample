import AppButton from '@/components/Button';
import { getSession } from '@/usableFunction/Session';
import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';

const ViewOtpScreen = () => {
    const IP_Address = process.env.EXPO_PUBLIC_ADDRESS;
    const { rideId, message } = useLocalSearchParams();

    const [errors, setErrors] = React.useState<string[]>([]);
    const handleReceivePayment = async () => {
        try {
            const token = await getSession('accessToken');
            if (!token) {
                Alert.alert('You are not logged in. Please log in to continue.');
                return;
            }

            const response = await axios.post(`http://${IP_Address}:8002/rides/received-payment`, {
                rideId,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.data;
            console.log("Received payment response:", data);

            Alert.alert('Payment received successfully.');
            router.push('/(root)/(tabs)/home');


        }
        catch (error: any) {
            console.error('Fetch ride requests error:', error);
            if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
                setErrors(error.response.data.details.map((err: any) => err.message));
            } else if (error.response?.data?.message) {
                setErrors([error.response.data.message]);
            } else {
                setErrors(['Something went wrong.']);
            }
        }


    }
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your OTP</Text>
            <Text style={styles.otp}> </Text>
            <Text style={styles.instruction}>Please share  OTP with your customer.</Text>
            <Text style={styles.instruction}>This OTP is valid for 10 minutes.</Text>
            <AppButton
                title="Receive Payment"
                onPress={handleReceivePayment}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    otp: {
        fontSize: 36,
        fontWeight: 'bold',
        color: 'blue',
        marginBottom: 20,
    },
    instruction: {
        fontSize: 16,
        textAlign: 'center',
    },
});

export default ViewOtpScreen;