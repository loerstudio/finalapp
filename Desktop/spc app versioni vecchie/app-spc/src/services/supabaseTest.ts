import { supabase, supabaseUrl, supabaseAnonKey } from './supabase';

export class SupabaseTestService {
  static async testConnection(): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      console.log('🔗 Testing Supabase connection...');
      console.log('URL:', supabaseUrl);
      console.log('Key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...');

      // Test 1: Basic connection
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (error) {
        console.error('❌ Supabase connection error:', error);
        return {
          success: false,
          error: `Database error: ${error.message}`
        };
      }

      console.log('✅ Supabase connection successful');
      return {
        success: true,
        data: { message: 'Connection successful', recordCount: data?.length || 0 }
      };

    } catch (error: any) {
      console.error('❌ Supabase test failed:', error);
      return {
        success: false,
        error: error.message || 'Unknown connection error'
      };
    }
  }

  static async testAuth(): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      console.log('🔐 Testing Supabase auth...');

      // Test auth connection
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('❌ Auth error:', error);
        return {
          success: false,
          error: `Auth error: ${error.message}`
        };
      }

      console.log('✅ Auth test successful');
      return {
        success: true,
        data: { 
          hasSession: !!session,
          sessionUser: session?.user?.email || 'No user'
        }
      };

    } catch (error: any) {
      console.error('❌ Auth test failed:', error);
      return {
        success: false,
        error: error.message || 'Unknown auth error'
      };
    }
  }

  static async createTestProfile(): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      console.log('👤 Testing profile creation...');

      // Try to insert a test profile
      const testProfile = {
        id: 'test-uuid-' + Date.now(),
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'client'
      };

      const { data, error } = await supabase
        .from('users')
        .insert(testProfile)
        .select()
        .single();

      if (error) {
        console.error('❌ Profile creation error:', error);
        return {
          success: false,
          error: `Profile creation error: ${error.message}`
        };
      }

      // Clean up test profile
      await supabase
        .from('users')
        .delete()
        .eq('id', testProfile.id);

      console.log('✅ Profile creation test successful');
      return {
        success: true,
        data: { message: 'Profile creation/deletion successful' }
      };

    } catch (error: any) {
      console.error('❌ Profile test failed:', error);
      return {
        success: false,
        error: error.message || 'Unknown profile error'
      };
    }
  }

  static async runAllTests(): Promise<{ 
    connection: any; 
    auth: any; 
    users: any; 
    summary: { passed: number; failed: number; total: number } 
  }> {
    console.log('🧪 Running Supabase tests...');

    const connectionTest = await this.testConnection();
    const authTest = await this.testAuth();
    const profileTest = await this.createTestProfile();

    const passed = [connectionTest, authTest, profileTest].filter(test => test.success).length;
    const total = 3;
    const failed = total - passed;

    console.log(`📊 Test Results: ${passed}/${total} passed, ${failed} failed`);

    return {
      connection: connectionTest,
      auth: authTest,
      users: profileTest,
      summary: { passed, failed, total }
    };
  }
}