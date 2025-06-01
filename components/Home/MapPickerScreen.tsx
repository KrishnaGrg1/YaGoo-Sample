// components/MapPickerScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { generateLeafletHTML } from '@/utils/leafletMap';

interface MapPickerScreenProps {
  onLocationSelect: (location: { address: string; coordinates: { latitude: number; longitude: number } }) => void;
  onClose?: () => void;
  initialCoordinate?: { latitude: number; longitude: number };
}

const MapPickerScreen: React.FC<MapPickerScreenProps> = ({ 
  onLocationSelect, 
  onClose, 
  initialCoordinate 
}) => {
  const [selected, setSelected] = useState<{ latitude: number; longitude: number } | null>(
    initialCoordinate || null
  );
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 28.2096, lng: 83.9856 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'Location permission is required to use this feature. Using a fallback location.'
          );
          setMapCenter({ lat: 28.2096, lng: 83.9856 }); // Fallback to Pokhara
          setLoading(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setMapCenter({ 
          lat: currentLocation.coords.latitude, 
          lng: currentLocation.coords.longitude 
        });
        
        // Set initial selection to current location if no initial coordinate provided
        if (!initialCoordinate) {
          setSelected({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude
          });
        }
      } catch (error) {
        console.error('Error getting current location:', error);
        Alert.alert('Error', 'Failed to get current location. Using a fallback location.');
        setMapCenter({ lat: 28.2096, lng: 83.9856 });
      } finally {
        setLoading(false);
      }
    })();
  }, [initialCoordinate]);

  const handleSelect = async () => {
    if (!selected) {
      Alert.alert('Error', 'Please select a location on the map.');
      return;
    }

    try {
      const [place] = await Location.reverseGeocodeAsync(selected);
      const address = `${place.name || ''}, ${place.city || ''}, ${place.region || ''}`.replace(/^,\s*/, '');

      onLocationSelect({
        address: address || `${selected.latitude.toFixed(4)}, ${selected.longitude.toFixed(4)}`,
        coordinates: {
          latitude: selected.latitude,
          longitude: selected.longitude,
        },
      });
    } catch (error) {
      console.error('Error reverse geocoding location:', error);
      Alert.alert('Error', 'Failed to retrieve address. Please try again.');
    }
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapPress') {
        setSelected({
          latitude: data.lat,
          longitude: data.lng
        });
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const markers = selected ? [{
    id: 'selected',
    lat: selected.latitude,
    lng: selected.longitude,
    title: 'Selected Location'
  }] : [];

  return (
    <View style={styles.container}>
      <WebView
        style={styles.map}
        source={{ 
          html: generateLeafletHTML({
            center: mapCenter,
            markers,
            enableClick: true,
            fitBounds: false
          })
        }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={false}
      />
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleSelect}>
          <Text style={styles.buttonText}>Confirm Location</Text>
        </TouchableOpacity>
        {onClose && (
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default MapPickerScreen;