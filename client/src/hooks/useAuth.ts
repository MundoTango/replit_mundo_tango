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