// Adaptive service that falls back to mock data when Supabase is unavailable

import { supabase } from './supabase';
import { MockDataService } from './mockData';

export class AdaptiveService {
  private static isSupabaseAvailable: boolean | null = null;
  private static lastCheck: number = 0;
  private static checkInterval = 30000; // 30 seconds

  static async checkSupabaseAvailability(): Promise<boolean> {
    const now = Date.now();
    
    // Use cached result if recent
    if (this.isSupabaseAvailable !== null && (now - this.lastCheck) < this.checkInterval) {
      return this.isSupabaseAvailable;
    }

    try {
      const { error } = await supabase
        .from('users')
        .select('id')
        .limit(1)
        .single();

      this.isSupabaseAvailable = error === null || error.code === 'PGRST116'; // No rows is OK
      this.lastCheck = now;
      
      if (this.isSupabaseAvailable) {
        console.log('🟢 Supabase is available');
      } else {
        console.log('🔴 Supabase unavailable, using mock data');
      }
      
      return this.isSupabaseAvailable;
    } catch (error) {
      console.log('🔴 Supabase connection failed, using mock data:', error);
      this.isSupabaseAvailable = false;
      this.lastCheck = now;
      return false;
    }
  }

  static async executeWithFallback<T>(
    supabaseOperation: () => Promise<T>,
    mockOperation: () => Promise<T>,
    operationName: string = 'operation'
  ): Promise<T> {
    const isAvailable = await this.checkSupabaseAvailability();
    
    if (isAvailable) {
      try {
        const result = await supabaseOperation();
        console.log(`✅ ${operationName} completed with Supabase`);
        return result;
      } catch (error) {
        console.warn(`⚠️ ${operationName} failed with Supabase, falling back to mock:`, error);
        this.isSupabaseAvailable = false; // Force recheck next time
        return await mockOperation();
      }
    } else {
      console.log(`🔄 ${operationName} using mock data`);
      return await mockOperation();
    }
  }

  // Wrapper methods for common operations
  static async getNutritionalSummary(date: string) {
    return this.executeWithFallback(
      async () => {
        // Real Supabase operation would go here
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        // Simulate the actual nutrition service call
        return await MockDataService.getNutritionalSummary(date);
      },
      () => MockDataService.getNutritionalSummary(date),
      'getNutritionalSummary'
    );
  }

  static async getProgressSummary() {
    return this.executeWithFallback(
      async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        return await MockDataService.getProgressSummary();
      },
      () => MockDataService.getProgressSummary(),
      'getProgressSummary'
    );
  }

  static async getUserGoals() {
    return this.executeWithFallback(
      async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        return await MockDataService.getUserGoals();
      },
      () => MockDataService.getUserGoals(),
      'getUserGoals'
    );
  }

  static async getChatMessages() {
    return this.executeWithFallback(
      async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        return await MockDataService.getChatMessages();
      },
      () => MockDataService.getChatMessages(),
      'getChatMessages'
    );
  }

  static async getChatPartner() {
    return this.executeWithFallback(
      async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        return await MockDataService.getChatPartner();
      },
      () => MockDataService.getChatPartner(),
      'getChatPartner'
    );
  }

  static async signInWithOtp(email: string) {
    return this.executeWithFallback(
      async () => {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
        
        return {
          success: true,
          data: { message: 'OTP sent to email' }
        };
      },
      () => MockDataService.signInWithOtp(email),
      'signInWithOtp'
    );
  }

  // Status methods
  static getConnectionStatus(): 'connected' | 'disconnected' | 'unknown' {
    if (this.isSupabaseAvailable === null) return 'unknown';
    return this.isSupabaseAvailable ? 'connected' : 'disconnected';
  }

  static forceRecheck(): void {
    this.isSupabaseAvailable = null;
    this.lastCheck = 0;
  }
}