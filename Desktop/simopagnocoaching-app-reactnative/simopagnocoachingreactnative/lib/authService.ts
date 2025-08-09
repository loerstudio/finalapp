import { localDatabase } from './localDatabase';
import { User } from '@/types';
import * as Crypto from 'expo-crypto';
import { emailService } from './emailService';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'coach' | 'client';
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface OTPData {
  email: string;
  otp: string;
  expires_at: string;
  attempts: number;
}

class AuthService {
  private otpStore: Map<string, OTPData> = new Map();

  // Genera un hash della password
  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );
    return hashBuffer;
  }

  // Verifica la password
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password);
    return passwordHash === hash;
  }

  // Genera un OTP di 6 cifre
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Registra un nuovo utente
  async registerUser(name: string, email: string, password: string, role: 'coach' | 'client' = 'client'): Promise<{ success: boolean; error?: string }> {
    try {
      // Verifica se l'utente esiste già
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        return { success: false, error: 'Utente già registrato con questa email' };
      }

      // Hash della password
      const passwordHash = await this.hashPassword(password);
      
      // Crea il nuovo utente
      const userId = Date.now().toString();
      const timestamp = new Date().toISOString();
      
      const newUser: AuthUser = {
        id: userId,
        email,
        name,
        role,
        password_hash: passwordHash,
        created_at: timestamp,
        updated_at: timestamp
      };

      // Salva nel database locale
      await localDatabase.createUser(newUser);

      return { success: true };
    } catch (error) {
      console.error('Errore nella registrazione:', error);
      return { success: false, error: 'Errore durante la registrazione' };
    }
  }

  // Invia OTP per il login
  async sendOTP(email: string): Promise<{ success: boolean; error?: string; otp?: string }> {
    try {
      // Verifica se l'utente esiste
      const user = await this.getUserByEmail(email);
      if (!user) {
        return { success: false, error: 'Utente non trovato' };
      }

      // Genera OTP
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minuti

      // Salva OTP
      this.otpStore.set(email, {
        email,
        otp,
        expires_at: expiresAt.toISOString(),
        attempts: 0
      });

      // Invia OTP via email
      const emailResult = await emailService.sendOTPEmail(email, otp, user.name);
      
      if (emailResult.success) {
        console.log(`OTP inviato via email a ${email}`);
        return { success: true, otp }; // Restituiamo ancora l'OTP per i test
      } else {
        console.error('Errore nell\'invio email:', emailResult.error);
        // Fallback: mostra l'OTP nell'alert se l'email fallisce
        console.log(`OTP per ${email} (fallback): ${otp}`);
        return { success: true, otp };
      }
    } catch (error) {
      console.error('Errore nell\'invio OTP:', error);
      return { success: false, error: 'Errore nell\'invio OTP' };
    }
  }

  // Verifica OTP e effettua login
  async verifyOTPAndLogin(email: string, otp: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const otpData = this.otpStore.get(email);
      if (!otpData) {
        return { success: false, error: 'OTP non trovato o scaduto' };
      }

      // Verifica tentativi
      if (otpData.attempts >= 3) {
        this.otpStore.delete(email);
        return { success: false, error: 'Troppi tentativi falliti. Richiedi un nuovo OTP' };
      }

      // Verifica scadenza
      if (new Date() > new Date(otpData.expires_at)) {
        this.otpStore.delete(email);
        return { success: false, error: 'OTP scaduto' };
      }

      // Verifica OTP
      if (otpData.otp !== otp) {
        otpData.attempts++;
        return { success: false, error: 'OTP non valido' };
      }

      // OTP valido, ottieni l'utente
      const authUser = await this.getUserByEmail(email);
      if (!authUser) {
        return { success: false, error: 'Utente non trovato' };
      }

      // Rimuovi OTP
      this.otpStore.delete(email);

      // Converti in User per l'app
      const user: User = {
        id: authUser.id,
        email: authUser.email,
        name: authUser.name, // Aggiungi il nome
        role: authUser.role,
        created_at: authUser.created_at,
        updated_at: authUser.updated_at
      };

      return { success: true, user };
    } catch (error) {
      console.error('Errore nella verifica OTP:', error);
      return { success: false, error: 'Errore nella verifica OTP' };
    }
  }

  // Login con password (per compatibilità)
  async loginWithPassword(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const authUser = await this.getUserByEmail(email);
      if (!authUser) {
        return { success: false, error: 'Utente non trovato' };
      }

      const isValidPassword = await this.verifyPassword(password, authUser.password_hash);
      if (!isValidPassword) {
        return { success: false, error: 'Password non valida' };
      }

      const user: User = {
        id: authUser.id,
        email: authUser.email,
        role: authUser.role,
        created_at: authUser.created_at,
        updated_at: authUser.updated_at
      };

      return { success: true, user };
    } catch (error) {
      console.error('Errore nel login:', error);
      return { success: false, error: 'Errore durante il login' };
    }
  }

  // Ottieni utente per email
  async getUserByEmail(email: string): Promise<AuthUser | null> {
    try {
      return await localDatabase.getUserByEmail(email);
    } catch (error) {
      console.error('Errore nel recupero utente:', error);
      return null;
    }
  }

  // Ottieni utente per ID
  async getUserById(id: string): Promise<AuthUser | null> {
    try {
      return await localDatabase.getUserById(id);
    } catch (error) {
      console.error('Errore nel recupero utente:', error);
      return null;
    }
  }

  // Inizializza utenti di esempio
  async initializeSampleUsers(): Promise<void> {
    try {
      // Verifica se l'utente Lorenzo Coach esiste già
      const existingUser = await this.getUserByEmail('itsilorenz07@gmail.com');
      if (existingUser) {
        console.log('Utente Lorenzo Coach già esistente');
        return;
      }

      // Crea l'utente Lorenzo Coach
      const result = await this.registerUser(
        'Lorenzo Coach',
        'itsilorenz07@gmail.com',
        'LorenzoCoach123',
        'coach'
      );

      if (result.success) {
        console.log('Utente Lorenzo Coach creato con successo');
      } else {
        console.error('Errore nella creazione utente Lorenzo Coach:', result.error);
      }
    } catch (error) {
      console.error('Errore nell\'inizializzazione utenti di esempio:', error);
    }
  }
}

export const authService = new AuthService();
