import { useQuery } from '@tanstack/react-query';

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  profileImage?: string;
}

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async (): Promise<User | null> => {
      try {
        const response = await fetch('/api/auth/user');
        if (!response.ok) {
          return null;
        }
        return response.json();
      } catch (error) {
        return null;
      }
    },
    retry: false
  });

  return {
    user,
    isAuthenticated: !!user,
    isLoading
  };
}