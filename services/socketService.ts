import { io, Socket } from 'socket.io-client';
import type { DefaultEventsMap } from '@socket.io/component-emitter';
import { getSession } from '@/utils/Session';
import { SOCKET_CONFIG, SOCKET_EVENTS, SOCKET_ERROR_MESSAGES } from '@/constants/socket';
import type {
  SocketContextType,
  SocketData,
  RiderJoinResponse,
  NewBidEvent,
  RideAcceptedEvent,
  RideCancelledEvent,
  RiderLocationUpdateEvent,
  RideStatusUpdateEvent,
  SocketDiagnosticInfo,
  SocketEventMap,
  Bid,
  RideStatus,
  RideLocation,
  Rider
} from '@/types/socket';
import { Platform } from 'react-native';

// Add server URL construction
const getServerUrl = () => {
  const address = process.env.EXPO_PUBLIC_ADDRESS;
  console.log('[Socket Debug] Environment variables:', process.env);
  console.log('[Socket Debug] Socket server address:', address);

  if (!address) {
    console.error('[Socket Debug] EXPO_PUBLIC_ADDRESS not set in environment');
    // For development, use your computer's IP address
    return 'http://192.168.1.65:8002';
  }

  // Check if running on Android emulator
  if (Platform.OS === 'android' && !__DEV__) {
    console.log('Running on Android emulator');
    return 'http://10.0.2.2:8002';
  }

  // Check if running on iOS simulator
  if (Platform.OS === 'ios' && !__DEV__) {
    console.log('Running on iOS simulator');
    return 'http://localhost:8002';
  }

  // For physical device or development
  const serverUrl = `http://${address}:8002`;
  console.log('[Socket Debug] Using server URL:', serverUrl);
  return serverUrl;
};

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  rideId: string;
}

interface MessageHandler {
  (message: any): void;
}

interface LocationUpdate {
  rideId: string;
  userId: string;
  userType: 'rider' | 'driver';
  location: RideLocation & { timestamp: number };
}

interface LocationEventHandler {
  (update: LocationUpdate): void;
}

type Transport = 'websocket' | 'polling';
const TRANSPORTS: [Transport, Transport] = ['websocket', 'polling'];

interface RideRequest {
  rideId: string;
  pickupLocation: {
    address: string;
    coordinates: RideLocation;
  };
  destination: {
    address: string;
    coordinates: RideLocation;
  };
  customerId: string;
  status: string;
  minimumPrice: number;
  timestamp: string;
}

class SocketService implements SocketContextType {
  private static instance: SocketService | null = null;
  private socket: Socket<DefaultEventsMap, DefaultEventsMap> & { data?: SocketData } | null = null;
  private reconnectionAttempts = 0;
  private reconnectionTimer: ReturnType<typeof setTimeout> | null = null;
  private connecting = false;
  private connectionPromise: Promise<void> | null = null;
  private eventQueue: Array<{ event: keyof SocketEventMap; handler: (event: any) => void }> = [];
  private messageHandlers: Set<MessageHandler> = new Set();
  private bidHandlers: {
    newBid: Set<(event: NewBidEvent) => void>;
    bidUpdated: Set<(event: Bid) => void>;
    bidAccepted: Set<(event: Bid) => void>;
    bidExpired: Set<(event: Bid) => void>;
  } = {
    newBid: new Set(),
    bidUpdated: new Set(),
    bidAccepted: new Set(),
    bidExpired: new Set(),
  };
  private rideHandlers: {
    rideAccepted: Set<(event: RideAcceptedEvent) => void>;
    rideStarted: Set<(event: RideStatus) => void>;
    rideCompleted: Set<(event: RideStatus) => void>;
    rideCancelled: Set<(event: RideCancelledEvent) => void>;
    rideStatusUpdated: Set<(event: RideStatusUpdateEvent) => void>;
  } = {
    rideAccepted: new Set(),
    rideStarted: new Set(),
    rideCompleted: new Set(),
    rideCancelled: new Set(),
    rideStatusUpdated: new Set(),
  };
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  private lastError: Error | null = null;
  private lastSuccessfulConnection: number | null = null;
  private serverHealthCheckTimer: ReturnType<typeof setInterval> | null = null;
  private connectionOptions = {
    reconnectionAttempts: SOCKET_CONFIG.MAX_RECONNECTION_ATTEMPTS,
    reconnectionDelay: SOCKET_CONFIG.RECONNECTION_DELAY,
    timeout: SOCKET_CONFIG.CONNECTION_TIMEOUT,
    transports: ['websocket', 'polling'],
    forceNew: true,
    autoConnect: false,
    reconnection: true,
    reconnectionAttemptDelay: SOCKET_CONFIG.RECONNECTION_DELAY,
    path: '/socket.io/',
    withCredentials: false,
    rejectUnauthorized: false,
    secure: false,
    query: {
      platform: SOCKET_CONFIG.PLATFORM,
      version: SOCKET_CONFIG.VERSION,
      EIO: SOCKET_CONFIG.ENGINE_VERSION,
    }
  };
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private locationHandlers: {
    riderLocationUpdate: Set<LocationEventHandler>;
    driverLocationUpdate: Set<LocationEventHandler>;
  } = {
    riderLocationUpdate: new Set(),
    driverLocationUpdate: new Set(),
  };
  private lastPongTime: number = Date.now();

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public isConnecting(): boolean {
    return this.connecting;
  }

  public async connect(): Promise<void> {
    console.log('[Socket Debug] Connect method called');
    // If already connected, return immediately
    if (this.socket?.connected) {
      console.log('[Socket Debug] Already connected, returning');
      return;
    }

    // If connecting, return existing promise
    if (this.connectionPromise) {
      console.log('[Socket Debug] Connection already in progress');
      return this.connectionPromise;
    }

    this.connectionPromise = this._connect();
    try {
      await this.connectionPromise;
    } finally {
      this.connectionPromise = null;
    }
  }

  private async testServerConnection(url: string): Promise<boolean> {
    try {
      console.log('[Socket Debug] Testing server connection to:', url);
      const response = await fetch(`${url}/health`);
      
      // Check if response is HTML (error page)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.error('[Socket Debug] Server returned HTML instead of JSON. Server might not be running properly.');
        return false;
      }

      // Try to parse JSON response
      try {
        const data = await response.json();
        console.log('[Socket Debug] Server test response:', data);
        return true;
      } catch (parseError) {
        console.error('[Socket Debug] Failed to parse server response:', parseError);
        return false;
      }
    } catch (error) {
      console.error('[Socket Debug] Server test failed:', error);
      return false;
    }
  }

  private async _connect(): Promise<void> {
    if (this.connecting) {
      console.log('[Socket Debug] Connection already in progress');
      return;
    }

    const serverUrl = getServerUrl();
    if (!serverUrl) {
      console.error('[Socket Debug] No server URL available');
      throw new Error(SOCKET_ERROR_MESSAGES.INVALID_SERVER_CONFIG);
    }

    this.connecting = true;
    this.connectionStatus = 'connecting';

    try {
      // Test server connection first
      const isServerAccessible = await this.testServerConnection(serverUrl);
      if (!isServerAccessible) {
        throw new Error('Cannot connect to server. Please check your network connection and server status.');
      }

      console.log('[Socket Debug] Attempting to connect to:', serverUrl);
      
      const token = await getSession('accessToken');
      if (!token) {
        console.error('[Socket Debug] No auth token found');
        throw new Error(SOCKET_ERROR_MESSAGES.NO_AUTH_TOKEN);
      }
      console.log('[Socket Debug] Auth token retrieved:', token.substring(0, 10) + '...');

      // Clean up existing socket if any
      this.cleanupSocket();

      const options = {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 5000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        path: '/socket.io',
      };

      console.log('[Socket Debug] Creating socket with options:', JSON.stringify(options, null, 2));
      
      // Create socket instance
      this.socket = io(serverUrl, options);

      // Set up connection event handlers first
      this.socket.on('connect', () => {
        console.log('[Socket Debug] Socket connected successfully');
        this.connectionStatus = 'connected';
        this.reconnectionAttempts = 0;
        this.lastError = null;
        this.lastSuccessfulConnection = Date.now();
      });

      this.socket.on('connect_error', (error) => {
        console.error('[Socket Debug] Socket connect_error:', error.message);
        this.lastError = error;
      });

      this.socket.on('error', (error) => {
        console.error('[Socket Debug] Socket error:', error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[Socket Debug] Socket disconnected:', reason);
        this.connectionStatus = 'disconnected';
      });

      // Connect the socket
      console.log('[Socket Debug] Calling socket.connect()');
      this.socket.connect();

      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.error('[Socket Debug] Connection timeout after 5000ms');
          reject(new Error('Connection timeout'));
        }, 5000);

        this.socket?.once('connect', () => {
          console.log('[Socket Debug] Connection promise resolved');
          clearTimeout(timeout);
          resolve();
        });

        this.socket?.once('connect_error', (error) => {
          console.error('[Socket Debug] Connection promise rejected:', error.message);
          clearTimeout(timeout);
          reject(error);
        });
      });

      this.startPingInterval();
      this.processEventQueue();

    } catch (error) {
      console.error('[Socket Debug] Socket connection error details:', error);
      this.handleConnectionError(error);
      throw error;
    } finally {
      this.connecting = false;
    }
  }

  private startPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.pingInterval = setInterval(() => {
      if (!this.socket?.connected) {
        console.log('Socket not connected during ping');
        return;
      }

      this.socket.emit('ping');
      console.log('Ping sent');

      // Set up a timeout for pong response
      const pongTimeout = setTimeout(() => {
        console.log('Pong timeout - reconnecting');
        this.reconnect();
      }, 5000);

      // Listen for pong
      this.socket.once('pong', () => {
        clearTimeout(pongTimeout);
        console.log('Pong received');
        this.lastPongTime = Date.now();
      });
    }, 30000); // Ping every 30 seconds
  }

  public async reconnect(): Promise<void> {
    console.log('Attempting to reconnect...');
    this.cleanupSocket();
    await this.connect();
  }

  public disconnect(): void {
    this.cleanupSocket();
    this.connectionStatus = 'disconnected';
    this.lastError = null;
    this.reconnectionAttempts = 0;
    this.eventQueue = [];
  }

  private cleanupSocket(): void {
    if (this.socket) {
      console.log('Cleaning up existing socket');
      this.socket.removeAllListeners();
      this.socket.close();
      this.socket = null;
    }

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.reconnectionTimer) {
      clearTimeout(this.reconnectionTimer);
      this.reconnectionTimer = null;
    }
  }

  // Event handlers
  public onNewBid(handler: (event: NewBidEvent) => void): void {
    this.registerEventHandler<'newBid'>(SOCKET_EVENTS.NEW_BID, handler);
  }

  public onRideAccepted(handler: (event: RideAcceptedEvent) => void): void {
    this.registerEventHandler<'rideAccepted'>(SOCKET_EVENTS.RIDE_ACCEPTED, handler);
  }

  public onRideCancelled(handler: (event: RideCancelledEvent) => void): void {
    this.registerEventHandler<'rideCancelled'>(SOCKET_EVENTS.RIDE_CANCELLED, handler);
  }

  public onRiderLocationUpdate(handler: (event: RiderLocationUpdateEvent) => void): void {
    this.registerEventHandler<'riderLocationUpdate'>(SOCKET_EVENTS.RIDER_LOCATION_UPDATE, handler);
  }

  public onRideStatusUpdate(handler: (event: RideStatusUpdateEvent) => void): void {
    this.registerEventHandler<'rideStatusUpdate'>(SOCKET_EVENTS.RIDE_STATUS_UPDATE, handler);
  }

  private registerEventHandler<K extends keyof SocketEventMap>(
    event: K,
    handler: (event: SocketEventMap[K]) => void
  ): void {
    if (!this.socket?.connected) {
      this.eventQueue.push({ event, handler });
      this.connect().catch(console.error);
      return;
    }

    this.socket.on(event as string, handler as (...args: any[]) => void);
  }

  private processEventQueue(): void {
    while (this.eventQueue.length > 0) {
      const { event, handler } = this.eventQueue.shift()!;
      if (this.socket?.connected) {
        this.socket.on(event, handler);
      }
    }
  }

  // Room management
  public async joinRideRoom(rideId: string, userId: string): Promise<RiderJoinResponse> {
    if (!this.socket?.connected) {
      await this.connect();
    }

    return new Promise((resolve) => {
      this.socket!.emit(SOCKET_EVENTS.JOIN_RIDE, { rideId, userId }, (response: RiderJoinResponse) => {
        resolve(response);
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        resolve({ success: false, error: 'Request timed out' });
      }, 5000);
    });
  }

  public leaveRideRoom(rideId: string, userId: string): void {
    if (this.socket?.connected) {
      this.socket.emit(SOCKET_EVENTS.LEAVE_RIDE, { rideId, userId });
    }
  }

  public updateLocation(location: { latitude: number; longitude: number }): void {
    if (!this.socket?.connected) {
      console.warn(SOCKET_ERROR_MESSAGES.NOT_CONNECTED);
      return;
    }

    this.socket.emit(SOCKET_EVENTS.LOCATION_UPDATE, {
      location: {
        lat: location.latitude,
        lon: location.longitude,
        timestamp: Date.now()
      }
    });
  }

  public getDiagnosticInfo(): SocketDiagnosticInfo {
    return {
      connectionStatus: this.connectionStatus,
      reconnectionAttempts: this.reconnectionAttempts,
      lastError: this.lastError?.message,
      socketId: this.socket?.id,
      transport: this.socket?.io?.engine?.transport?.name,
      ping: this.lastPongTime ? Date.now() - this.lastPongTime : undefined
    };
  }

  private async checkServerHealth(): Promise<boolean> {
    const serverUrl = getServerUrl();
    if (!serverUrl) return false;

    try {
      const response = await fetch(`${serverUrl}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      return response.ok || response.status === 404; // 404 is ok as health endpoint might not exist
    } catch (error) {
      console.error('Server health check failed:', error);
      return false;
    }
  }

  private startServerHealthCheck(): void {
    if (this.serverHealthCheckTimer) {
      clearInterval(this.serverHealthCheckTimer);
    }

    this.serverHealthCheckTimer = setInterval(async () => {
      if (!this.socket?.connected && !this.connecting) {
        const isHealthy = await this.checkServerHealth();
        if (isHealthy) {
          this.reconnectionAttempts = 0;
          this.connect().catch(console.error);
        }
      }
    }, SOCKET_CONFIG.HEALTH_CHECK_INTERVAL);
  }

  private handleConnectionError(error: unknown): void {
    if (error instanceof Error) {
      this.lastError = error;
      throw error;
    }
    const err = new Error(String(error));
    this.lastError = err;
    throw err;
  }

  public removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.bidHandlers = {
        newBid: new Set(),
        bidUpdated: new Set(),
        bidAccepted: new Set(),
        bidExpired: new Set(),
      };
      this.rideHandlers = {
        rideAccepted: new Set(),
        rideStarted: new Set(),
        rideCompleted: new Set(),
        rideCancelled: new Set(),
        rideStatusUpdated: new Set(),
      };
    }
  }
}

// Create and export singleton instance
const socketService = SocketService.getInstance();
export default socketService;
export type { SocketService };