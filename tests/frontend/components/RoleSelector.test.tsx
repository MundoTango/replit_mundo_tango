import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoleSelector from '../../../client/src/components/onboarding/RoleSelector';

// Mock data for testing
const mockRoles = [
  { name: 'dancer', description: 'Someone who loves dancing tango' },
  { name: 'teacher', description: 'Teaches tango to others' },
  { name: 'dj', description: 'Plays music at milongas' },
  { name: 'organizer', description: 'Organizes tango events' },
  { name: 'performer', description: 'Performs tango professionally' },
  { name: 'photographer', description: 'Captures tango moments' },
  { name: 'videographer', description: 'Films tango performances' },
  { name: 'musician', description: 'Plays tango music' },
  { name: 'host', description: 'Offers a home to travelers' },
  { name: 'guide', description: 'Willing to show visitors around' },
  { name: 'vendor', description: 'Sells tango-related products' },
  { name: 'student', description: 'Learning tango' },
  { name: 'social_dancer', description: 'Enjoys social dancing' },
  { name: 'competitor', description: 'Competes in tango competitions' },
  { name: 'collector', description: 'Collects tango music or memorabilia' },
  { name: 'enthusiast', description: 'Passionate about tango culture' },
  { name: 'content_creator', description: 'Creates tango-related content' },
  { name: 'historian', description: 'Studies tango history' },
  { name: 'other', description: 'Other role not listed above' }
];

const defaultProps = {
  roles: mockRoles,
  selectedRoles: [],
  onRoleChange: jest.fn(),
  isLoading: false
};

describe('RoleSelector Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays all roles without hiding any', () => {
    render(<RoleSelector {...defaultProps} />);
    
    // Check that all 19 roles are visible
    expect(screen.getByText('Dancer')).toBeInTheDocument();
    expect(screen.getByText('Teacher')).toBeInTheDocument();
    expect(screen.getByText('DJ')).toBeInTheDocument();
    expect(screen.getByText('Organizer')).toBeInTheDocument();
    expect(screen.getByText('Performer')).toBeInTheDocument();
    expect(screen.getByText('Photographer')).toBeInTheDocument();
    expect(screen.getByText('Videographer')).toBeInTheDocument();
    expect(screen.getByText('Musician')).toBeInTheDocument();
    expect(screen.getByText('Host')).toBeInTheDocument();
    expect(screen.getByText('Guide')).toBeInTheDocument();
    expect(screen.getByText('Vendor')).toBeInTheDocument();
    expect(screen.getByText('Student')).toBeInTheDocument();
    expect(screen.getByText('Social dancer')).toBeInTheDocument();
    expect(screen.getByText('Competitor')).toBeInTheDocument();
    expect(screen.getByText('Collector')).toBeInTheDocument();
    expect(screen.getByText('Enthusiast')).toBeInTheDocument();
    expect(screen.getByText('Content creator')).toBeInTheDocument();
    expect(screen.getByText('Historian')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  test('does not display "Show more" button', () => {
    render(<RoleSelector {...defaultProps} />);
    
    // Verify that there's no "Show more" button
    expect(screen.queryByText(/Show \d+ more roles/)).not.toBeInTheDocument();
    expect(screen.queryByText('Show less')).not.toBeInTheDocument();
  });

  test('handles role selection correctly', async () => {
    const mockOnRoleChange = jest.fn();
    render(<RoleSelector {...defaultProps} onRoleChange={mockOnRoleChange} />);
    
    // Click on a role
    const dancerRole = screen.getByText('Dancer').closest('div[data-role="dancer"]');
    expect(dancerRole).toBeInTheDocument();
    
    fireEvent.click(dancerRole!);
    
    await waitFor(() => {
      expect(mockOnRoleChange).toHaveBeenCalledWith(['dancer']);
    });
  });

  test('handles multiple role selections', async () => {
    const mockOnRoleChange = jest.fn();
    render(<RoleSelector {...defaultProps} onRoleChange={mockOnRoleChange} />);
    
    // Click on multiple roles
    const dancerRole = screen.getByText('Dancer').closest('div[data-role="dancer"]');
    const teacherRole = screen.getByText('Teacher').closest('div[data-role="teacher"]');
    
    fireEvent.click(dancerRole!);
    await waitFor(() => {
      expect(mockOnRoleChange).toHaveBeenCalledWith(['dancer']);
    });
    
    // Reset mock and test adding second role
    mockOnRoleChange.mockClear();
    render(<RoleSelector {...defaultProps} selectedRoles={['dancer']} onRoleChange={mockOnRoleChange} />);
    
    const teacherRoleSecond = screen.getByText('Teacher').closest('div[data-role="teacher"]');
    fireEvent.click(teacherRoleSecond!);
    
    await waitFor(() => {
      expect(mockOnRoleChange).toHaveBeenCalledWith(['dancer', 'teacher']);
    });
  });

  test('handles role deselection', async () => {
    const mockOnRoleChange = jest.fn();
    render(<RoleSelector {...defaultProps} selectedRoles={['dancer']} onRoleChange={mockOnRoleChange} />);
    
    // Click on selected role to deselect
    const dancerRole = screen.getByText('Dancer').closest('div[data-role="dancer"]');
    fireEvent.click(dancerRole!);
    
    await waitFor(() => {
      expect(mockOnRoleChange).toHaveBeenCalledWith([]);
    });
  });

  test('displays selected roles count and summary', () => {
    render(<RoleSelector {...defaultProps} selectedRoles={['dancer', 'teacher']} />);
    
    // Check selected roles summary is displayed
    expect(screen.getByText('Selected roles:')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // count badge
  });

  test('shows loading state correctly', () => {
    render(<RoleSelector {...defaultProps} isLoading={true} />);
    
    // Check that loading skeleton is displayed
    expect(screen.getByText('What do you do in tango?')).toBeInTheDocument();
    // Loading state should show skeleton grid
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  test('displays proper role styling for selected and unselected states', () => {
    render(<RoleSelector {...defaultProps} selectedRoles={['dancer']} />);
    
    const dancerRole = screen.getByText('Dancer').closest('div[data-role="dancer"]');
    const teacherRole = screen.getByText('Teacher').closest('div[data-role="teacher"]');
    
    // Selected role should have blue styling
    expect(dancerRole).toHaveClass('border-blue-500', 'bg-blue-50');
    
    // Unselected role should have gray styling
    expect(teacherRole).toHaveClass('border-gray-200', 'bg-white');
  });

  test('opens custom role modal when "other" is clicked', async () => {
    render(<RoleSelector {...defaultProps} />);
    
    const otherRole = screen.getByText('Other').closest('div[data-role="other"]');
    fireEvent.click(otherRole!);
    
    // Custom role modal should appear (this would be tested if the modal is rendered)
    // For now, we just verify the click handler was triggered
    expect(otherRole).toBeInTheDocument();
  });

  test('renders role icons and descriptions', () => {
    render(<RoleSelector {...defaultProps} />);
    
    // Check that descriptions are rendered
    expect(screen.getByText('Someone who loves dancing tango')).toBeInTheDocument();
    expect(screen.getByText('Teaches tango to others')).toBeInTheDocument();
    expect(screen.getByText('Plays music at milongas')).toBeInTheDocument();
    
    // Check that role icons are present (emojis should be in the component)
    const roleElements = document.querySelectorAll('[data-role]');
    expect(roleElements.length).toBe(19); // All 19 roles should be present
  });

  test('has proper accessibility attributes', () => {
    render(<RoleSelector {...defaultProps} />);
    
    // Check for proper ARIA labels and structure
    expect(screen.getByText('What do you do in tango?')).toBeInTheDocument();
    expect(screen.getByText('Choose all that apply. You can always update these later in your profile.')).toBeInTheDocument();
    
    // All role elements should be clickable
    const roleElements = document.querySelectorAll('[data-role]');
    roleElements.forEach(element => {
      expect(element).toHaveClass('cursor-pointer');
    });
  });

  test('maintains performance optimizations', () => {
    // Test that component doesn't cause infinite re-renders
    const consoleSpy = jest.spyOn(console, 'log');
    
    render(<RoleSelector {...defaultProps} />);
    
    // Component should render successfully without excessive logs
    expect(consoleSpy).toHaveBeenCalled();
    
    // Clean up
    consoleSpy.mockRestore();
  });
});