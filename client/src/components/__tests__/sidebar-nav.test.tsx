import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SidebarNav from '../sidebar-nav';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';

// Mock the modules
jest.mock('@/hooks/use-auth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('wouter', () => ({
  useLocation: jest.fn(),
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

jest.mock('@/hooks/use-translations', () => ({
  useTranslations: () => ({
    t: (key: string) => key,
  }),
}));

describe('SidebarNav', () => {
  const mockLogoutMutation = {
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      logoutMutation: mockLogoutMutation,
    });
    (useLocation as jest.Mock).mockReturnValue(['/']);
  });

  it('renders navigation items correctly', () => {
    render(<SidebarNav />);

    expect(screen.getByText('nav.dashboard')).toBeInTheDocument();
    expect(screen.getByText('nav.newContent')).toBeInTheDocument();
    expect(screen.getByText('nav.settings')).toBeInTheDocument();
    expect(screen.getByText('nav.logout')).toBeInTheDocument();
  });

  it('handles logout click', () => {
    render(<SidebarNav />);

    const logoutButton = screen.getByText('nav.logout');
    fireEvent.click(logoutButton);

    expect(mockLogoutMutation.mutate).toHaveBeenCalled();
  });

  it('toggles mobile menu', () => {
    render(<SidebarNav />);

    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('highlights active route', () => {
    (useLocation as jest.Mock).mockReturnValue(['/settings']);
    render(<SidebarNav />);

    const settingsLink = screen.getByText('nav.settings').closest('a');
    expect(settingsLink).toHaveClass('bg-accent');
  });

  it('closes mobile menu on navigation', () => {
    render(<SidebarNav />);

    // Open mobile menu
    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);

    // Click a navigation item
    const dashboardLink = screen.getByText('nav.dashboard');
    fireEvent.click(dashboardLink);

    // Dialog should be closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});