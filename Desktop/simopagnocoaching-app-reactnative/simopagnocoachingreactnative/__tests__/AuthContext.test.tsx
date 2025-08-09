import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { supabaseAuthService } from '@/lib/supabaseAuthService';

// Mock del servizio Supabase
jest.mock('@/lib/supabaseAuthService');
jest.mock('@/lib/localStorage');

// Componente di test per accedere al contesto
const TestComponent = () => {
  const { user, loading, signIn, signInWithOTP, signOut, isAuthenticated } = useAuth();
  
  return (
    <div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
      <button data-testid="signin-btn" onPress={() => signIn('test@test.com', 'password')}>
        Sign In
      </button>
      <button data-testid="otp-btn" onPress={() => signInWithOTP('test@test.com', '123456')}>
        Sign In OTP
      </button>
      <button data-testid="signout-btn" onPress={() => signOut()}>
        Sign Out
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide initial state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });

  it('should handle sign in with password successfully', async () => {
    const mockUser = {
      id: '123',
      email: 'test@test.com',
      name: 'Test User',
      role: 'client' as const,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    (supabaseAuthService.loginWithPassword as jest.Mock).mockResolvedValue({
      success: true,
      user: mockUser,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.press(screen.getByTestId('signin-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@test.com');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });
  });

  it('should handle sign in with OTP successfully', async () => {
    const mockUser = {
      id: '123',
      email: 'test@test.com',
      name: 'Test User',
      role: 'client' as const,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    (supabaseAuthService.verifyOTP as jest.Mock).mockResolvedValue({
      success: true,
      user: mockUser,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.press(screen.getByTestId('otp-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@test.com');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });
  });

  it('should handle sign out successfully', async () => {
    const mockUser = {
      id: '123',
      email: 'test@test.com',
      name: 'Test User',
      role: 'client' as const,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    (supabaseAuthService.loginWithPassword as jest.Mock).mockResolvedValue({
      success: true,
      user: mockUser,
    });

    (supabaseAuthService.logout as jest.Mock).mockResolvedValue({
      success: true,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Prima fai login
    fireEvent.press(screen.getByTestId('signin-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    // Poi fai logout
    fireEvent.press(screen.getByTestId('signout-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
  });

  it('should handle authentication errors gracefully', async () => {
    (supabaseAuthService.loginWithPassword as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Invalid credentials',
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.press(screen.getByTestId('signin-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
  });
});
