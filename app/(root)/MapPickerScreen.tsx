import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, ActivityIndicator, Alert, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useLocationSetter } from '@/components/LocationSetterContext';
import { generateLeafletHTML } from '@/utils/leafletMap';

const MapPickerScreen = () => {
  const { setter } = useLocationSetter();
  const router = useRouter();
  const [selected, setSelected] = useState<{ latitude: number; longitude: number } | null>(null);
  const [initialLocation, setInitialLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        console.log('Location permission status:', status);

        if (status !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'Location permission is required to use this feature. Using a fallback location.'
          );
          setInitialLocation({
            latitude: 28.2096,
            longitude: 83.9856
          });
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setInitialLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
      } catch (error) {
        console.error('Error getting current location:', error);
        Alert.alert('Error', 'Failed to get current location. Using a fallback location.');
        setInitialLocation({
          latitude: 28.2096,
          longitude: 83.9856
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSelect = async () => {
    if (!selected || !setter) {
      Alert.alert('Error', 'Please select a location on the map.');
      return;
    }

    try {
      const [place] = await Location.reverseGeocodeAsync(selected);
      const address = `${place.name || ''}, ${place.city || ''}, ${place.region || ''}`;

      setter({
        address,
        coordinates: {
          latitude: selected.latitude,
          longitude: selected.longitude,
        },
      });

      router.back();
    } catch (error) {
      console.error('Error reverse geocoding location:', error);
      Alert.alert('Error', 'Failed to retrieve address. Please try again.');
    }
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapPress') {
        console.log('Map pressed:', data.lat, data.lng);
        setSelected({ latitude: data.lat, longitude: data.lng });
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  if (loading || !initialLocation) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
    <View style={{ flex: 1 }}>
      <WebView
        style={StyleSheet.absoluteFillObject}
        source={{ 
          html: generateLeafletHTML({
            center: { 
              lat: initialLocation.latitude, 
              lng: initialLocation.longitude 
            },
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
        <Button title="Confirm Location" onPress={handleSelect} disabled={!selected} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    elevation: 4,
    zIndex: 10,
    pointerEvents: 'box-none'
  },
});

export default MapPickerScreen;