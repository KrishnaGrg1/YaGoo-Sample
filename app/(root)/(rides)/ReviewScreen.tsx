import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getSession } from '@/usableFunction/Session';
import AppButton from '@/components/Button';

const IP_Address = process.env.EXPO_PUBLIC_ADDRESS;

const ReviewScreen = () => {
  const [time, setTime] = useState(0);
  const { rideId, riderId, totalTime } = useLocalSearchParams();
  const router = useRouter();
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (totalTime) {
      setTime(parseInt(totalTime as string, 10));
    }
  }, [totalTime]);

  const handleSubmitReview = async () => {
    if (!rating || !comment) {
      return Alert.alert('Please provide both a rating and a comment.');
    }

    const numericRating = parseInt(rating);
    if (numericRating < 1 || numericRating > 5) {
      return Alert.alert('Rating must be between 1 and 5.');
    }

    setIsSubmitting(true);

    try {
      const token = await getSession('accessToken');
      const response = await axios.post(
        `http://${IP_Address}:8002/rides/submit-ride-review`,
        { rideId, riderId, comment, rating: numericRating },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert(response.data.message || 'Review submitted successfully');
      router.push('/(root)/(tabs)/home');
    } catch (error: any) {
      console.error('Submit Review Error:', error);
      Alert.alert(
        error.response?.data?.message || 'Failed to submit the review. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ride Duration: {time} minutes</Text>
      <Text style={styles.title}>Submit Your Review</Text>
      <Text style={styles.subtitle}>
        Please rate your experience with the rider and leave a comment.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your rating (1-5)"
        keyboardType="numeric"
        value={rating}
        onChangeText={setRating}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Enter your comment"
        multiline
        numberOfLines={4}
        value={comment}
        onChangeText={setComment}
      />
      <AppButton
        title={isSubmitting ? 'Submitting...' : 'Submit Review'}
        onPress={handleSubmitReview}
        disabled={isSubmitting}
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
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});

export default ReviewScreen;
