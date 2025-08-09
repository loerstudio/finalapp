import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import LoginScreen from '@/app/login';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseAuthService } from '@/lib/supabaseAuthService';

// Mock delle dipendenze
jest.mock('@/contexts/AuthContext');
jest.mock('@/lib/supabaseAuthService');
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Alert: {
    alert: jest.fn(),
  },
}));

// Mock del contesto di autenticazione
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('LoginScreen', () => {
  const mockSignInWithOTP = jest.fn();
  const mockSupabaseAuthService = supabaseAuthService as jest.Mocked<typeof supabaseAuthService>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      signInWithOTP: mockSignInWithOTP,
      user: null,
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
      isAuthenticated: false,
    });
  });

  it('should render login form initially', () => {
    render(<LoginScreen />);

    expect(screen.getByText('SimoPagno Coaching')).toBeTruthy();
    expect(screen.getByText('Accedi al tuo account')).toBeTruthy();
    expect(screen.getByText('Transform Your Body, Transform Your Life')).toBeTruthy();
    expect(screen.getByPlaceholderText('Inserisci la tua email')).toBeTruthy();
    expect(screen.getByText('Invia OTP')).toBeTruthy();
  });

  it('should show error when trying to send OTP without email', async () => {
    render(<LoginScreen />);

    fireEvent.press(screen.getByText('Invia OTP'));

    expect(Alert.alert).toHaveBeenCalledWith('Errore', 'Inserisci la tua email');
  });

  it('should send OTP successfully', async () => {
    mockSupabaseAuthService.loginWithOTP.mockResolvedValue({
      success: true,
    });

    render(<LoginScreen />);

    // Inserisci email
    fireEvent.changeText(screen.getByPlaceholderText('Inserisci la tua email'), 'test@test.com');
    
    // Invia OTP
    fireEvent.press(screen.getByText('Invia OTP'));

    await waitFor(() => {
      expect(mockSupabaseAuthService.loginWithOTP).toHaveBeenCalledWith('test@test.com');
    });

    await waitFor(() => {
      expect(screen.getByText('Verifica il tuo codice OTP')).toBeTruthy();
      expect(screen.getByPlaceholderText('Inserisci il codice OTP')).toBeTruthy();
      expect(screen.getByText('Verifica OTP')).toBeTruthy();
    });
  });

  it('should show error when OTP sending fails', async () => {
    mockSupabaseAuthService.loginWithOTP.mockResolvedValue({
      success: false,
      error: 'User not found',
    });

    render(<LoginScreen />);

    // Inserisci email
    fireEvent.changeText(screen.getByPlaceholderText('Inserisci la tua email'), 'test@test.com');
    
    // Invia OTP
    fireEvent.press(screen.getByText('Invia OTP'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Errore', 'User not found');
    });
  });

  it('should verify OTP successfully', async () => {
    mockSupabaseAuthService.loginWithOTP.mockResolvedValue({
      success: true,
    });

    mockSignInWithOTP.mockResolvedValue({
      error: null,
    });

    render(<LoginScreen />);

    // Inserisci email e invia OTP
    fireEvent.changeText(screen.getByPlaceholderText('Inserisci la tua email'), 'test@test.com');
    fireEvent.press(screen.getByText('Invia OTP'));

    await waitFor(() => {
      expect(screen.getByText('Verifica il tuo codice OTP')).toBeTruthy();
    });

    // Inserisci OTP e verifica
    fireEvent.changeText(screen.getByPlaceholderText('Inserisci il codice OTP'), '123456');
    fireEvent.press(screen.getByText('Verifica OTP'));

    await waitFor(() => {
      expect(mockSignInWithOTP).toHaveBeenCalledWith('test@test.com', '123456');
    });
  });

  it('should show error when OTP verification fails', async () => {
    mockSupabaseAuthService.loginWithOTP.mockResolvedValue({
      success: true,
    });

    mockSignInWithOTP.mockResolvedValue({
      error: 'Invalid OTP',
    });

    render(<LoginScreen />);

    // Inserisci email e invia OTP
    fireEvent.changeText(screen.getByPlaceholderText('Inserisci la tua email'), 'test@test.com');
    fireEvent.press(screen.getByText('Invia OTP'));

    await waitFor(() => {
      expect(screen.getByText('Verifica il tuo codice OTP')).toBeTruthy();
    });

    // Inserisci OTP e verifica
    fireEvent.changeText(screen.getByPlaceholderText('Inserisci il codice OTP'), '123456');
    fireEvent.press(screen.getByText('Verifica OTP'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Errore', 'Invalid OTP');
    });
  });

  it('should go back to email input when back button is pressed', async () => {
    mockSupabaseAuthService.loginWithOTP.mockResolvedValue({
      success: true,
    });

    render(<LoginScreen />);

    // Inserisci email e invia OTP
    fireEvent.changeText(screen.getByPlaceholderText('Inserisci la tua email'), 'test@test.com');
    fireEvent.press(screen.getByText('Invia OTP'));

    await waitFor(() => {
      expect(screen.getByText('Verifica il tuo codice OTP')).toBeTruthy();
    });

    // Torna all'input email
    fireEvent.press(screen.getByText('Torna all\'email'));

    await waitFor(() => {
      expect(screen.getByText('Accedi al tuo account')).toBeTruthy();
      expect(screen.getByPlaceholderText('Inserisci la tua email')).toBeTruthy();
    });
  });

  it('should show loading state during OTP sending', async () => {
    mockSupabaseAuthService.loginWithOTP.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    );

    render(<LoginScreen />);

    // Inserisci email
    fireEvent.changeText(screen.getByPlaceholderText('Inserisci la tua email'), 'test@test.com');
    
    // Invia OTP
    fireEvent.press(screen.getByText('Invia OTP'));

    // Verifica che il bottone sia in stato loading
    expect(screen.getByText('Invia OTP')).toBeTruthy();
  });

  it('should show loading state during OTP verification', async () => {
    mockSupabaseAuthService.loginWithOTP.mockResolvedValue({
      success: true,
    });

    mockSignInWithOTP.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    );

    render(<LoginScreen />);

    // Inserisci email e invia OTP
    fireEvent.changeText(screen.getByPlaceholderText('Inserisci la tua email'), 'test@test.com');
    fireEvent.press(screen.getByText('Invia OTP'));

    await waitFor(() => {
      expect(screen.getByText('Verifica il tuo codice OTP')).toBeTruthy();
    });

    // Inserisci OTP e verifica
    fireEvent.changeText(screen.getByPlaceholderText('Inserisci il codice OTP'), '123456');
    fireEvent.press(screen.getByText('Verifica OTP'));

    // Verifica che il bottone sia in stato loading
    expect(screen.getByText('Verifica OTP')).toBeTruthy();
  });
});
