import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { config } from '../config';

// Configurazione Supabase
const supabaseUrl = config.supabase.url;
const supabaseAnonKey = config.supabase.anonKey;

// Funzione per ottenere il token di accesso
const getAccessToken = async () => {
  try {
    return await SecureStore.getItemAsync('supabase_access_token');
  } catch (error) {
    console.error('Errore nel recupero del token:', error);
    return null;
  }
};

// Funzione per salvare il token di accesso
const setAccessToken = async (token: string) => {
  try {
    await SecureStore.setItemAsync('supabase_access_token', token);
  } catch (error) {
    console.error('Errore nel salvataggio del token:', error);
  }
};

// Funzione per rimuovere il token di accesso
const removeAccessToken = async () => {
  try {
    await SecureStore.deleteItemAsync('supabase_access_token');
  } catch (error) {
    console.error('Errore nella rimozione del token:', error);
  }
};

// Creazione del client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: async (key: string) => {
        const value = await AsyncStorage.getItem(key);
        return value;
      },
      setItem: async (key: string, value: string) => {
        await AsyncStorage.setItem(key, value);
      },
      removeItem: async (key: string) => {
        await AsyncStorage.removeItem(key);
      },
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Funzioni di autenticazione
export const auth = {
  // Login con email e password
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.session?.access_token) {
        await setAccessToken(data.session.access_token);
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Errore durante il login:', error);
      return { data: null, error };
    }
  },

  // Logout
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      await removeAccessToken();
      return { error: null };
    } catch (error) {
      console.error('Errore durante il logout:', error);
      return { error };
    }
  },

  // Ottieni sessione corrente
  getSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      return { session, error };
    } catch (error) {
      console.error('Errore nel recupero della sessione:', error);
      return { session: null, error };
    }
  },

  // Ottieni utente corrente
  getUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    } catch (error) {
      console.error('Errore nel recupero dell\'utente:', error);
      return { user: null, error };
    }
  },
};

export { getAccessToken, setAccessToken, removeAccessToken };
