import AsyncStorage from '@react-native-async-storage/async-storage';

// Temporary authentication service while Appwrite is being set up
export interface TempUser {
  $id: string;
  email: string;
  name: string;
  prefs: any;
  $createdAt: string;
  $updatedAt: string;
}

export class TempAuthService {
  // Send temporary OTP (simulated)
  static async sendOTP(email: string): Promise<void> {
    try {
      console.log('📧 Sending TEMPORARY OTP to:', email);
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store OTP in AsyncStorage for demo
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await AsyncStorage.setItem('temp_otp_' + email, otp);
      
      console.log('✅ TEMPORARY OTP sent to:', email);
      console.log('🔑 OTP Code:', otp); // For demo purposes
    } catch (error: any) {
      console.error('❌ Temp OTP error:', error);
      throw new Error(`Failed to send OTP: ${error.message}`);
    }
  }

  // Verify OTP and create session
  static async verifyOTP(email: string, otpCode: string): Promise<TempUser> {
    try {
      console.log('🔑 Verifying TEMPORARY OTP for:', email);
      
      // Get stored OTP
      const storedOTP = await AsyncStorage.getItem('temp_otp_' + email);
      
      if (storedOTP === otpCode) {
        // Create temporary user
        const user: TempUser = {
          $id: 'temp-user-' + Date.now(),
          email: email,
          name: email.split('@')[0],
          prefs: {
            first_name: email.split('@')[0],
            last_name: 'User',
            role: email.includes('coach') ? 'coach' : 'client',
            phone: '',
            is_verified: true,
            specializations: email.includes('coach') ? ['Fitness', 'Nutrition'] : [],
            has_nutrition_plan: false
          },
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString()
        };
        
        // Store session
        await AsyncStorage.setItem('user_session', JSON.stringify({
          userId: user.$id,
          email: user.email,
          sessionId: 'temp-session'
        }));
        
        console.log('✅ OTP verified, temporary session created');
        return user;
      } else {
        throw new Error('Invalid OTP code');
      }
    } catch (error: any) {
      console.error('❌ OTP verification failed:', error);
      throw new Error(`Invalid OTP code: ${error.message}`);
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<TempUser | null> {
    try {
      console.log('🔍 Getting current temporary user...');
      
      const session = await AsyncStorage.getItem('user_session');
      if (session) {
        const sessionData = JSON.parse(session);
        
        // Create temporary user from session
        const user: TempUser = {
          $id: sessionData.userId,
          email: sessionData.email,
          name: sessionData.email.split('@')[0],
          prefs: {
            first_name: sessionData.email.split('@')[0],
            last_name: 'User',
            role: sessionData.email.includes('coach') ? 'coach' : 'client',
            phone: '',
            is_verified: true,
            specializations: sessionData.email.includes('coach') ? ['Fitness', 'Nutrition'] : [],
            has_nutrition_plan: false
          },
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString()
        };
        
        console.log('✅ Current temporary user found:', user.email);
        return user;
      }
      
      console.log('❌ No current temporary user session');
      return null;
    } catch (error: any) {
      console.log('❌ No current user session');
      return null;
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      await AsyncStorage.removeItem('user_session');
      console.log('✅ Signed out successfully');
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      throw new Error(error.message);
    }
  }

  // Create client (coach functionality)
  static async createClient(clientData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }): Promise<TempUser> {
    try {
      console.log('👥 Creating TEMPORARY client:', clientData.email);
      
      const user: TempUser = {
        $id: 'temp-client-' + Date.now(),
        email: clientData.email,
        name: `${clientData.first_name} ${clientData.last_name}`,
        prefs: {
          first_name: clientData.first_name,
          last_name: clientData.last_name,
          role: 'client',
          phone: clientData.phone || '',
          is_verified: false,
          specializations: [],
          has_nutrition_plan: false
        },
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString()
      };

      console.log('✅ TEMPORARY client created:', user.email);
      return user;
    } catch (error: any) {
      console.error('❌ Create client error:', error);
      throw new Error(error.message);
    }
  }

  // Check if user exists
  static async checkUserExists(email: string): Promise<boolean> {
    try {
      // For temporary auth, always return false (user doesn't exist)
      return false;
    } catch (error) {
      return false;
    }
  }
} 