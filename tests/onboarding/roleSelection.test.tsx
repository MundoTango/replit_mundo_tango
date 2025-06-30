import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RoleSelector from '../../client/src/components/onboarding/RoleSelector';
import '@testing-library/jest-dom';

// Mock data based on actual API response
const mockRoles = [
  { name: "dancer", description: "Social tango dancer" },
  { name: "teacher", description: "Teaches classes or privates" },
  { name: "dj", description: "Plays music at tango events" },
  { name: "organizer", description: "Organizes milongas, festivals, etc." },
  { name: "performer", description: "Stage/showcase tango performer" },
  { name: "host", description: "Offers a home to travelers" },
  { name: "guide", description: "Willing to show visitors around" },
  { name: "photographer", description: "Captures tango moments visually" },
  { name: "content_creator", description: "Creates tango media content" }
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('RoleSelector Comprehensive Validation', () => {
  const mockOnRoleChange = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('UI Rendering and Interaction', () => {
    it('renders all community roles correctly', () => {
      render(
        <RoleSelector 
          roles={mockRoles}
          selectedRoles={[]}
          onRoleChange={mockOnRoleChange}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('What do you do in tango?')).toBeInTheDocument();
      
      mockRoles.forEach(role => {
        expect(screen.getByText(role.name.replace(/_/g, ' '))).toBeInTheDocument();
        expect(screen.getByText(role.description)).toBeInTheDocument();
      });
    });

    it('shows updated host and guide role descriptions', () => {
      render(
        <RoleSelector 
          roles={mockRoles}
          selectedRoles={[]}
          onRoleChange={mockOnRoleChange}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Offers a home to travelers')).toBeInTheDocument();
      expect(screen.getByText('Willing to show visitors around')).toBeInTheDocument();
    });

    it('handles role selection correctly', async () => {
      render(
        <RoleSelector 
          roles={mockRoles}
          selectedRoles={[]}
          onRoleChange={mockOnRoleChange}
        />,
        { wrapper: createWrapper() }
      );

      const dancerCard = screen.getByText('dancer').closest('div');
      fireEvent.click(dancerCard!);

      await waitFor(() => {
        expect(mockOnRoleChange).toHaveBeenCalledWith(['dancer']);
      });
    });
  });
});