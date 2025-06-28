import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

interface AuthUser extends Omit<User, 'formStatus' | 'isOnboardingComplete' | 'codeOfConductAccepted'> {
  formStatus?: number;
  isOnboardingComplete?: boolean;
  codeOfConductAccepted?: boolean;
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<AuthUser>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}