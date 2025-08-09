import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'coach' | 'client';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  role: 'coach' | 'client';
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  role?: 'coach' | 'client';
  is_active?: boolean;
}

export class UserManagementService {
  // Verifica se l'utente corrente è un coach autorizzato
  private static async isAuthorizedCoach(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', user.id)
        .single();

      // Solo il coach con email specifica può gestire utenti
      return profile?.role === 'coach' && profile?.email === 'loerstudio0@gmail.com';
    } catch (error) {
      console.error('Errore verifica autorizzazione coach:', error);
      return false;
    }
  }

  // Ottieni tutti gli utenti (solo per coach autorizzati)
  static async getAllUsers(): Promise<{ success: boolean; users?: UserProfile[]; error?: string }> {
    try {
      const isAuthorized = await this.isAuthorizedCoach();
      if (!isAuthorized) {
        return { success: false, error: 'Non autorizzato. Solo coach autorizzati possono visualizzare gli utenti.' };
      }

      const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Errore recupero utenti:', error);
        return { success: false, error: 'Errore nel recupero degli utenti' };
      }

      return { success: true, users: users || [] };
    } catch (error) {
      console.error('Errore gestione utenti:', error);
      return { success: false, error: 'Errore durante la gestione utenti' };
    }
  }

  // Crea un nuovo utente (solo per coach autorizzati)
  static async createUser(userData: CreateUserRequest): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const isAuthorized = await this.isAuthorizedCoach();
      if (!isAuthorized) {
        return { success: false, error: 'Non autorizzato. Solo coach autorizzati possono creare utenti.' };
      }

      // Verifica se l'email esiste già
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        return { success: false, error: 'Email già registrata nel sistema' };
      }

      // Crea l'utente in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          name: userData.name,
          role: userData.role,
        }
      });

      if (authError) {
        console.error('Errore creazione utente auth:', authError);
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Errore nella creazione utente' };
      }

      // Crea il profilo nella tabella profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (profileError) {
        console.error('Errore creazione profilo:', profileError);
        return { success: false, error: profileError.message };
      }

      const user: UserProfile = {
        id: profileData.id,
        email: profileData.email,
        name: profileData.name,
        role: profileData.role,
        is_active: profileData.is_active,
        created_at: profileData.created_at,
        updated_at: profileData.updated_at,
      };

      console.log('✅ Utente creato con successo:', user);
      return { success: true, user };
    } catch (error) {
      console.error('Errore creazione utente:', error);
      return { success: false, error: 'Errore durante la creazione utente' };
    }
  }

  // Aggiorna un utente (solo per coach autorizzati)
  static async updateUser(userId: string, updates: UpdateUserRequest): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const isAuthorized = await this.isAuthorizedCoach();
      if (!isAuthorized) {
        return { success: false, error: 'Non autorizzato. Solo coach autorizzati possono modificare utenti.' };
      }

      const { data: user, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Errore aggiornamento utente:', error);
        return { success: false, error: 'Errore nell\'aggiornamento utente' };
      }

      return { success: true, user };
    } catch (error) {
      console.error('Errore aggiornamento utente:', error);
      return { success: false, error: 'Errore durante l\'aggiornamento utente' };
    }
  }

  // Disattiva un utente (solo per coach autorizzati)
  static async deactivateUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const isAuthorized = await this.isAuthorizedCoach();
      if (!isAuthorized) {
        return { success: false, error: 'Non autorizzato. Solo coach autorizzati possono disattivare utenti.' };
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Errore disattivazione utente:', error);
        return { success: false, error: 'Errore nella disattivazione utente' };
      }

      return { success: true };
    } catch (error) {
      console.error('Errore disattivazione utente:', error);
      return { success: false, error: 'Errore durante la disattivazione utente' };
    }
  }

  // Riattiva un utente (solo per coach autorizzati)
  static async reactivateUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const isAuthorized = await this.isAuthorizedCoach();
      if (!isAuthorized) {
        return { success: false, error: 'Non autorizzato. Solo coach autorizzati possono riattivare utenti.' };
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Errore riattivazione utente:', error);
        return { success: false, error: 'Errore nella riattivazione utente' };
      }

      return { success: true };
    } catch (error) {
      console.error('Errore riattivazione utente:', error);
      return { success: false, error: 'Errore durante la riattivazione utente' };
    }
  }

  // Elimina un utente (solo per coach autorizzati)
  static async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const isAuthorized = await this.isAuthorizedCoach();
      if (!isAuthorized) {
        return { success: false, error: 'Non autorizzato. Solo coach autorizzati possono eliminare utenti.' };
      }

      // Prima elimina il profilo
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('Errore eliminazione profilo:', profileError);
        return { success: false, error: 'Errore nell\'eliminazione profilo' };
      }

      // Poi elimina l'utente da Supabase Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) {
        console.error('Errore eliminazione utente auth:', authError);
        // Non restituiamo errore qui perché il profilo è già stato eliminato
      }

      return { success: true };
    } catch (error) {
      console.error('Errore eliminazione utente:', error);
      return { success: false, error: 'Errore durante l\'eliminazione utente' };
    }
  }

  // Ottieni utente specifico (solo per coach autorizzati)
  static async getUserById(userId: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const isAuthorized = await this.isAuthorizedCoach();
      if (!isAuthorized) {
        return { success: false, error: 'Non autorizzato. Solo coach autorizzati possono visualizzare dettagli utente.' };
      }

      const { data: user, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Errore recupero utente:', error);
        return { success: false, error: 'Errore nel recupero utente' };
      }

      return { success: true, user };
    } catch (error) {
      console.error('Errore recupero utente:', error);
      return { success: false, error: 'Errore durante il recupero utente' };
    }
  }
}
