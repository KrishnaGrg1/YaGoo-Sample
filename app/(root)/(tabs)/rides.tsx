import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Clock, MapPin, Navigation } from 'lucide-react-native';
import axios from 'axios';
import { getSession } from '@/usableFunction/Session';

const IP_Address = process.env.EXPO_PUBLIC_ADDRESS || 'YOUR_IP_ADDRESS';

interface Ride {
  id: string;
  source: string;
  destination: string;
  status: string;
  bidAmount: number;
  distance: number;
  time: number;
  date: string;
}

export default function RidesScreen() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch rides from the backend
  const fetchRides = async () => {
    try {
      const token = await getSession('accessToken');
      if (!token) {
        Alert.alert('Authentication Error', 'You are not logged in. Please log in to continue.');
        return;
      }
      console.log("Ip Address:", IP_Address); // Debugging log
      const response = await axios.get(`http://${IP_Address}:8002/profile/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.data;
      const rides = response.data.rides;

      if (rides.length === 0) {
        console.log("No rides found.");
        // Show "No rides yet" UI
        setRides([])
      }
      console.log("Response data:", data); // Debugging log
      console.log("Fetched rides:", data);
      // Validate the response structure
      if (!data.rides || !Array.isArray(data.rides)) {
        console.error('Invalid response format:', data);
        Alert.alert('Error', 'Unexpected response format from the server.');
        return;
      }

      const formattedRides = data.rides.map((ride: any) => ({
        id: ride._id || Math.random().toString(),
        source: ride.start_location || 'Unknown Source',
        destination: ride.destination || 'Unknown Destination',
        status: ride.status || 'Pending',
        bidAmount: ride.amount || 0,
        distance: ride.distance || 0,
        time: ride.totalTime || 0,
        date: ride.date.split("T")[0],
      }));

      // Sort by date in descending order (latest first)
      interface FormattedRide {
        id: string;
        source: string;
        destination: string;
        status: string;
        bidAmount: number;
        distance: number;
        time: number;
        date: string;
      }

      formattedRides.sort((a: FormattedRide, b: FormattedRide) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setRides(formattedRides);

    } catch (error) {
      console.error('Error fetching rides:', error);
      Alert.alert('Error', 'Failed to fetch rides. Please try again later.');
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Call fetchRides initially
    fetchRides();

    // Set interval to refresh every 10 seconds
    const intervalId = setInterval(fetchRides, 10000);

    // Clear interval when component is unmounted
    return () => clearInterval(intervalId);
  }, []);

  const renderRide = ({ item }: { item: Ride }) => (
    <View style={styles.rideCard}>
      <View style={styles.header}>
        <Text style={styles.date}>{item.date}</Text>
        <Text
          style={[
            styles.status,
            { color: item.status === 'completed' ? '#4CAF50' : '#FF9800' },
          ]}
        >
          {item.status}
        </Text>
      </View>

      <View style={styles.locationContainer}>
        <View style={styles.locationRow}>
          <MapPin size={20} color="#666" />
          <Text style={styles.locationText}>{item.source}</Text>
        </View>
        <View style={styles.locationRow}>
          <Navigation size={20} color="#666" />
          <Text style={styles.locationText}>{item.destination}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Clock size={16} color="#666" />
        <Text style={styles.locationText}>Distance: {item.distance} km</Text>
        <Text style={styles.locationText}>Time: {item.time}</Text>
        <Text style={styles.bidAmount}>Rs.{item.bidAmount}</Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0066FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Rides</Text>
      {rides && rides.length == 0 ? (
        <View style={styles.norides}>
          <Text style={styles.title} >No rides yet.</Text>
        </View>
      ) : (

        <FlatList
          data={rides}
          renderItem={renderRide}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  norides: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    paddingTop: 60,
  },
  listContainer: {
    padding: 16,
  },
  rideCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
  locationContainer: {
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  bidAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066FF',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
