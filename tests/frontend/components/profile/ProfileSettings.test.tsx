import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { jest } from '@jest/globals';

// Mock dependencies
jest.mock('../../../../client/src/lib/queryClient', () => ({
  apiRequest: jest.fn(),
  queryClient: {
    invalidateQueries: jest.fn()
  }
}));

jest.mock('../../../../client/src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
      profileImage: '/images/user.jpg',
      bio: 'Tango enthusiast',
      city: 'Buenos Aires',
      country: 'Argentina'
    },
    isAuthenticated: true,
    updateProfile: jest.fn()
  })
}));

// Import component after mocking
import ProfileSettings from '../../../../client/src/components/profile/ProfileSettings';
import { apiRequest, queryClient } from '../../../../client/src/lib/queryClient';
import { useAuth } from '../../../../client/src/hooks/useAuth';

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
  name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  bio: 'Tango enthusiast from Buenos Aires',
  city: 'Buenos Aires',
  country: 'Argentina',
  phone: '+54 11 1234-5678',
  website: 'https://testuser.com',
  socialLinks: {
    instagram: 'testuser',
    facebook: 'test.user',
    youtube: 'TestUserTango'
  },
  tangoDetails: {
    roles: ['leader', 'follower'],
    level: 'intermediate',
    yearsDancing: 5,
    styles: ['salon', 'nuevo'],
    teacher: false,
    performer: false,
    availableForLessons: false
  },
  preferences: {
    publicProfile: true,
    showEmail: false,
    showPhone: false,
    receiveMessages: 'everyone',
    eventNotifications: true,
    marketingEmails: false
  }
};

describe('ProfileSettings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render profile form with current data', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, profile: mockProfile })
    });

    render(<ProfileSettings />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue(/tango enthusiast/i)).toBeInTheDocument();
    });
  });

  it('should update basic profile information', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, profile: mockProfile })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<ProfileSettings />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/display name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Name');

    const bioInput = screen.getByLabelText(/bio/i);
    await user.clear(bioInput);
    await user.type(bioInput, 'Updated bio with more details');

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('PUT', '/api/user/profile', 
        expect.objectContaining({
          name: 'Updated Name',
          bio: 'Updated bio with more details'
        })
      );
      expect(useAuth().updateProfile).toHaveBeenCalled();
    });

    expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
  });

  it('should handle profile image upload', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, profile: mockProfile })
      })
      .mockResolvedValueOnce({
        json: async () => ({ 
          success: true,
          imageUrl: '/images/new-profile.jpg'
        })
      });

    render(<ProfileSettings />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByAltText(/profile/i)).toBeInTheDocument();
    });

    const file = new File(['test'], 'profile.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/change photo/i) as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/user/upload-avatar',
        expect.any(FormData)
      );
    });

    expect(screen.getByAltText(/profile/i)).toHaveAttribute('src', '/images/new-profile.jpg');
  });

  it('should update tango details', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, profile: mockProfile })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<ProfileSettings />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /tango details/i })).toBeInTheDocument();
    });

    const tangoTab = screen.getByRole('tab', { name: /tango details/i });
    await user.click(tangoTab);

    // Toggle teacher status
    const teacherToggle = screen.getByRole('switch', { name: /i teach tango/i });
    await user.click(teacherToggle);

    // Update level
    const levelSelect = screen.getByLabelText(/experience level/i);
    await user.click(levelSelect);
    await user.click(screen.getByRole('option', { name: /advanced/i }));

    // Add style
    const addStyleButton = screen.getByRole('button', { name: /add style/i });
    await user.click(addStyleButton);
    
    const styleInput = screen.getByPlaceholderText(/enter style/i);
    await user.type(styleInput, 'Milonguero{Enter}');

    const saveButton = screen.getByRole('button', { name: /save tango details/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('PUT', '/api/user/profile',
        expect.objectContaining({
          tangoDetails: expect.objectContaining({
            teacher: true,
            level: 'advanced',
            styles: ['salon', 'nuevo', 'milonguero']
          })
        })
      );
    });
  });

  it('should update social links', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, profile: mockProfile })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<ProfileSettings />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /social links/i })).toBeInTheDocument();
    });

    const socialTab = screen.getByRole('tab', { name: /social links/i });
    await user.click(socialTab);

    const instagramInput = screen.getByLabelText(/instagram/i);
    await user.clear(instagramInput);
    await user.type(instagramInput, 'new_instagram');

    const saveButton = screen.getByRole('button', { name: /save social links/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('PUT', '/api/user/profile',
        expect.objectContaining({
          socialLinks: expect.objectContaining({
            instagram: 'new_instagram'
          })
        })
      );
    });
  });

  it('should update privacy settings', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, profile: mockProfile })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<ProfileSettings />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /privacy/i })).toBeInTheDocument();
    });

    const privacyTab = screen.getByRole('tab', { name: /privacy/i });
    await user.click(privacyTab);

    // Toggle email visibility
    const showEmailToggle = screen.getByRole('switch', { name: /show email on profile/i });
    await user.click(showEmailToggle);

    // Change message settings
    const messageSelect = screen.getByLabelText(/who can message you/i);
    await user.click(messageSelect);
    await user.click(screen.getByRole('option', { name: /friends only/i }));

    const saveButton = screen.getByRole('button', { name: /save privacy settings/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('PUT', '/api/user/profile',
        expect.objectContaining({
          preferences: expect.objectContaining({
            showEmail: true,
            receiveMessages: 'friends'
          })
        })
      );
    });
  });

  it('should validate username availability', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, profile: mockProfile })
      })
      .mockResolvedValueOnce({
        json: async () => ({ available: false })
      });

    render(<ProfileSettings />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    });

    const usernameInput = screen.getByLabelText(/username/i);
    await user.clear(usernameInput);
    await user.type(usernameInput, 'taken-username');

    // Advance timers for debounce
    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        expect.stringMatching(/username=taken-username/)
      );
      expect(screen.getByText(/username is already taken/i)).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('should handle location update', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, profile: mockProfile })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<ProfileSettings />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    });

    const cityInput = screen.getByLabelText(/city/i);
    await user.clear(cityInput);
    await user.type(cityInput, 'New York');

    const countrySelect = screen.getByLabelText(/country/i);
    await user.click(countrySelect);
    await user.click(screen.getByRole('option', { name: /united states/i }));

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('PUT', '/api/user/profile',
        expect.objectContaining({
          city: 'New York',
          country: 'United States'
        })
      );
    });
  });

  it('should show character count for bio', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, profile: mockProfile })
    });

    render(<ProfileSettings />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByLabelText(/bio/i)).toBeInTheDocument();
    });

    const bioInput = screen.getByLabelText(/bio/i);
    await user.clear(bioInput);
    await user.type(bioInput, 'A'.repeat(150));

    expect(screen.getByText('150/500')).toBeInTheDocument();
  });

  it('should handle form validation', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, profile: mockProfile })
    });

    render(<ProfileSettings />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/display name/i);
    await user.clear(nameInput);

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(apiRequest).not.toHaveBeenCalledWith('PUT', '/api/user/profile', expect.any(Object));
  });

  it('should cancel changes', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, profile: mockProfile })
    });

    render(<ProfileSettings />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/display name/i);
    const originalValue = nameInput.getAttribute('value');
    
    await user.clear(nameInput);
    await user.type(nameInput, 'Changed Name');

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(nameInput).toHaveValue(originalValue);
  });

  it('should show loading state during save', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, profile: mockProfile })
      })
      .mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

    render(<ProfileSettings />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/display name/i);
    await user.type(nameInput, ' Updated');

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
  });
});