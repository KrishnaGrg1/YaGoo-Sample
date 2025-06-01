import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Input from '@/components/Input';
import AppButton from '@/components/Button';
import { IndianRupee } from 'lucide-react-native';

type Props = {
  price: string;
  setPrice: (val: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  startLocation: string;
  destination: string;
  minimumPrice: number | null;
  isSubmitting?: boolean;
  isCanceling?: boolean;
  errors?: string[];
};

const BidForm = ({
  price,
  setPrice,
  onSubmit,
  onCancel,
  startLocation,
  destination,
  minimumPrice,
  isSubmitting = false,
  isCanceling = false,
  errors = [],
}: Props) => {
  const priceError = errors.find(err => 
    err.toLowerCase().includes('price') || 
    err.toLowerCase().includes('amount') || 
    err.toLowerCase().includes('bid')
  );

  return (
    <View style={styles.card}>
      <Text style={styles.rideSummary}>
        🚕 Ride from <Text style={styles.bold}>{startLocation}</Text> to{' '}
        <Text style={styles.bold}>{destination}</Text>
      </Text>

      {minimumPrice !== null && (
        <Text style={styles.minimumPrice}>
          Minimum Price: Rs. <Text style={styles.bold}>{minimumPrice}</Text>
        </Text>
      )}

      <Input
        icon={<IndianRupee size={20} color={priceError ? '#e74c3c' : '#333'} />}
        placeholder="Your Bid Price"
        value={price}
        setValue={setPrice}
        keyboardType="numeric"
        error={priceError}
        editable={!isSubmitting && !isCanceling}
      />

      {errors.length > 0 && !priceError && (
        <Text style={styles.error}>{errors[0]}</Text>
      )}

      <AppButton 
        title={isSubmitting ? "Submitting Bid..." : "Submit Bid"}
        onPress={onSubmit}
        disabled={isSubmitting || isCanceling}
        style={StyleSheet.flatten([
          styles.submitBtn,
          (isSubmitting || isCanceling) && styles.disabledButton
        ])}
        Icon={isSubmitting ? () => <ActivityIndicator color="white" size="small" /> : undefined}
      />

      <AppButton
        title={isCanceling ? "Canceling..." : "Cancel Ride"}
        onPress={onCancel}
        disabled={isSubmitting || isCanceling}
        style={StyleSheet.flatten([
          styles.cancelBtn,
          (isSubmitting || isCanceling) && styles.disabledButton
        ])}
        Icon={isCanceling ? () => <ActivityIndicator color="white" size="small" /> : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  rideSummary: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  minimumPrice: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
    color: '#555',
  },
  bold: {
    fontWeight: '600',
    color: '#333',
  },
  submitBtn: {
    backgroundColor: '#27ae60',
    marginTop: 15,
  },
  cancelBtn: {
    marginTop: 10,
    backgroundColor: '#e74c3c',
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  error: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 5,
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default BidForm;
