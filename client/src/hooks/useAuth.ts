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

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}