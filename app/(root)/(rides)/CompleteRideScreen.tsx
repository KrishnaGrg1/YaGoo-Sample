import React, { useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getSession } from '@/usableFunction/Session';
import AppButton from '@/components/Button';

const IP_Address = process.env.EXPO_PUBLIC_ADDRESS ;

const CompleteRideScreen = () => {
  const { rideId } = useLocalSearchParams();
  const router = useRouter();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleCompleteRide = async () => {
    setIsCompleting(true);

    try {
      const token = await getSession('accessToken');
      const response = await axios.post(
        `http://${IP_Address}:8002/rides/complete-ride`,
        { rideId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert(response.data.message || 'Ride completed successfully');
      const data =await  response.data;
      const riderId = data.riderId;
      const totalTime= data.totalTime;
      router.push({
        pathname: '/(root)/(rides)/ReviewScreen',
        params: {  rideId,riderId,totalTime },
        });
     // Redirect back to HomeScreen
    } catch (error: any) {
      console.error('Complete Ride Error:', error);
      Alert.alert(
        error.response?.data?.message || 'Failed to complete the ride. Please try again.'
      );
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete Ride</Text>
      <Text style={styles.subtitle}>
        Are you sure you want to complete this ride?
      </Text>
      <AppButton
        title={isCompleting ? 'Completing...' : 'Complete Ride'}
        onPress={handleCompleteRide}
        disabled={isCompleting}
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default CompleteRideScreen;;