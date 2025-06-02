import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { getSession } from '@/usableFunction/Session';
import AppButton from '@/components/Button';

const IP_Address = process.env.EXPO_PUBLIC_ADDRESS;

const PaymentConfirmationScreen = () => {
  const { rideId, amount } = useLocalSearchParams();
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirmPayment = async () => {
    setIsConfirming(true);
    try {
      const token = await getSession('accessToken');
      const response = await axios.post(
        `http://${IP_Address}:8002/rides/received-payment`,
        { rideId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert(
        'Success',
        'Payment confirmed successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(root)/(tabs)/home')
          }
        ]
      );
    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to confirm payment. Please try again.'
      );
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Confirmation</Text>
      
      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>Amount to Receive</Text>
        <Text style={styles.amount}>Rs. {amount}</Text>
      </View>

      <Text style={styles.instruction}>
        Please confirm that you have received the payment from the customer.
      </Text>

      <AppButton
        title={isConfirming ? 'Confirming...' : 'Confirm Payment Receipt'}
        onPress={handleConfirmPayment}
        disabled={isConfirming}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  amountContainer: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  amountLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4B7BE5',
  },
  instruction: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
});

export default PaymentConfirmationScreen; 