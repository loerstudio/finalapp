import { supabase } from './supabase';
import { User } from '@/types';

export interface SupabaseUser {
  id: string;
  email: string;
  name: string;
  role: 'coach' | 'client';
  created_at: string;
  updated_at: string;
}

class SupabaseAuthService {
  // Registra un nuovo utente
  async registerUser(name: string, email: string, password: string, role: 'coach' | 'client' = 'client'): Promise<{ success: boolean; error?: string; user?: SupabaseUser }> {
    try {
      // Registra l'utente in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          }
        }
      });

      if (authError) {
        console.error('Errore nella registrazione auth:', authError);
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Errore nella registrazione utente' };
      }

      // Crea il profilo utente nella tabella profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email,
            name,
            role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (profileError) {
        console.error('Errore nella creazione profilo:', profileError);
        return { success: false, error: profileError.message };
      }

      const user: SupabaseUser = {
        id: profileData.id,
        email: profileData.email,
        name: profileData.name,
        role: profileData.role,
        created_at: profileData.created_at,
        updated_at: profileData.updated_at,
      };

      console.log('✅ Utente registrato con successo:', user);
      return { success: true, user };
    } catch (error) {
      console.error('Errore nella registrazione:', error);
      return { success: false, error: 'Errore durante la registrazione' };
    }
  }

  // Login con email e password
  async loginWithPassword(email: string, password: string): Promise<{ success: boolean; user?: SupabaseUser; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Errore nel login:', error);
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Utente non trovato' };
      }

      // Ottieni il profilo utente
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Errore nel recupero profilo:', profileError);
        return { success: false, error: profileError.message };
      }

      const user: SupabaseUser = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };

      console.log('✅ Login riuscito:', user);
      return { success: true, user };
    } catch (error) {
      console.error('Errore nel login:', error);
      return { success: false, error: 'Errore durante il login' };
    }
  }

  // Login con OTP
  async loginWithOTP(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📧 Invio OTP a:', email);
      
      // Verifica se l'utente esiste prima di inviare l'OTP
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('email', email)
        .single();

      if (checkError || !existingUser) {
        console.error('❌ Utente non trovato:', email);
        return { success: false, error: 'Utente non registrato. Contatta il tuo coach per l\'accesso.' };
      }

      console.log(`✅ Utente trovato: ${existingUser.email} (${existingUser.role})`);
      
      // Supabase gestirà internamente la verifica dell'email
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: 'simopagnocoaching://login',
          shouldCreateUser: false, // NON creare utente se non esiste
        }
      });

      if (error) {
        console.error('❌ Errore nell\'invio OTP:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ OTP inviato con successo a:', email);
      return { success: true };
    } catch (error) {
      console.error('❌ Errore nell\'invio OTP:', error);
      return { success: false, error: 'Errore nell\'invio OTP' };
    }
  }

  // Verifica OTP
  async verifyOTP(email: string, token: string): Promise<{ success: boolean; user?: SupabaseUser; error?: string }> {
    try {
      console.log('🔐 Verifica OTP per:', email);
      
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });

      if (error) {
        console.error('❌ Errore nella verifica OTP:', error);
        return { success: false, error: error.message };
      }

      if (!data.user) {
        console.error('❌ Utente non trovato dopo verifica OTP');
        return { success: false, error: 'Utente non trovato' };
      }

      console.log('✅ OTP verificato, utente trovato:', data.user.id);

      // Ottieni il profilo utente (ora garantiamo che esista)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('❌ Errore nel recupero profilo:', profileError);
        return { success: false, error: 'Profilo utente non trovato' };
      }

      const user: SupabaseUser = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };

      console.log('✅ Login OTP riuscito:', user);
      return { success: true, user };
    } catch (error) {
      console.error('❌ Errore nella verifica OTP:', error);
      return { success: false, error: 'Errore nella verifica OTP' };
    }
  }

  // Crea profilo per nuovo utente
  private async createProfileForUser(userId: string, email: string): Promise<SupabaseUser | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email,
            name: email.split('@')[0], // Usa la parte prima della @ come nome
            role: 'client', // Default role
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('❌ Errore nella creazione profilo:', error);
        return null;
      }

      const user: SupabaseUser = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };

      console.log('✅ Profilo creato per nuovo utente:', user);
      return user;
    } catch (error) {
      console.error('❌ Errore nella creazione profilo:', error);
      return null;
    }
  }

  // Logout
  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Errore nel logout:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Logout riuscito');
      return { success: true };
    } catch (error) {
      console.error('Errore nel logout:', error);
      return { success: false, error: 'Errore durante il logout' };
    }
  }

  // Ottieni utente corrente
  async getCurrentUser(): Promise<{ user?: SupabaseUser; error?: string }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        // Non loggare errori di sessione mancante come errori critici
        if (error.message.includes('Auth session missing') || error.message.includes('session missing')) {
          console.log('ℹ️ Nessuna sessione attiva - utente non autenticato');
        } else {
          console.error('Errore nel recupero utente:', error);
        }
        return { error: error.message };
      }

      if (!user) {
        console.log('Nessun utente autenticato');
        return { user: undefined };
      }

      console.log('Utente autenticato trovato:', user.id);

      // Ottieni il profilo utente
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Errore nel recupero profilo:', profileError);
        return { error: profileError.message };
      }

      const supabaseUser: SupabaseUser = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };

      console.log('Profilo utente recuperato:', supabaseUser);
      return { user: supabaseUser };
    } catch (error) {
      console.error('Errore nel recupero utente corrente:', error);
      return { error: 'Errore nel recupero utente' };
    }
  }

  // Ottieni sessione corrente
  async getCurrentSession(): Promise<{ session: any; error?: string }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Errore nel recupero sessione:', error);
        return { session: null, error: error.message };
      }

      return { session };
    } catch (error) {
      console.error('Errore nel recupero sessione:', error);
      return { session: null, error: 'Errore nel recupero sessione' };
    }
  }

  // Inizializza utenti di esempio (RIMOSSO - solo dati reali)
  async initializeSampleUsers(): Promise<void> {
    // Non creiamo più utenti demo - solo dati reali
    console.log('✅ Modalità dati reali attiva - nessun utente demo creato');
  }
}

export const supabaseAuthService = new SupabaseAuthService();
