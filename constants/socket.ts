export const SOCKET_CONFIG = {
  MAX_RECONNECTION_ATTEMPTS: 3,
  RECONNECTION_DELAY: 2000,
  PING_INTERVAL: 3000,
  PONG_TIMEOUT: 5000,
  CONNECTION_TIMEOUT: 5000,
  HEALTH_CHECK_INTERVAL: 10000,
  TRANSPORTS: ['websocket', 'polling'] as const,
  PATH: '/socket.io/',
  VERSION: '1.0.0',
  PLATFORM: 'mobile',
  ENGINE_VERSION: '4',
} as const;

export const SOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  ERROR: 'error',
  PING: 'ping',
  PONG: 'pong',

  // Ride events
  NEW_BID: 'newBid',
  RIDE_ACCEPTED: 'rideAccepted',
  RIDE_CANCELLED: 'rideCancelled',
  RIDE_STATUS_UPDATE: 'rideStatusUpdate',
  RIDER_LOCATION_UPDATE: 'riderLocationUpdate',
  DRIVER_LOCATION_UPDATE: 'driverLocationUpdate',

  // Room events
  JOIN_RIDE: 'join_ride',
  LEAVE_RIDE: 'leave_ride',
  LOCATION_UPDATE: 'location_update',
} as const;

export const SOCKET_ERROR_MESSAGES = {
  NOT_CONNECTED: 'Socket not connected',
  CONNECTION_TIMEOUT: 'Connection timeout',
  SERVER_HEALTH_CHECK_FAILED: 'Server health check failed',
  NO_AUTH_TOKEN: 'No authentication token available',
  INVALID_SERVER_CONFIG: 'Invalid server configuration',
  MAX_RECONNECTION_ATTEMPTS: 'Max reconnection attempts reached',
} as const; 