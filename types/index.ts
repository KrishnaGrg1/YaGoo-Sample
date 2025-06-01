// Common types used across the application

// User related types
export interface User {
  id: string;
  role: 'customer' | 'rider';
  name: string;
  email: string;
  phone?: string;
  rating?: number;
}

// Location related types
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface LocationWithCoordinates {
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
}

// Ride related types
export interface Ride {
  _id: string;
  customer: string;
  rider?: string;
  start_location: LocationWithCoordinates;
  destination: LocationWithCoordinates;
  status: 'not-started' | 'requested' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  amount?: number;
  distance?: number;
  totalTime?: string;
  date: string;
}

// Socket related types
export interface SocketMessage {
  event: string;
  data: any;
}

export interface RideRequest {
  rideId: string;
  pickupLocation: LocationWithCoordinates;
  destination: LocationWithCoordinates;
  customerId: string;
  status: string;
  minimumPrice: number;
  timestamp: string;
}

export interface Bid {
  bidId: string;
  rideId: string;
  riderId: string;
  amount: number;
  estimatedTime: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  riderDetails?: {
    name: string;
    rating: number;
    vehicleDetails: {
      model: string;
      color: string;
      plateNumber: string;
    };
  };
}

// Component prop types
export interface InputProps {
  icon?: React.ReactNode;
  placeholder: string;
  value: string;
  setValue: (value: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  error?: string;
  editable?: boolean;
}

export interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: any;
  Icon?: () => React.ReactNode;
} 