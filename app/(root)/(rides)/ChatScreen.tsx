import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';

import ChatComponent from '@/components/Chat/ChatComponent';
import ReviewComponent from '@/components/Review/ReviewComponent';
import { getSession } from '@/usableFunction/Session';
import chatService from '@/services/chatService';

const IP_Address = process.env.EXPO_PUBLIC_ADDRESS || 'YOUR_IP_ADDRESS';

export default function ChatScreen() {
  const { rideId, riderId, isRider } = useLocalSearchParams<{
    rideId: string;
    riderId: string;
    isRider: string;
  }>();
  const router = useRouter();

  const [userId, setUserId] = useState<string>('');
  const [showReview, setShowReview] = useState(false);
  const [hasPaymentCompleted, setHasPaymentCompleted] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await getSession('accessToken');
        const response = await axios.get(`http://${IP_Address}:8002/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserId(response.data.id);
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to load user data');
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    // Listen for ride completion
    chatService.onRideCompleted(({ duration, fare }) => {
      if (isRider === 'true') {
        Alert.alert(
          'Ride Completed',
          `Trip duration: ${Math.floor(duration / 60)} minutes\nFare: Rs. ${fare}`,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(root)/(tabs)/home'),
            },
          ]
        );
      } else {
        Alert.alert(
          'Ride Completed',
          `Trip duration: ${Math.floor(duration / 60)} minutes\nFare: Rs. ${fare}`,
          [
            {
              text: 'Pay Now',
              onPress: () => handlePayment(fare),
            },
          ]
        );
      }
    });

    return () => {
      chatService.removeAllListeners();
    };
  }, [isRider]);

  const handlePayment = async (fare: number) => {
    try {
      const token = await getSession('accessToken');
      await axios.post(
        `http://${IP_Address}:8002/payments/process`,
        {
          rideId,
          amount: fare,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setHasPaymentCompleted(true);
      setShowReview(true);
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Payment failed. Please try again.');
    }
  };

  const handleReviewSubmitted = () => {
    router.replace('/(root)/(tabs)/home');
  };

  if (!userId || !rideId || !riderId) {
    return null;
  }

  return (
    <View style={styles.container}>
      {showReview ? (
        <ReviewComponent
          rideId={rideId}
          riderId={riderId}
          onReviewSubmitted={handleReviewSubmitted}
        />
      ) : (
        <ChatComponent
          rideId={rideId}
          userId={userId}
          isRider={isRider === 'true'}
          onEndChat={() => {
            if (isRider === 'true') {
              chatService.markRiderArrived(rideId, 'destination');
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 