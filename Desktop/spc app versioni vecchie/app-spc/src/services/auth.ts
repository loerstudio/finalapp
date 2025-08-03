import { RealAuthService, RealUser } from './realAuth';
import { User, CreateClientRequest, ApiResponse } from '../types';

export class AuthService {
  // Map Real user to our User type
  private static mapUser(realUser: RealUser): User {
    return {
      id: realUser.$id,
      email: realUser.email,
      first_name: realUser.prefs?.first_name || 'User',
      last_name: realUser.prefs?.last_name || '',
      role: realUser.prefs?.role || 'client',
      avatar_url: realUser.prefs?.avatar_url,
      phone: realUser.prefs?.phone,
      is_verified: realUser.prefs?.is_verified || false,
      specializations: realUser.prefs?.specializations || [],
      created_at: realUser.$createdAt,
      updated_at: realUser.$updatedAt,
      has_nutrition_plan: false // Default value for Real users
    };
  }

  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<User | null> {
    try {
      console.log('🔍 signIn: Attempting sign in for:', email);
      
      const realUser = await RealAuthService.verifyOTP(email, password);
      
      if (realUser) {
        console.log('✅ signIn: Authentication successful');
        return this.mapUser(realUser);
      }
      
      return null;
    } catch (error: any) {
      console.error('❌ signIn error:', error);
      throw error;
    }
  }

  // Send OTP for authentication
  static async sendOTP(email: string): Promise<void> {
    try {
      console.log('📧 Sending OTP to:', email);
      
      await RealAuthService.sendOTP(email);
      console.log('✅ OTP sent successfully to:', email);
    } catch (error: any) {
      console.error('❌ sendOTP error:', error);
      throw error;
    }
  }

  // Verify OTP and sign in
  static async verifyOTP(email: string, token: string): Promise<User | null> {
    try {
      console.log('🔑 Verifying OTP for:', email);
      
      // For Appwrite, we need to extract userId from the token
      // This is a simplified approach - in production you'd handle the magic URL properly
      const realUser = await RealAuthService.verifyOTP(email, token);
      
      if (realUser) {
        console.log('✅ OTP verified successfully');
        return this.mapUser(realUser);
      }
      
      return null;
    } catch (error: any) {
      console.error('❌ verifyOTP error:', error);
      throw error;
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    try {
      console.log('🔍 getCurrentUser: Checking session...');
      
      const realUser = await RealAuthService.getCurrentUser();
      
      if (realUser) {
        console.log('✅ getCurrentUser: User found');
        return this.mapUser(realUser);
      }
      
      console.log('❌ getCurrentUser: No user found');
      return null;
    } catch (error: any) {
      console.log('❌ getCurrentUser error:', error);
      return null;
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      await RealAuthService.signOut();
      console.log('✅ Sign out successful');
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
    }
  }

  // Create new client (coach only functionality)
  static async createClient(clientData: CreateClientRequest): Promise<ApiResponse<User>> {
    try {
      console.log('👥 Creating new client:', clientData.email);
      
      // Get current user to verify they are a coach
      const currentUser = await this.getCurrentUser();
      if (!currentUser || currentUser.role !== 'coach') {
        throw new Error('Only coaches can create clients');
      }
      
      const realUser = await RealAuthService.createClient({
        email: clientData.email,
        password: clientData.password,
        first_name: clientData.first_name,
        last_name: clientData.last_name,
        phone: clientData.phone
      });
      
      const user = this.mapUser(realUser);
      
      console.log('✅ Client created successfully');
      return {
        success: true,
        data: user,
        message: 'Client created successfully'
      };
    } catch (error: any) {
      console.error('❌ createClient error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to create client'
      };
    }
  }

  // Check if user exists
  static async checkUserExists(email: string): Promise<boolean> {
    try {
      return await RealAuthService.checkUserExists(email);
    } catch (error) {
      return false;
    }
  }

  // Auth state change listener
  static onAuthStateChange(callback: (user: User | null) => void) {
    // Appwrite doesn't have built-in auth state change listener like Supabase
    // We'll implement this using polling or manual triggers
    let currentUser: User | null = null;
    
    const checkAuthState = async () => {
      try {
        const user = await this.getCurrentUser();
        if (user?.id !== currentUser?.id) {
          currentUser = user;
          callback(user);
        }
      } catch (error) {
        if (currentUser !== null) {
          currentUser = null;
          callback(null);
        }
      }
    };
    
    // Check immediately
    checkAuthState();
    
    // Check every 5 seconds
    const interval = setInterval(checkAuthState, 5000);
    
    // Return cleanup function
    return () => {
      clearInterval(interval);
    };
  }
}