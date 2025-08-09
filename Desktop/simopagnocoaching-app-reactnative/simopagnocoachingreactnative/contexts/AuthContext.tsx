import React, { createContext, useContext, useEffect, useState } from 'react';
import { localStorageService, LocalUser } from '@/lib/localStorage';
import { supabaseAuthService, SupabaseUser } from '@/lib/supabaseAuthService';
import { User } from '@/types';

interface AuthContextType {
  user: LocalUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithOTP: (email: string, otp: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve essere usato all\'interno di un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Controlla la sessione all'avvio dell'app
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      console.log('🔍 Controllo sessione Supabase...');
      
      // Controlla la sessione Supabase
      const { user: supabaseUser, error } = await supabaseAuthService.getCurrentUser();
      
      if (error) {
        // Non loggare errori di sessione mancante come errori critici
        if (error.includes('Auth session missing') || error.includes('session missing')) {
          console.log('ℹ️ Nessuna sessione attiva - utente non autenticato');
        } else {
          console.error('❌ Errore nel controllo sessione Supabase:', error);
        }
        setUser(null);
      } else if (supabaseUser) {
        // Converti SupabaseUser in LocalUser
        const localUser: LocalUser = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          role: supabaseUser.role,
          name: supabaseUser.name,
          created_at: supabaseUser.created_at,
          updated_at: supabaseUser.updated_at,
        };
        
        // Salva nel localStorage per compatibilità
        await localStorageService.saveUser(localUser);
        setUser(localUser);
        console.log('✅ Sessione Supabase ripristinata:', localUser);
      } else {
        console.log('ℹ️ Nessuna sessione attiva');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Errore nel controllo della sessione:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Login con password usando Supabase
      const result = await supabaseAuthService.loginWithPassword(email, password);
      
      if (result.success && result.user) {
        const localUser: LocalUser = {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          name: result.user.name,
          created_at: result.user.created_at,
          updated_at: result.user.updated_at,
        };
        
        console.log('🔐 Login Supabase riuscito:', localUser);
        
        // Salva l'utente nel localStorage
        await localStorageService.saveUser(localUser);
        setUser(localUser);
        
        return { error: null };
      } else {
        console.log('❌ Login Supabase fallito:', result.error);
        return { error: result.error };
      }
      
    } catch (error) {
      console.error('Errore durante il login:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithOTP = async (email: string, otp: string) => {
    try {
      setLoading(true);
      
      console.log('🔐 Tentativo login OTP Supabase per:', email);
      
      // Login con OTP usando Supabase
      const result = await supabaseAuthService.verifyOTP(email, otp);
      
      if (result.success && result.user) {
        const localUser: LocalUser = {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          name: result.user.name,
          created_at: result.user.created_at,
          updated_at: result.user.updated_at,
        };
        
        console.log('✅ Login OTP Supabase riuscito:', localUser);
        
        // Salva l'utente nel localStorage
        await localStorageService.saveUser(localUser);
        setUser(localUser);
        
        return { error: null };
      } else {
        console.log('❌ Login OTP Supabase fallito:', result.error);
        return { error: result.error };
      }
      
    } catch (error) {
      console.error('Errore durante il login con OTP:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Logout da Supabase
      const result = await supabaseAuthService.logout();
      
      if (result.success) {
        // Rimuovi l'utente dal localStorage
        await localStorageService.clearUser();
        setUser(null);
        console.log('✅ Logout Supabase riuscito');
        return { error: null };
      } else {
        console.log('❌ Logout Supabase fallito:', result.error);
        return { error: result.error };
      }
      
    } catch (error) {
      console.error('Errore durante il logout:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signInWithOTP,
    signOut,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
