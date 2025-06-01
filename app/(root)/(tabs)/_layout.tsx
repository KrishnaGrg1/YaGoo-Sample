import { LocationSetterProvider } from '@/components/LocationSetterContext';
import { Tabs } from 'expo-router';
import { MapPin, User, Clock, Home } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <LocationSetterProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#007AFF',
        }}>
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />

        <Tabs.Screen
          name="rides"
          options={{
            title: 'My Rides',
            tabBarIcon: ({ size, color }) => <Clock size={size} color={color} />,
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
      </Tabs>
    </LocationSetterProvider>
  );
}