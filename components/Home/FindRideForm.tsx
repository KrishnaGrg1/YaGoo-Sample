import React from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import AppButton from '../Button';
import Input from '../Input';

interface FindRideFormProps {
  pickup: { address: string; coordinates: any };
  destination: { address: string; coordinates: any };
  setPickup: (location: { address: string; coordinates: any }) => void;
  setDestination: (location: { address: string; coordinates: any }) => void;
  onOpenPickupMap: () => void;
  onOpenDestinationMap: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  errors?: string[];
}

const FindRideForm: React.FC<FindRideFormProps> = ({
  pickup,
  destination,
  setPickup,
  setDestination,
  onOpenPickupMap,
  onOpenDestinationMap,
  onSubmit,
  isSubmitting = false,
  errors = [],
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Pickup Location:</Text>
      <Input
        placeholder="Enter pickup address"
        value={pickup.address}
        setValue={(text) => setPickup({ ...pickup, address: text })}
        error={errors.find(err => err.toLowerCase().includes('pickup'))}
        editable={!isSubmitting}
      />
      <AppButton 
        title="Select on Map" 
        onPress={onOpenPickupMap}
        disabled={isSubmitting}
      />

      <View style={styles.separator} />

      <Text style={styles.label}>Destination:</Text>
      <Input
        placeholder="Enter destination address"
        value={destination.address}
        setValue={(text) => setDestination({ ...destination, address: text })}
        error={errors.find(err => err.toLowerCase().includes('destination'))}
        editable={!isSubmitting}
      />
      <AppButton 
        title="Select on Map" 
        onPress={onOpenDestinationMap}
        disabled={isSubmitting}
      />

      {errors.length > 0 && !errors.some(err => 
        err.toLowerCase().includes('pickup') || 
        err.toLowerCase().includes('destination')
      ) && (
        <Text style={styles.errorText}>{errors[0]}</Text>
      )}

      <AppButton 
        title={isSubmitting ? "Finding Riders..." : "Find Riders"} 
        onPress={onSubmit}
        style={[styles.findButton, isSubmitting && styles.findButtonDisabled]}
        disabled={isSubmitting}
        Icon={isSubmitting ? () => <ActivityIndicator color="white" size="small" /> : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  separator: {
    height: 15,
  },
  findButton: {
    marginTop: 25,
    backgroundColor: '#27ae60',
  },
  findButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  errorText: {
    color: '#e74c3c',
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default FindRideForm;