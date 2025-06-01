import React, { useRef, useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { LocationSearch } from '@/components/LocationSearch/LocationSearch';
import theme from '@/constants/theme';

interface Location {
  display_name: string;
  place_id: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

interface LocationInputsProps {
  onPickupSelect: (location: Location) => void;
  onDestinationSelect: (location: Location) => void;
}

export const LocationInputs: React.FC<LocationInputsProps> = ({
  onPickupSelect,
  onDestinationSelect,
}) => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const destinationRef = useRef<TextInput>(null);

  const handlePickupSelect = (location: Location) => {
    const displayAddress = location.address.road || location.address.suburb || location.display_name;
    setPickup(displayAddress);
    onPickupSelect(location);
    // Focus destination input after pickup selection
    destinationRef.current?.focus();
  };

  const handleDestinationSelect = (location: Location) => {
    const displayAddress = location.address.road || location.address.suburb || location.display_name;
    setDestination(displayAddress);
    onDestinationSelect(location);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <LocationSearch
          placeholder="Enter pickup location"
          value={pickup}
          onLocationSelect={handlePickupSelect}
          onInputChange={setPickup}
        />
      </View>

      <View style={styles.inputWrapper}>
        <LocationSearch
          placeholder="Enter destination"
          value={destination}
          onLocationSelect={handleDestinationSelect}
          onInputChange={setDestination}
          inputRef={destinationRef}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: theme.SPACING.lg,
  },
  inputWrapper: {
    marginBottom: theme.SPACING.lg,
  },
}); 