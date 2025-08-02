import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { jest } from '@jest/globals';

// Mock API and hooks
jest.mock('../../../../client/src/lib/queryClient', () => ({
  apiRequest: jest.fn(),
  queryClient: {
    invalidateQueries: jest.fn()
  }
}));

jest.mock('../../../../client/src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Current User' },
    isAuthenticated: true
  })
}));

// Import component after mocking
import ProfileCard from '../../../../client/src/components/profile/ProfileCard';
import { apiRequest, queryClient } from '../../../../client/src/lib/queryClient';

const createWrapper = () => {
  const testQueryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const mockProfile = {
  id: 2,
  name: 'Maria Gonzalez',
  username: 'mariag',
  email: 'maria@example.com',
  bio: 'Professional tango dancer and instructor. Teaching traditional Argentine tango.',
  profileImage: '/images/maria.jpg',
  backgroundImage: '/images/tango-bg.jpg',
  city: 'Buenos Aires',
  country: 'Argentina',
  tangoRoles: ['leader', 'follower', 'teacher'],
  tangoLevel: 'professional',
  yearsDancing: 15,
  languages: ['Spanish', 'English', 'Italian'],
  isFollowing: false,
  stats: {
    followers: 1250,
    following: 320,
    posts: 145,
    events: 45
  }
};

describe('ProfileCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render profile information', () => {
    render(<ProfileCard profile={mockProfile} />, { wrapper: createWrapper() });

    expect(screen.getByText('Maria Gonzalez')).toBeInTheDocument();
    expect(screen.getByText('@mariag')).toBeInTheDocument();
    expect(screen.getByText(/Professional tango dancer/i)).toBeInTheDocument();
    expect(screen.getByText('Buenos Aires, Argentina')).toBeInTheDocument();
  });

  it('should display tango roles', () => {
    render(<ProfileCard profile={mockProfile} />, { wrapper: createWrapper() });

    expect(screen.getByText('Leader')).toBeInTheDocument();
    expect(screen.getByText('Follower')).toBeInTheDocument();
    expect(screen.getByText('Teacher')).toBeInTheDocument();
  });

  it('should show profile statistics', () => {
    render(<ProfileCard profile={mockProfile} />, { wrapper: createWrapper() });

    expect(screen.getByText('1,250')).toBeInTheDocument();
    expect(screen.getByText('Followers')).toBeInTheDocument();
    expect(screen.getByText('320')).toBeInTheDocument();
    expect(screen.getByText('Following')).toBeInTheDocument();
    expect(screen.getByText('145')).toBeInTheDocument();
    expect(screen.getByText('Posts')).toBeInTheDocument();
  });

  it('should handle follow/unfollow', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, isFollowing: true })
    });

    render(<ProfileCard profile={mockProfile} />, { wrapper: createWrapper() });

    const followButton = screen.getByRole('button', { name: /follow/i });
    await user.click(followButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/users/2/follow', {});
      expect(screen.getByRole('button', { name: /unfollow/i })).toBeInTheDocument();
    });
  });

  it('should show edit button for own profile', () => {
    const ownProfile = {
      ...mockProfile,
      id: 1 // Same as current user
    };

    render(<ProfileCard profile={ownProfile} />, { wrapper: createWrapper() });

    expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /follow/i })).not.toBeInTheDocument();
  });

  it('should open message dialog', async () => {
    const user = userEvent.setup();
    
    render(<ProfileCard profile={mockProfile} />, { wrapper: createWrapper() });

    const messageButton = screen.getByRole('button', { name: /message/i });
    await user.click(messageButton);

    expect(screen.getByRole('dialog', { name: /send message/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument();
  });

  it('should display languages', () => {
    render(<ProfileCard profile={mockProfile} />, { wrapper: createWrapper() });

    expect(screen.getByText('Spanish')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Italian')).toBeInTheDocument();
  });

  it('should show tango experience', () => {
    render(<ProfileCard profile={mockProfile} />, { wrapper: createWrapper() });

    expect(screen.getByText('Professional')).toBeInTheDocument();
    expect(screen.getByText('15 years dancing')).toBeInTheDocument();
  });

  it('should handle profile image click', async () => {
    const user = userEvent.setup();
    
    render(<ProfileCard profile={mockProfile} />, { wrapper: createWrapper() });

    const profileImage = screen.getByAltText(/maria gonzalez/i);
    await user.click(profileImage);

    // Should open image modal
    expect(screen.getByRole('dialog', { name: /view image/i })).toBeInTheDocument();
  });

  it('should show verified badge for verified users', () => {
    const verifiedProfile = {
      ...mockProfile,
      isVerified: true
    };

    render(<ProfileCard profile={verifiedProfile} />, { wrapper: createWrapper() });

    expect(screen.getByTestId('verified-badge')).toBeInTheDocument();
    expect(screen.getByTitle('Verified account')).toBeInTheDocument();
  });

  it('should display social links', () => {
    const profileWithSocials = {
      ...mockProfile,
      socialLinks: {
        instagram: 'mariag_tango',
        facebook: 'maria.gonzalez.tango',
        youtube: 'MariaGonzalezTango'
      }
    };

    render(<ProfileCard profile={profileWithSocials} />, { wrapper: createWrapper() });

    expect(screen.getByRole('link', { name: /instagram/i })).toHaveAttribute(
      'href',
      'https://instagram.com/mariag_tango'
    );
  });

  it('should show availability for lessons', () => {
    const teacherProfile = {
      ...mockProfile,
      availableForLessons: true,
      lessonPrice: '50 USD/hour'
    };

    render(<ProfileCard profile={teacherProfile} />, { wrapper: createWrapper() });

    expect(screen.getByText(/available for lessons/i)).toBeInTheDocument();
    expect(screen.getByText('50 USD/hour')).toBeInTheDocument();
  });

  it('should handle report user', async () => {
    const user = userEvent.setup();
    
    render(<ProfileCard profile={mockProfile} />, { wrapper: createWrapper() });

    const moreButton = screen.getByRole('button', { name: /more options/i });
    await user.click(moreButton);

    const reportButton = screen.getByRole('menuitem', { name: /report/i });
    await user.click(reportButton);

    expect(screen.getByRole('dialog', { name: /report user/i })).toBeInTheDocument();
  });

  it('should handle block user', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true })
    });

    render(<ProfileCard profile={mockProfile} />, { wrapper: createWrapper() });

    const moreButton = screen.getByRole('button', { name: /more options/i });
    await user.click(moreButton);

    const blockButton = screen.getByRole('menuitem', { name: /block/i });
    await user.click(blockButton);

    // Should show confirmation
    expect(screen.getByText(/are you sure you want to block/i)).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/users/2/block', {});
    });
  });

  it('should show partner if set', () => {
    const profileWithPartner = {
      ...mockProfile,
      dancePartner: {
        id: 3,
        name: 'Carlos Rodriguez',
        username: 'carlosr'
      }
    };

    render(<ProfileCard profile={profileWithPartner} />, { wrapper: createWrapper() });

    expect(screen.getByText(/dance partner/i)).toBeInTheDocument();
    expect(screen.getByText('Carlos Rodriguez')).toBeInTheDocument();
  });

  it('should navigate to full profile', async () => {
    const user = userEvent.setup();
    
    render(<ProfileCard profile={mockProfile} isCompact />, { wrapper: createWrapper() });

    const viewFullButton = screen.getByRole('link', { name: /view full profile/i });
    await user.click(viewFullButton);

    expect(window.location.pathname).toBe('/users/mariag');
  });
});