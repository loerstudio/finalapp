import { supabaseAuthService } from '@/lib/supabaseAuthService';
import { supabase } from '@/lib/supabase';

// Mock di Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signInWithOtp: jest.fn(),
      verifyOtp: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      getSession: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
}));

describe('SupabaseAuthService', () => {
  const mockSupabase = supabase as jest.Mocked<typeof supabase>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register user successfully', async () => {
      const mockUser = {
        id: '123',
        email: 'test@test.com',
        user_metadata: { name: 'Test User', role: 'client' },
      };

      const mockProfile = {
        id: '123',
        email: 'test@test.com',
        name: 'Test User',
        role: 'client',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          })),
        })),
      } as any);

      const result = await supabaseAuthService.registerUser(
        'Test User',
        'test@test.com',
        'password123',
        'client'
      );

      expect(result.success).toBe(true);
      expect(result.user).toEqual({
        id: '123',
        email: 'test@test.com',
        name: 'Test User',
        role: 'client',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });
    });

    it('should handle registration error', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'Email already exists' },
      });

      const result = await supabaseAuthService.registerUser(
        'Test User',
        'test@test.com',
        'password123',
        'client'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already exists');
    });
  });

  describe('loginWithPassword', () => {
    it('should login user successfully', async () => {
      const mockUser = {
        id: '123',
        email: 'test@test.com',
      };

      const mockProfile = {
        id: '123',
        email: 'test@test.com',
        name: 'Test User',
        role: 'client',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          })),
        })),
      } as any);

      const result = await supabaseAuthService.loginWithPassword(
        'test@test.com',
        'password123'
      );

      expect(result.success).toBe(true);
      expect(result.user).toEqual({
        id: '123',
        email: 'test@test.com',
        name: 'Test User',
        role: 'client',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });
    });

    it('should handle login error', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid credentials' },
      });

      const result = await supabaseAuthService.loginWithPassword(
        'test@test.com',
        'wrongpassword'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });
  });

  describe('loginWithOTP', () => {
    it('should send OTP successfully for existing user', async () => {
      const mockProfile = {
        id: '123',
        email: 'test@test.com',
        role: 'client',
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          })),
        })),
      } as any);

      mockSupabase.auth.signInWithOtp.mockResolvedValue({
        data: {},
        error: null,
      });

      const result = await supabaseAuthService.loginWithOTP('test@test.com');

      expect(result.success).toBe(true);
      expect(mockSupabase.auth.signInWithOtp).toHaveBeenCalledWith('test@test.com', {
        emailRedirectTo: 'simopagnocoaching://login',
        shouldCreateUser: false,
      });
    });

    it('should handle OTP sending for non-existent user', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'No rows returned' },
            }),
          })),
        })),
      } as any);

      const result = await supabaseAuthService.loginWithOTP('nonexistent@test.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Utente non registrato. Contatta il tuo coach per l\'accesso.');
    });
  });

  describe('verifyOTP', () => {
    it('should verify OTP successfully', async () => {
      const mockUser = {
        id: '123',
        email: 'test@test.com',
      };

      const mockProfile = {
        id: '123',
        email: 'test@test.com',
        name: 'Test User',
        role: 'client',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      mockSupabase.auth.verifyOtp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          })),
        })),
      } as any);

      const result = await supabaseAuthService.verifyOTP('test@test.com', '123456');

      expect(result.success).toBe(true);
      expect(result.user).toEqual({
        id: '123',
        email: 'test@test.com',
        name: 'Test User',
        role: 'client',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });
    });

    it('should handle OTP verification error', async () => {
      mockSupabase.auth.verifyOtp.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid OTP' },
      });

      const result = await supabaseAuthService.verifyOTP('test@test.com', 'wrongotp');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid OTP');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null,
      });

      const result = await supabaseAuthService.logout();

      expect(result.success).toBe(true);
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });

    it('should handle logout error', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: 'Logout failed' },
      });

      const result = await supabaseAuthService.logout();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Logout failed');
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      const mockUser = {
        id: '123',
        email: 'test@test.com',
      };

      const mockProfile = {
        id: '123',
        email: 'test@test.com',
        name: 'Test User',
        role: 'client',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          })),
        })),
      } as any);

      const result = await supabaseAuthService.getCurrentUser();

      expect(result.user).toEqual({
        id: '123',
        email: 'test@test.com',
        name: 'Test User',
        role: 'client',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });
    });

    it('should handle missing session gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth session missing' },
      });

      const result = await supabaseAuthService.getCurrentUser();

      expect(result.error).toBe('Auth session missing');
    });
  });

  describe('getCurrentSession', () => {
    it('should get current session successfully', async () => {
      const mockSession = {
        access_token: 'token123',
        refresh_token: 'refresh123',
        expires_at: 1234567890,
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await supabaseAuthService.getCurrentSession();

      expect(result.session).toEqual(mockSession);
    });

    it('should handle session error', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Session error' },
      });

      const result = await supabaseAuthService.getCurrentSession();

      expect(result.error).toBe('Session error');
    });
  });
});
