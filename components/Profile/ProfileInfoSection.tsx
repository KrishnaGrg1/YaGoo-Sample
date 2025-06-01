// components/ProfileInfoSection.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  phone: string;
  role: string;
  riderDocuments?: any;
  vehicle?: any;
}

export default function ProfileInfoSection({ phone, role, riderDocuments, vehicle }: Props) {
  return (
    <View style={styles.infoContainer}>
      <Text style={styles.infoText}>Phone: {phone}</Text>
      <Text style={styles.infoText}>Role: {role}</Text>

      {role === 'rider' && riderDocuments && (
        <>
          <Text style={styles.subHeading}>Rider Documents</Text>
          <Text style={styles.infoText}>License Number: {riderDocuments.licenseNumber}</Text>
          <Text style={styles.infoText}>Citizenship Number: {riderDocuments.citizenshipNumber}</Text>
        </>
      )}

      {role === 'rider' && vehicle && (
        <>
          <Text style={styles.subHeading}>Vehicle Details</Text>
          <Text style={styles.infoText}>Type: {vehicle.vehicleType}</Text>
          <Text style={styles.infoText}>Name: {vehicle.vehicleName}</Text>
          <Text style={styles.infoText}>Model: {vehicle.vehicleModel}</Text>
          <Text style={styles.infoText}>Number Plate: {vehicle.vehicleNumberPlate}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  infoContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    elevation: 4,
  },
  infoText: {
    fontSize: 15,
    marginBottom: 10,
    color: '#333',
  },
  subHeading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
});
