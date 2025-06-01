import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AppButton from '../Button';

interface Rider {
  riderListId: string;
  name: string;
  rating: string;
  vehicle: string;
}

interface AvailableRidersListProps {
  riders: Rider[];
  disabled: boolean;
  onAccept: (riderId: string) => void;
  onReject: (riderId: string) => void;
  isLoading?: boolean;
}

const AvailableRidersList: React.FC<AvailableRidersListProps> = ({
  riders,
  disabled,
  onAccept,
  onReject,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4B7BE5" />
        <Text style={styles.loadingText}>Finding available riders...</Text>
      </View>
    );
  }

  if (!riders.length) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No riders available yet</Text>
        <Text style={styles.subText}>Please wait while we find riders for you</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Riders</Text>
      {riders.map((rider) => (
        <View key={rider.riderListId} style={styles.riderCard}>
          <Text style={styles.name}>{rider.name}</Text>
          <View style={styles.detailsRow}>
            <Text style={styles.detail}>⭐ {rider.rating}</Text>
            <Text style={styles.detail}>🚗 {rider.vehicle}</Text>
          </View>
          <View style={styles.actions}>
            <AppButton
              title="Accept"
              onPress={() => onAccept(rider.riderListId)}
              disabled={disabled}
              style={styles.acceptButton}
            />
            <AppButton
              title="Reject"
              onPress={() => onReject(rider.riderListId)}
              disabled={disabled}
              style={styles.rejectButton}
              textStyle={styles.rejectButtonText}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  centerContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  riderCard: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detail: {
    fontSize: 16,
    color: '#666',
    marginRight: 15,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#4B7BE5',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  rejectButtonText: {
    color: '#ff4444',
  },
});

export default AvailableRidersList;
