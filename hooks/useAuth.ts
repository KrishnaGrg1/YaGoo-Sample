import { useEffect, useState } from 'react';
import { getSession } from '@/usableFunction/Session';
import type { User } from '@/types';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const accessToken = await getSession('accessToken');
        if (accessToken) {
          setToken(accessToken);
          setIsAuthenticated(true);
          // TODO: Decode user from token or fetch user data
        } else {
          setToken(null);
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setToken(null);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  return {
    isAuthenticated,
    token,
    user,
    loading,
  };
} 