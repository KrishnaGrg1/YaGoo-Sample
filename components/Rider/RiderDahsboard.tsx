import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, Button, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import axios from 'axios';
import { getSession } from '@/usableFunction/Session';
import { router, useRouter } from 'expo-router';
import AppButton from '../Button';
import socketService from '@/services/socketService';
import type { Bid, RideStatus, RideStatusUpdateEvent, NewBidEvent } from '@/types/socket';

interface AvailableRide {
  _id: string;
  rideId?: string;
  customerId?: string;
  start_location?: {
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  destination?: {
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  status: string;
  distance: number;
  minimumPrice: number;
  bidPrice?: number;
}

const RiderDashboard = () => {
  const router = useRouter();
  const [availableRides, setAvailableRides] = useState<AvailableRide[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRideId, setCurrentRideId] = useState<string | null>(null);
  const [rideStatus, setRideStatus] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [acceptingRide, setAcceptingRide] = useState<string | null>(null);

  const fetchAvailableRides = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getSession('accessToken');
      if (!token) {
        setErrors(['You are not logged in. Please log in to continue.']);
        setLoading(false);
        return;
      }

      console.log('Fetching available rides with token:', token.substring(0, 20) + '...');
      
      const response = await axios.get(
        `http://${process.env.EXPO_PUBLIC_ADDRESS}:8002/rides/requests`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          params: {
            status: 'requested',
            role: 'rider'
          }
        }
      );

      console.log("Full API Response:", JSON.stringify(response.data, null, 2));

      if (response.data.rides && Array.isArray(response.data.rides)) {
        // Filter out rides that are not in 'requested' status
        const availableRides = response.data.rides.filter((ride: { status: string }) => 
          ride.status === 'requested' || ride.status === 'pending'
        );

        // console.log("Available rides before mapping:", availableRides);

        const validRides = availableRides.map((ride: any) => {
          const mappedRide = {
            _id: ride._id || ride.id,
            rideId: ride._id || ride.id,
            customerId:  ride.customerId,
            start_location: {
              address: typeof ride.start_location === 'string' ? 
                ride.start_location : 
                ride.start_location?.address || 'Location not available',
              coordinates: null
            },
            destination: {
              address: typeof ride.destination === 'string' ? 
                ride.destination : 
                ride.destination?.address || 'Destination not available',
              coordinates: null
            },
            status: ride.status || 'requested',
            distance: parseFloat(ride.distance) || 0,
            minimumPrice: parseFloat(ride.amount || ride.minimumPrice) || 0,
            bidPrice: parseFloat(ride.bidPrice || ride.amount) || 0
          };
          console.log(`Mapped ride ${mappedRide._id}:`, mappedRide);
          return mappedRide;
        });

        console.log("Final mapped rides:", validRides);
        setAvailableRides(validRides);
        setErrors([]);
      } else {
        console.warn("Invalid or empty rides data:", response.data);
        setAvailableRides([]);
      }
    } catch (error: any) {
      console.error('Error fetching available rides:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Full error response:', error.response?.data);
        console.error('Error request config:', {
          url: error.config?.url,
          method: error.config?.method,
          params: error.config?.params,
          headers: error.config?.headers
        });
        
        if (error.response?.status === 400) {
          console.error('Bad request details:', error.response.data);
          setErrors([error.response.data.message || 'Invalid request parameters']);
        } else if (error.response?.status === 401) {
          setErrors(['Your session has expired. Please log in again.']);
        } else if (error.response?.status === 403) {
          setErrors(['You do not have permission to view available rides.']);
        } else if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
          setErrors(error.response.data.details.map((err: any) => err.message));
        } else if (error.response?.data?.message) {
          setErrors([error.response.data.message]);
        } else {
          setErrors(['Failed to fetch available rides. Please try again.']);
        }
      } else {
        setErrors(['Network error. Please check your connection.']);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRideDetails = useCallback(async (rideId: string) => {
    try {
      if (!rideId) {
        console.error("fetchRideDetails called without rideId");
        return;
      }
      const token = await getSession('accessToken');
      console.log("Token for ride details:", token?.substring(0, 20) + "...");
      console.log("Fetching ride details for rideId:", rideId);
      
      const response = await axios.get(
        `http://${process.env.EXPO_PUBLIC_ADDRESS}:8002/rides/${rideId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      console.log("Received ride details:", response.data);

      // Check if we have rides data
      if (response.data.rides && Array.isArray(response.data.rides)) {
        // Map the server response to our AvailableRide interface
        const bidPrice = response.data.bid?.amount || 0;
        const updatedRides = response.data.rides.map((ride: any) => ({
          _id: ride.customer, // Assuming this is the ride ID
          start_location: {
            address: ride.start_location,
            coordinates: null // Add coordinates if available in response
          },
          destination: {
            address: ride.destination,
            coordinates: null // Add coordinates if available in response
          },
          customerId: ride.customerId,
          status: ride.status,
          distance: ride.distance || 0,
          minimumPrice: ride.amount || 0,
          bidPrice: bidPrice
        }));

        console.log("Mapped rides:", updatedRides);
        setAvailableRides(updatedRides);
      } else {
        console.warn("No rides data in response:", response.data);
      }
    } catch (error) {
      console.error('Error fetching ride details:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Request URL:', error.config?.url);
      }
    }
  }, []);
  

  const handleAcceptRide = useCallback(async (ride: AvailableRide) => {
    if (!ride.rideId && !ride._id) {
      Alert.alert('Error', 'Invalid ride information');
      return;
    }

    try {
      setAcceptingRide(ride._id);
      const token = await getSession('accessToken');
      if (!token) {
        Alert.alert('Error', 'You are not logged in. Please log in to continue.');
        return;
      }

      // First ensure socket is connected
      if (!socketService.isConnected()) {
        console.log('Connecting to socket server...');
        await socketService.connect();
      }

      const rideId = ride.rideId || ride._id;
      console.log('Attempting to accept ride:', {
        rideId,
        rideStatus: ride.status,
        customerId: ride.customerId
      });
      
      // Verify ride is still available before accepting
      const checkResponse = await axios.get(
        `http://${process.env.EXPO_PUBLIC_ADDRESS}:8002/rides/${rideId}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Ride status check response:', checkResponse.data);
      if (!checkResponse.data.ride) {
        throw new Error('Ride not found or server error');
      }
      if (checkResponse.data.ride?.status !== 'requested') {
        throw new Error('Ride is no longer available for acceptance');
      }
      
      
      const response = await axios.post(
        `http://${process.env.EXPO_PUBLIC_ADDRESS}:8002/rides/rider-request`,
        { 
          rideId: rideId
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      console.log('Accept ride response:', response.data);

      if (!response.data.riderId) {
        throw new Error('No rider ID received from server');
      }

      setCurrentRideId(rideId);
      
      // Join the ride room
      const joinResponse = await socketService.joinRideRoom(rideId, response.data.riderId);
      console.log('Join room response:', joinResponse);

      if (!joinResponse.success) {
        throw new Error(joinResponse.error || 'Failed to join ride room');
      }
      
      // Navigate to chat screen
      router.push({
        pathname: '/(root)/(rides)/ChatScreen',
        params: {
          rideId: rideId,
          riderId: response.data.riderId,
          isRider: 'true'
        }
      });

    } catch (error: any) {
      console.error('Error accepting ride:', error);
      let errorMessage = 'Failed to accept ride. Please try again.';
      
      if (axios.isAxiosError(error)) {
        console.error('Full error response:', error.response?.data);
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.status === 401) {
          errorMessage = 'You are not authorized. Please log in again.';
        } else if (error.response?.status === 404) {
          errorMessage = 'This ride is no longer available.';
        } else if (error.response?.status === 400) {
          errorMessage = 'This ride has already been taken by another rider.';
        }
      } else if (error.message === 'Ride is no longer available for acceptance') {
        errorMessage = 'This ride has already been taken by another rider.';
      }
      
      Alert.alert('Error', errorMessage);
      setCurrentRideId(null);
      // Refresh the rides list after error
      fetchAvailableRides();
    } finally {
      setAcceptingRide(null);
    }
  }, [router, fetchAvailableRides]);

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    let pollInterval: ReturnType<typeof setTimeout>;

    const fetchWithRetry = async () => {
      try {
        await fetchAvailableRides();
        retryCount = 0; // Reset retry count on success
        if (mounted) {
          pollInterval = setTimeout(fetchWithRetry, 5000); // Poll every 5 seconds on success
        }
      } catch (error) {
        console.error('Polling error:', error);
        retryCount++;
        const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Exponential backoff, max 30s
        if (mounted) {
          pollInterval = setTimeout(fetchWithRetry, backoffDelay);
        }
      }
    };

    fetchWithRetry();

    return () => {
      mounted = false;
      if (pollInterval) {
        clearTimeout(pollInterval);
      }
    };
  }, [fetchAvailableRides]);

  useEffect(() => {
    let mounted = true;

    const setupSocket = async () => {
      try {
        await socketService.connect();
        if (mounted) setIsConnected(true);
      } catch (error) {
        console.error('Socket connection error:', error);
        if (mounted) setIsConnected(false);
      }
    };

    const onNewBid = (event: NewBidEvent) => {
      console.log("New bid event received:", event);
      // Check if we have a valid rideId from the event
      if (!event?.rideId) {
        console.error("Invalid bid event - missing rideId:", event);
        return;
      }
      
      // Update ride details regardless of currentRideId
      console.log("Calling fetchRideDetails with rideId:", event.rideId);
      fetchRideDetails(event.rideId);
    };

    const onRideStatusUpdate = (event: RideStatusUpdateEvent) => {
      if (!mounted) return;
      
      if (currentRideId === event.rideId) {
        setRideStatus(event.status.status);
        if (event.status.status === 'completed' || event.status.status === 'cancelled') {
          setCurrentRideId(null);
          fetchAvailableRides();
        }
      }
    };

    // Setup socket connection and event listeners
    setupSocket();
    socketService.onNewBid(onNewBid);
    socketService.onRideStatusUpdate(onRideStatusUpdate);

    // Initial fetch
    fetchAvailableRides();

    return () => {
      mounted = false;
      if (currentRideId) {
        socketService.leaveRideRoom(currentRideId, ''); // Empty string as we don't need userId for cleanup
      }
      socketService.removeAllListeners();
    };
  }, [currentRideId, fetchAvailableRides, fetchRideDetails]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4B7BE5" />
      </View>
    );
  }

  if (!isConnected) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Connecting to server...</Text>
        <AppButton
          title="Retry Connection"
          onPress={() => socketService.connect()}
          style={styles.retryButton}
        />
      </View>
    );
  }

  if (currentRideId) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Current Ride</Text>
        <Text style={styles.status}>Status: {rideStatus}</Text>
        {errors.length > 0 && (
          <View style={styles.errorContainer}>
            {errors.map((error, index) => (
              <Text key={`error-${index}`} style={styles.errorText}>{error}</Text>
            ))}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Rides</Text>
      {errors.length > 0 && (
        <View style={styles.errorContainer}>
          {errors.map((error, index) => (
            <Text key={`error-${index}`} style={styles.errorText}>{error}</Text>
          ))}
        </View>
      )}
      {availableRides.length === 0 ? (
        <Text style={styles.noRides}>No rides available at the moment</Text>
      ) : (
        <ScrollView 
          style={styles.ridesList}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {availableRides.map((ride, index) => (
            <View 
              key={ride._id || `temp-ride-${index}`} 
              style={styles.rideCard}
            >
              <Text style={styles.rideDetail}>
                From: {typeof ride.start_location === 'object' && ride.start_location?.address ? 
                  ride.start_location.address : 'Location not available'}
              </Text>
              <Text style={styles.rideDetail}>
                Customer ID: {ride.customerId}
              </Text>
              <Text style={styles.rideDetail}>
                To: {typeof ride.destination === 'object' && ride.destination?.address ? 
                  ride.destination.address : 'Destination not available'}
              </Text>
              <Text style={styles.rideDetail}>
                Distance: {typeof ride.distance === 'number' ? 
                  ride.distance.toFixed(2) : '0'} km
              </Text>
              <Text style={styles.price}>
                Minimum Price: Rs. {typeof ride.minimumPrice === 'number' ? 
                  ride.minimumPrice.toFixed(2) : '0'}
              </Text>
              {ride.bidPrice !== undefined && (
                <Text style={styles.price}>
                  Bid Price: Rs. {typeof ride.bidPrice === 'number' ? 
                    ride.bidPrice.toFixed(2) : '0'}
                </Text>
              )}
              <AppButton
                title={acceptingRide === ride._id ? "Accepting..." : "Accept Ride"}
                onPress={() => ride._id ? handleAcceptRide(ride) : null}
                style={[
                  styles.acceptButton,
                  (!ride._id || acceptingRide === ride._id) && styles.disabledButton
                ]}
                disabled={!ride._id || acceptingRide === ride._id}
                Icon={acceptingRide === ride._id ? () => <ActivityIndicator color="white" size="small" /> : undefined}
              />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    flex: 1,
    backgroundColor: '#fff',
    maxHeight: '100%',
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  noRides: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  ridesList: {
    flex: 1,
    marginBottom: 10,
  },
  rideCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rideDetail: {
    fontSize: 16,
    marginBottom: 5,
    color: '#444',
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: '#27ae60',
    marginVertical: 10,
  },
  acceptButton: {
    backgroundColor: '#4B7BE5',
    marginTop: 10,
  },
  status: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  errorContainer: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#ffebee',
    borderRadius: 5,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    marginBottom: 5,
  },
  retryButton: {
    backgroundColor: '#4B7BE5',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  contentContainer: {
    flexGrow: 1,
  }
});

export default RiderDashboard;
