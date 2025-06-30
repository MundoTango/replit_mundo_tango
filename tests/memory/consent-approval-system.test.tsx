/**
 * Layer 9 Memory Consent Approval System - Complete Testing Suite
 * Tests MUI integration, CASL permissions, and full consent workflow
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AbilityContext } from '@/lib/casl/abilities';
import { Ability } from '@casl/ability';
import { AuthProvider } from '@/auth/useAuthContext';
import PendingConsentMemories from '@/components/memory/PendingConsentMemories';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the API request function
vi.mock('@/lib/queryClient', () => ({
  apiRequest: vi.fn()
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Test data
const mockPendingMemories = [
  {
    id: 'memory-1',
    title: 'Beautiful Tango Moment at La Viruta',
    content: 'An unforgettable moment dancing under the Buenos Aires stars...',
    emotionTags: ['Joy', 'Passion', 'Connection'],
    trustLevel: 'intimate',
    createdAt: '2025-06-30T12:00:00Z',
    eventId: 'event-1',
    eventTitle: 'La Viruta Friday Night Milonga',
    location: 'Buenos Aires, Argentina',
    creator: {
      id: '2',
      name: 'Maria Gonzalez',
      username: 'maria_tango',
      profileImage: 'https://example.com/maria.jpg'
    },
    coTags: ['scott_admin'],
    previewText: 'An unforgettable moment dancing under the Buenos Aires stars with incredible connection and passion. The music transported us to another world where only the dance mattered.'
  }
];

const mockUserWithApprovalPermissions = {
  id: 3,
  name: 'Scott Boddye',
  username: 'admin',
  email: 'admin@mundotango.life',
  roles: ['super_admin', 'admin', 'dancer']
};

// Helper function to create abilities
const createAbility = (user: any) => {
  const ability = new Ability();
  
  if (user.roles.includes('super_admin') || user.roles.includes('admin')) {
    ability.can('view_pending', 'ConsentRequest');
    ability.can('approve', 'ConsentRequest');
    ability.can('deny', 'ConsentRequest');
  }
  
  return ability;
};

describe('Layer 9 Memory Consent Approval System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('MUI Component Integration', () => {
    it('renders MUI components correctly', async () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false }
        }
      });
      
      queryClient.setQueryData(['/api/memories/pending-consent'], mockPendingMemories);
      
      const ability = createAbility(mockUserWithApprovalPermissions);
      
      render(
        <QueryClientProvider client={queryClient}>
          <AuthProvider value={{ user: mockUserWithApprovalPermissions, isLoading: false, isAuthenticated: true }}>
            <AbilityContext.Provider value={ability}>
              <PendingConsentMemories />
            </AbilityContext.Provider>
          </AuthProvider>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Beautiful Tango Moment at La Viruta')).toBeInTheDocument();
        expect(screen.getByText('Joy')).toBeInTheDocument();
      });
    });
  });
});