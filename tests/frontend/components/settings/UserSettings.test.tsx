import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
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
      language: 'en',
      theme: 'light'
    },
    isAuthenticated: true,
    updateProfile: jest.fn()
  })
}));

// Import component after mocking
import UserSettings from '../../../../client/src/components/settings/UserSettings';
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

const mockUserSettings = {
  profile: {
    name: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    bio: 'Tango enthusiast',
    phone: '+1234567890',
    profileImage: '/images/user.jpg',
    city: 'Buenos Aires',
    country: 'Argentina'
  },
  preferences: {
    language: 'en',
    theme: 'light',
    emailNotifications: true,
    pushNotifications: false,
    messageNotifications: true,
    eventReminders: true,
    weeklyDigest: false
  },
  privacy: {
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: 'friends',
    allowFriendRequests: true,
    showActivity: true
  },
  security: {
    twoFactorEnabled: false,
    lastPasswordChange: '2024-12-01',
    activeSessions: 2
  }
};

describe('UserSettings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render settings tabs', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, settings: mockUserSettings })
    });

    render(<UserSettings />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /profile/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /preferences/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /privacy/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /security/i })).toBeInTheDocument();
    });
  });

  it('should update profile information', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, settings: mockUserSettings })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<UserSettings />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toHaveValue('Test User');
    });

    const nameInput = screen.getByLabelText(/name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Name');

    const bioInput = screen.getByLabelText(/bio/i);
    await user.clear(bioInput);
    await user.type(bioInput, 'Updated bio');

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('PUT', '/api/user/settings/profile', {
        name: 'Updated Name',
        bio: 'Updated bio',
        username: 'testuser',
        email: 'test@example.com',
        phone: '+1234567890',
        city: 'Buenos Aires',
        country: 'Argentina'
      });
    });

    expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
  });

  it('should update notification preferences', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, settings: mockUserSettings })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<UserSettings />, { wrapper: createWrapper() });

    const preferencesTab = screen.getByRole('tab', { name: /preferences/i });
    await user.click(preferencesTab);

    const pushToggle = screen.getByRole('switch', { name: /push notifications/i });
    expect(pushToggle).not.toBeChecked();

    await user.click(pushToggle);

    const weeklyDigestToggle = screen.getByRole('switch', { name: /weekly digest/i });
    await user.click(weeklyDigestToggle);

    const saveButton = screen.getByRole('button', { name: /save preferences/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('PUT', '/api/user/settings/preferences', 
        expect.objectContaining({
          pushNotifications: true,
          weeklyDigest: true
        })
      );
    });
  });

  it('should update privacy settings', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, settings: mockUserSettings })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<UserSettings />, { wrapper: createWrapper() });

    const privacyTab = screen.getByRole('tab', { name: /privacy/i });
    await user.click(privacyTab);

    const visibilitySelect = screen.getByLabelText(/profile visibility/i);
    await user.click(visibilitySelect);
    await user.click(screen.getByRole('option', { name: /friends only/i }));

    const showEmailToggle = screen.getByRole('switch', { name: /show email/i });
    await user.click(showEmailToggle);

    const saveButton = screen.getByRole('button', { name: /save privacy settings/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('PUT', '/api/user/settings/privacy',
        expect.objectContaining({
          profileVisibility: 'friends',
          showEmail: true
        })
      );
    });
  });

  it('should change password', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, settings: mockUserSettings })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<UserSettings />, { wrapper: createWrapper() });

    const securityTab = screen.getByRole('tab', { name: /security/i });
    await user.click(securityTab);

    const changePasswordButton = screen.getByRole('button', { name: /change password/i });
    await user.click(changePasswordButton);

    expect(screen.getByRole('dialog', { name: /change password/i })).toBeInTheDocument();

    const currentPasswordInput = screen.getByLabelText(/current password/i);
    await user.type(currentPasswordInput, 'oldPassword123');

    const newPasswordInput = screen.getByLabelText(/new password/i);
    await user.type(newPasswordInput, 'newPassword123!');

    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    await user.type(confirmPasswordInput, 'newPassword123!');

    const submitButton = screen.getByRole('button', { name: /update password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/user/change-password', {
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword123!'
      });
    });
  });

  it('should enable two-factor authentication', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, settings: mockUserSettings })
      })
      .mockResolvedValueOnce({
        json: async () => ({ 
          success: true, 
          qrCode: 'data:image/png;base64,xxx',
          secret: 'ABCD1234'
        })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<UserSettings />, { wrapper: createWrapper() });

    const securityTab = screen.getByRole('tab', { name: /security/i });
    await user.click(securityTab);

    const enable2FAButton = screen.getByRole('button', { name: /enable two-factor/i });
    await user.click(enable2FAButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /two-factor authentication/i })).toBeInTheDocument();
      expect(screen.getByAltText(/qr code/i)).toBeInTheDocument();
    });

    const codeInput = screen.getByLabelText(/verification code/i);
    await user.type(codeInput, '123456');

    const verifyButton = screen.getByRole('button', { name: /verify/i });
    await user.click(verifyButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/user/2fa/verify', {
        code: '123456'
      });
    });
  });

  it('should upload profile image', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, settings: mockUserSettings })
      })
      .mockResolvedValueOnce({
        json: async () => ({ 
          success: true,
          imageUrl: '/images/new-profile.jpg'
        })
      });

    render(<UserSettings />, { wrapper: createWrapper() });

    const file = new File(['test'], 'profile.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/change profile image/i) as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/user/upload-avatar',
        expect.any(FormData)
      );
    });

    expect(screen.getByAltText(/profile/i)).toHaveAttribute('src', '/images/new-profile.jpg');
  });

  it('should handle language change', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, settings: mockUserSettings })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<UserSettings />, { wrapper: createWrapper() });

    const preferencesTab = screen.getByRole('tab', { name: /preferences/i });
    await user.click(preferencesTab);

    const languageSelect = screen.getByLabelText(/language/i);
    await user.click(languageSelect);
    await user.click(screen.getByRole('option', { name: /español/i }));

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('PUT', '/api/user/settings/preferences',
        expect.objectContaining({
          language: 'es'
        })
      );
    });

    // Should reload page for language change
    expect(window.location.reload).toHaveBeenCalled();
  });

  it('should handle theme change', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, settings: mockUserSettings })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<UserSettings />, { wrapper: createWrapper() });

    const preferencesTab = screen.getByRole('tab', { name: /preferences/i });
    await user.click(preferencesTab);

    const darkThemeButton = screen.getByRole('button', { name: /dark/i });
    await user.click(darkThemeButton);

    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark');
    });

    const saveButton = screen.getByRole('button', { name: /save preferences/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('PUT', '/api/user/settings/preferences',
        expect.objectContaining({
          theme: 'dark'
        })
      );
    });
  });

  it('should show active sessions', async () => {
    const user = userEvent.setup();
    
    const sessions = [
      {
        id: 1,
        device: 'Chrome on Windows',
        location: 'Buenos Aires, Argentina',
        lastActive: '2 minutes ago',
        current: true
      },
      {
        id: 2,
        device: 'Safari on iPhone',
        location: 'New York, USA',
        lastActive: '1 hour ago',
        current: false
      }
    ];

    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, settings: mockUserSettings })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, sessions })
      });

    render(<UserSettings />, { wrapper: createWrapper() });

    const securityTab = screen.getByRole('tab', { name: /security/i });
    await user.click(securityTab);

    await waitFor(() => {
      expect(screen.getByText('Chrome on Windows')).toBeInTheDocument();
      expect(screen.getByText('Safari on iPhone')).toBeInTheDocument();
      expect(screen.getByText('(Current session)')).toBeInTheDocument();
    });
  });

  it('should terminate session', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, settings: mockUserSettings })
      })
      .mockResolvedValueOnce({
        json: async () => ({ 
          success: true, 
          sessions: [{
            id: 2,
            device: 'Safari on iPhone',
            current: false
          }]
        })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<UserSettings />, { wrapper: createWrapper() });

    const securityTab = screen.getByRole('tab', { name: /security/i });
    await user.click(securityTab);

    await waitFor(() => {
      expect(screen.getByText('Safari on iPhone')).toBeInTheDocument();
    });

    const terminateButton = screen.getByRole('button', { name: /terminate/i });
    await user.click(terminateButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/user/sessions/2/terminate', {});
    });
  });

  it('should delete account', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, settings: mockUserSettings })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<UserSettings />, { wrapper: createWrapper() });

    const securityTab = screen.getByRole('tab', { name: /security/i });
    await user.click(securityTab);

    const deleteAccountButton = screen.getByRole('button', { name: /delete account/i });
    await user.click(deleteAccountButton);

    expect(screen.getByRole('dialog', { name: /delete account/i })).toBeInTheDocument();
    expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();

    const confirmInput = screen.getByPlaceholderText(/type DELETE/i);
    await user.type(confirmInput, 'DELETE');

    const confirmButton = screen.getByRole('button', { name: /confirm deletion/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('DELETE', '/api/user/account', {});
    });
  });
});