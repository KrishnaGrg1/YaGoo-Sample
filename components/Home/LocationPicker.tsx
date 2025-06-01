// components/LocationPicker.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { MapPin } from 'lucide-react-native';
import Input from '../Input';

type Props = {
  label: string;
  location: { address: string; coordinates: any };
  setLocation: (val: { address: string; coordinates: any }) => void;
  onOpenMap: () => void;
};

const LocationPicker = ({ label, location, setLocation, onOpenMap }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Input
        icon={<MapPin size={20} />}
        placeholder="Type address or use map"
        value={location.address}
        setValue={(val) => setLocation({ ...location, address: val })}
      />
      <TouchableOpacity onPress={onOpenMap}>
        <Text style={styles.mapText}>📍 Pick on Map</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontWeight: '600', marginBottom: 5 },
  mapText: { color: '#007bff', marginTop: 5 },
});

export default LocationPicker;
