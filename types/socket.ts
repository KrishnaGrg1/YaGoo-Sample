import type { Socket } from 'socket.io-client';
import type { DefaultEventsMap } from '@socket.io/component-emitter';

export interface RideLocation {
  latitude: number;
  longitude: number;
}

export interface Rider {
  id: string;
  name: string;
  email: string;
  phone: string;
  location?: RideLocation;
  rating?: number;
}

export interface RideStatus {
  rideId: string;
  status: 'pending' | 'accepted' | 'started' | 'completed' | 'cancelled';
  driverId?: string;
  riderId?: string;
  currentLocation?: {
    lat: number;
    lon: number;
  };
  updatedAt: string;
  estimatedArrival?: {
    pickup?: number;
    destination?: number;
  };
}

export interface Bid {
  bidId: string;
  rideId: string;
  driverId: string;
  amount: number;
  estimatedTime: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  driverDetails?: {
    name: string;
    rating: number;
    vehicleDetails: {
      model: string;
      color: string;
      plateNumber: string;
    };
  };
}

export interface SocketContextType {
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: () => boolean;
  isConnecting: () => boolean;
  joinRideRoom: (rideId: string, userId: string) => Promise<RiderJoinResponse>;
  leaveRideRoom: (rideId: string, userId: string) => void;
  onNewBid: (handler: (event: NewBidEvent) => void) => void;
  onRideAccepted: (handler: (event: RideAcceptedEvent) => void) => void;
  onRideCancelled: (handler: (event: RideCancelledEvent) => void) => void;
  onRiderLocationUpdate: (handler: (event: RiderLocationUpdateEvent) => void) => void;
  onRideStatusUpdate: (handler: (event: RideStatusUpdateEvent) => void) => void;
  updateLocation: (location: { latitude: number; longitude: number }) => void;
  getDiagnosticInfo: () => SocketDiagnosticInfo;
  removeAllListeners: () => void;
}

export interface SocketData {
  currentRideId?: string;
}

export interface RiderJoinResponse {
  success: boolean;
  error?: string;
  rideDetails?: {
    rideId: string;
    driverId: string;
    status: string;
    currentLocation?: {
      lat: number;
      lon: number;
    };
  };
}

export interface NewBidEvent {
  bidId: string;
  rideId: string;
  riderId: string;
  amount: number;
  timestamp: string;
}

export interface RideAcceptedEvent {
  rideId: string;
  riderId: string;
  rider: {
    id: string;
    name: string;
    rating: number;
  };
  status: RideStatus;
}

export interface RideCancelledEvent {
  rideId: string;
  status: 'cancelled';
  reason?: string;
  timestamp: string;
}

export interface RiderLocationUpdateEvent {
  rideId: string;
  riderId: string;
  location: {
    latitude: number;
    longitude: number;
    timestamp: number;
  };
}

export interface RideStatusUpdateEvent {
  rideId: string;
  status: RideStatus;
  timestamp: string;
}

export interface SocketDiagnosticInfo {
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  reconnectionAttempts: number;
  lastError?: string;
  socketId?: string;
  transport?: string;
  ping?: number;
}

// Socket event map for type-safe event handling
export interface SocketEventMap {
  'newBid': NewBidEvent;
  'rideAccepted': RideAcceptedEvent;
  'rideCancelled': RideCancelledEvent;
  'riderLocationUpdate': RiderLocationUpdateEvent;
  'rideStatusUpdate': RideStatusUpdateEvent;
} 