// components/MapComponent.tsx
import React, { useEffect, useCallback, useMemo } from 'react';
import { View, Text, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import type { LocationObject } from 'expo-location';
import { generateLeafletHTML } from '@/utils/leafletMap';

type Props = {
  location: LocationObject | null;
  markers?: Array<{
    id: string;
    lat: number;
    lng: number;
    title?: string;
    description?: string;
    icon?: string;
  }>;
  onMapPress?: (event: { lat: number; lng: number }) => void;
};

const MapComponent = ({ location, markers = [], onMapPress }: Props) => {
  useEffect(() => {
    console.log('MapComponent mounted with location:', location);
  }, [location]);

  const handleMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('MapComponent: Received WebView message:', data);
      if (data.type === 'mapPress' && onMapPress) {
        onMapPress({ lat: data.lat, lng: data.lng });
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  }, [onMapPress]);

  if (Platform.OS === 'web') {
    console.log('MapComponent: Running on web platform');
    return (
      <View style={styles.webMapPlaceholder}>
        <MapPin size={48} color="#4B7BE5" />
        <Text style={styles.webMapText}>Use mobile app for interactive map.</Text>
      </View>
    );
  }

  if (!location) {
    console.log('MapComponent: No location provided');
    return (
      <View style={styles.webMapPlaceholder}>
        <ActivityIndicator size="large" color="#4B7BE5" />
        <Text style={styles.webMapText}>Getting your location...</Text>
      </View>
    );
  }

  const userLat = location.coords.latitude;
  const userLng = location.coords.longitude;
  console.log('MapComponent: Rendering map with coordinates:', { userLat, userLng });

  // Create markers array including user location
  const allMarkers = useMemo(() => [
    {
      id: 'user-location',
      lat: userLat,
      lng: userLng,
      title: 'Your Location',
      description: 'Current location',
      icon: '🔵'
    },
    ...markers
  ], [userLat, userLng, markers]);

  const html = useMemo(() => generateLeafletHTML({
    center: { lat: userLat, lng: userLng },
    markers: allMarkers,
    enableClick: !!onMapPress,
    fitBounds: true
  }), [userLat, userLng, allMarkers, onMapPress]);
  
  console.log('MapComponent: Generated HTML length:', html.length);

  return (
    <View style={styles.container}>
      <WebView
        style={styles.map}
        source={{ html }}
        onMessage={handleMessage}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error:', nativeEvent);
        }}
        onLoadEnd={() => {
          console.log('MapComponent: WebView loaded');
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4B7BE5" />
          </View>
        )}
        scalesPageToFit={false}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        cacheEnabled={true}
        cacheMode="LOAD_CACHE_ELSE_NETWORK"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  map: { 
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  webMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  webMapText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default React.memo(MapComponent);