import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import axios from 'axios';
import { getSession } from '@/usableFunction/Session';
import theme from '@/constants/theme';

const IP_Address = process.env.EXPO_PUBLIC_ADDRESS || 'YOUR_IP_ADDRESS';

interface ReviewComponentProps {
  rideId: string;
  riderId: string;
  onReviewSubmitted: () => void;
}

const ReviewComponent: React.FC<ReviewComponentProps> = ({
  rideId,
  riderId,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    Keyboard.dismiss();
    setIsSubmitting(true);
    try {
      const token = await getSession('accessToken');
      await axios.post(
        `http://${IP_Address}:8002/reviews/create`,
        {
          rideId,
          riderId,
          rating,
          comment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert('Success', 'Thank you for your review!');
      onReviewSubmitted();
    } catch (error) {
      console.error('Review submission error:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarPress = (selectedRating: number) => {
    setRating(selectedRating);
    // Add haptic feedback here if needed
  };

  const getRatingText = () => {
    const activeRating = hoveredRating || rating;
    switch (activeRating) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Very Good';
      case 5:
        return 'Excellent';
      default:
        return 'Rate your experience';
    }
  };

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 15 }}
      style={styles.container}
    >
      <Text style={styles.title}>How was your ride?</Text>
      
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingText}>{getRatingText()}</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => handleStarPress(star)}
              onPressIn={() => setHoveredRating(star)}
              onPressOut={() => setHoveredRating(0)}
              style={styles.starButton}
            >
              <MotiView
                animate={{
                  scale: rating >= star ? 1.2 : 1,
                }}
                transition={{
                  type: 'spring',
                  damping: 10,
                }}
              >
                <Ionicons
                  name={rating >= star ? 'star' : 'star-outline'}
                  size={40}
                  color={rating >= star ? theme.COLORS.warning : theme.COLORS.disabled}
                />
              </MotiView>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.commentContainer}>
        <Text style={styles.commentLabel}>Additional comments (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Tell us more about your experience..."
          placeholderTextColor={theme.COLORS.textSecondary}
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
          maxLength={500}
        />
        <Text style={styles.characterCount}>
          {comment.length}/500 characters
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmitReview}
        disabled={isSubmitting}
        activeOpacity={0.8}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Text>
      </TouchableOpacity>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.COLORS.background,
    padding: theme.SPACING.xl,
    borderRadius: theme.BORDER_RADIUS.lg,
    margin: theme.SPACING.md,
    ...theme.SHADOWS.medium,
  },
  title: {
    fontSize: theme.FONTS.sizes.xxl,
    textAlign: 'center',
    marginBottom: theme.SPACING.xl,
    color: theme.COLORS.text,
    ...theme.FONTS.bold,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: theme.SPACING.xl,
  },
  ratingText: {
    fontSize: theme.FONTS.sizes.lg,
    color: theme.COLORS.textSecondary,
    marginBottom: theme.SPACING.md,
    ...theme.FONTS.medium,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.SPACING.lg,
  },
  starButton: {
    padding: theme.SPACING.sm,
  },
  commentContainer: {
    marginBottom: theme.SPACING.xl,
  },
  commentLabel: {
    fontSize: theme.FONTS.sizes.md,
    color: theme.COLORS.text,
    marginBottom: theme.SPACING.sm,
    ...theme.FONTS.medium,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.COLORS.border,
    borderRadius: theme.BORDER_RADIUS.md,
    padding: theme.SPACING.md,
    minHeight: 120,
    textAlignVertical: 'top',
    color: theme.COLORS.text,
    backgroundColor: theme.COLORS.surface,
    ...theme.FONTS.regular,
  },
  characterCount: {
    fontSize: theme.FONTS.sizes.xs,
    color: theme.COLORS.textSecondary,
    textAlign: 'right',
    marginTop: theme.SPACING.xs,
    ...theme.FONTS.regular,
  },
  submitButton: {
    backgroundColor: theme.COLORS.primary,
    padding: theme.SPACING.lg,
    borderRadius: theme.BORDER_RADIUS.md,
    alignItems: 'center',
    ...theme.SHADOWS.small,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: theme.COLORS.white,
    fontSize: theme.FONTS.sizes.lg,
    ...theme.FONTS.bold,
  },
});

export default React.memo(ReviewComponent); 