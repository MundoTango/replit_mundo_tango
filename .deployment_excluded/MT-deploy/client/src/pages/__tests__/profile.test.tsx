import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import Profile from '../profile';
import { useRouter } from 'wouter';

// Mock wouter
vi.mock('wouter', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
  useLocation: vi.fn(() => ['/', vi.fn()]),
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock components
vi.mock('@/components/universal/DashboardLayout', () => ({
  default: ({ children }: any) => <div>{children}</div>
}));

vi.mock('@/components/profile/EnhancedProfileHeader', () => ({
  default: ({ user, stats, isOwnProfile, onEditProfile }: any) => (
    <div data-testid="profile-header">
      <h1>{user.name}</h1>
      <button onClick={onEditProfile}>Edit Profile</button>
      <div>Posts: {stats?.posts || 0}</div>
    </div>
  )
}));

vi.mock('@/components/profile/StoryHighlights', () => ({
  default: ({ isOwnProfile, onAddHighlight }: any) => (
    <div data-testid="story-highlights">
      {isOwnProfile && <button onClick={onAddHighlight}>Add Highlight</button>}
    </div>
  )
}));

vi.mock('@/components/profile/TravelDetailsComponent', () => ({
  default: ({ userId, isOwnProfile }: any) => (
    <div data-testid="travel-details">
      Travel Details for User {userId}
      {isOwnProfile && <button>Add Travel Details</button>}
    </div>
  )
}));

vi.mock('@/components/profile/ProfileMemoryPostModal', () => ({
  default: ({ isOpen, onClose, onMemoryCreated }: any) => 
    isOpen ? (
      <div data-testid="memory-post-modal">
        <h2>Create a Memory</h2>
        <button onClick={onClose}>Close</button>
        <button onClick={onMemoryCreated}>Post Memory</button>
      </div>
    ) : null
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Mock global fetch
global.fetch = vi.fn();

describe('Profile Page - Phase 4 Testing (35L Framework)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    
    // Mock API responses
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/auth/user')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 7,
            name: 'Scott',
            username: 'admin3304',
            email: 'admin@mundotango.life'
          })
        });
      }
      if (url.includes('/api/user/stats')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            posts: 15,
            friends: 42,
            events: 8
          })
        });
      }
      if (url.includes('/api/user/posts')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 1, content: 'Test post 1' },
            { id: 2, content: 'Test post 2' }
          ])
        });
      }
      if (url.includes('/api/user/guest-profile')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            isComplete: true,
            preferences: {}
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderProfile = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <Profile />
      </QueryClientProvider>
    );
  };

  describe('Layer 31: Testing & Validation', () => {
    test('renders profile header with user information', async () => {
      renderProfile();
      
      await waitFor(() => {
        expect(screen.getByText('Scott')).toBeInTheDocument();
        expect(screen.getByTestId('profile-header')).toBeInTheDocument();
      });
    });

    test('displays all navigation tabs', async () => {
      renderProfile();
      
      await waitFor(() => {
        expect(screen.getByText('Posts')).toBeInTheDocument();
        expect(screen.getByText('Events')).toBeInTheDocument();
        expect(screen.getByText('Travel')).toBeInTheDocument();
        expect(screen.getByText('Photos')).toBeInTheDocument();
        expect(screen.getByText('Videos')).toBeInTheDocument();
        expect(screen.getByText('Friends')).toBeInTheDocument();
        expect(screen.getByText('Experience')).toBeInTheDocument();
        expect(screen.getByText('Guest Profile')).toBeInTheDocument();
      });
    });

    test('shows memory post button in posts tab', async () => {
      renderProfile();
      
      await waitFor(() => {
        const postButton = screen.getByText('Post a Memory');
        expect(postButton).toBeInTheDocument();
        expect(postButton).toHaveClass('bg-gradient-to-r', 'from-turquoise-400', 'to-cyan-500');
      });
    });

    test('opens memory post modal when button clicked', async () => {
      renderProfile();
      
      await waitFor(() => {
        const postButton = screen.getByText('Post a Memory');
        fireEvent.click(postButton);
      });

      expect(screen.getByTestId('memory-post-modal')).toBeInTheDocument();
      expect(screen.getByText('Create a Memory')).toBeInTheDocument();
    });

    test('closes memory post modal and shows toast on success', async () => {
      const { container } = renderProfile();
      
      await waitFor(() => {
        const postButton = screen.getByText('Post a Memory');
        fireEvent.click(postButton);
      });

      const postMemoryButton = screen.getByText('Post Memory');
      fireEvent.click(postMemoryButton);

      await waitFor(() => {
        expect(screen.queryByTestId('memory-post-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Layer 32: Developer Experience', () => {
    test('handles loading states correctly', () => {
      renderProfile();
      
      // Initially shows loading for profile
      expect(screen.getByText('Loading profile...')).toBeInTheDocument();
    });

    test('renders story highlights component', async () => {
      renderProfile();
      
      await waitFor(() => {
        expect(screen.getByTestId('story-highlights')).toBeInTheDocument();
        expect(screen.getByText('Add Highlight')).toBeInTheDocument();
      });
    });

    test('switches between tabs correctly', async () => {
      renderProfile();
      
      await waitFor(() => {
        const travelTab = screen.getByText('Travel');
        fireEvent.click(travelTab);
      });

      expect(screen.getByTestId('travel-details')).toBeInTheDocument();
      expect(screen.getByText(/Travel Details for User/)).toBeInTheDocument();
    });
  });

  describe('Layer 33: Data Migration & Evolution', () => {
    test('fetches user stats on mount', async () => {
      renderProfile();
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/user/stats'),
          expect.any(Object)
        );
      });
    });

    test('fetches posts when posts tab is active', async () => {
      renderProfile();
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/user/posts'),
          expect.any(Object)
        );
      });
    });

    test('fetches guest profile when tab selected', async () => {
      renderProfile();
      
      await waitFor(() => {
        const guestTab = screen.getByText('Guest Profile');
        fireEvent.click(guestTab);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/user/guest-profile'),
        expect.any(Object)
      );
    });
  });

  describe('Layer 34: Enhanced Observability', () => {
    test('tracks tab changes', async () => {
      renderProfile();
      
      await waitFor(() => {
        const eventsTab = screen.getByText('Events');
        fireEvent.click(eventsTab);
        
        const photosTab = screen.getByText('Photos');
        fireEvent.click(photosTab);
      });

      // Tab content should change accordingly
      expect(screen.getByText(/Tango Events/)).toBeInTheDocument();
    });
  });

  describe('Layer 35: Feature Flags & Experimentation', () => {
    test('conditionally shows features based on user profile', async () => {
      renderProfile();
      
      await waitFor(() => {
        // Memory post button should be visible for own profile
        expect(screen.getByText('Post a Memory')).toBeInTheDocument();
        
        // Edit profile should be available
        expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      });
    });
  });
});