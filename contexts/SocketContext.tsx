import React, { createContext, useContext, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import socketService from '@/services/socketService';
import { useAuth } from '@/hooks/useAuth';
import type { SocketContextType } from '@/types/socket';

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token } = useAuth();
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    // Initialize socket connection when authenticated
    if (isAuthenticated && token) {
      socketService.connect().catch(error => {
        console.error('Failed to connect socket:', error);
      });
    }

    // Handle app state changes
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to foreground
        if (isAuthenticated && !socketService.isConnected()) {
          socketService.connect().catch(error => {
            console.error('Failed to reconnect socket:', error);
          });
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App has gone to background
        socketService.disconnect();
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
      socketService.disconnect();
    };
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider value={socketService}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
} 