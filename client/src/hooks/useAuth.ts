import { useQuery } from '@tanstack/react-query';

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  profileImage?: string;
  // Additional fields for onboarding and role management
  formStatus?: number;
  isOnboardingComplete?: boolean;
  codeOfConductAccepted?: boolean;
  tangoRoles?: string[];
  roles?: string[];
}

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async (): Promise<User | null> => {
      try {
        console.log('Fetching auth user...');
        const response = await fetch('/api/auth/user', {
          credentials: 'include'
        });
        console.log('Auth response status:', response.status);
        if (!response.ok) {
          console.log('Auth response not ok');
          return null;
        }
        const data = await response.json();
        console.log('Auth user data:', data);
        return data;
      } catch (error) {
        console.error('Auth error:', error);
        return null;
      }
    },
    retry: false
  });

  const logout = () => {
    localStorage.removeItem('auth_token');
    // Force query invalidation to clear user data
    window.location.reload();
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout
  };
}