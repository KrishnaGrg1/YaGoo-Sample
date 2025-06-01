import { io, Socket } from 'socket.io-client';
import { getSession } from '@/usableFunction/Session';

const IP_Address = process.env.EXPO_PUBLIC_ADDRESS || 'YOUR_IP_ADDRESS';

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  rideId: string;
}

class ChatService {
  private static instance: ChatService;
  private socket: Socket | null = null;

  private constructor() {}

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async connect() {
    try {
      const token = await getSession('accessToken');
      if (!token) {
        console.error('No token available for chat connection');
        return;
      }

      this.socket = io(`http://${IP_Address}:8002/chat`, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.setupListeners();
    } catch (error) {
      console.error('Chat connection error:', error);
    }
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Chat connected:', this.socket?.id);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Chat connection error:', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Chat disconnected:', reason);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Chat events
  onNewMessage(callback: (message: ChatMessage) => void) {
    this.socket?.on('new_message', callback);
  }

  onChatEnded(callback: () => void) {
    this.socket?.on('chat_ended', callback);
  }

  onRiderArrived(callback: (data: { location: string }) => void) {
    this.socket?.on('rider_arrived', callback);
  }

  onRideCompleted(callback: (data: { duration: number, fare: number }) => void) {
    this.socket?.on('ride_completed', callback);
  }

  // Emit events
  sendMessage(rideId: string, content: string) {
    this.socket?.emit('send_message', { rideId, content });
  }

  endChat(rideId: string) {
    this.socket?.emit('end_chat', { rideId });
  }

  markRiderArrived(rideId: string, location: 'pickup' | 'destination') {
    this.socket?.emit('rider_arrived', { rideId, location });
  }

  markRideCompleted(rideId: string) {
    this.socket?.emit('ride_completed', { rideId });
  }

  // Room management
  joinChatRoom(rideId: string) {
    this.socket?.emit('join_chat', { rideId });
  }

  leaveChatRoom(rideId: string) {
    this.socket?.emit('leave_chat', { rideId });
  }

  // Cleanup listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // Check connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default ChatService.getInstance(); 