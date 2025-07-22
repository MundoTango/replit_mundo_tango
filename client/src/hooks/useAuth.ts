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
        
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('Auth response status:', response.status);
        if (!response.ok) {
          console.log('Auth response not ok');
          return null;
        }
        const data = await response.json();
        console.log('Auth user data:', data);
        return data;
      } catch (error) {
        if (error.name === 'AbortError') {
          console.error('Auth request timed out after 5 seconds');
        } else {
          console.error('Auth error:', error);
        }
        return null;
      }
    },
    retry: false,
    staleTime: 30000 // Consider data fresh for 30 seconds
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