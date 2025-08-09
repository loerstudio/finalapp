import { supabase } from './supabase';

export interface OTPResponse {
  success: boolean;
  message: string;
  otp?: string;
}

export class OTPService {
  private static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private static async verifyEmailExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return false;
      }
      return true;
    } catch (error) {
      console.error('Errore verifica email:', error);
      return false;
    }
  }

  // Metodo per inviare OTP durante il LOGIN (verifica che l'email esista e sia attiva)
  static async sendOTPForLogin(email: string): Promise<OTPResponse> {
    try {
      // Verifica che l'email esista nel database e sia attiva
      const emailExists = await this.verifyEmailExists(email);
      
      if (!emailExists) {
        return {
          success: false,
          message: 'Email non trovata o account disattivato. Contatta il tuo coach per assistenza.'
        };
      }

      // Genera OTP
      const otp = this.generateOTP();
      
      // Invia email con OTP (qui puoi integrare il tuo servizio email)
      // Per ora simuliamo l'invio
      console.log(`OTP inviato a ${email}: ${otp}`);
      
      // Salva OTP nel database per verifica (opzionale)
      // await this.saveOTPToDatabase(email, otp);
      
      return {
        success: true,
        message: 'OTP inviato con successo!',
        otp: otp // In produzione, non restituire l'OTP
      };
    } catch (error) {
      console.error('Errore invio OTP:', error);
      return {
        success: false,
        message: 'Errore durante l\'invio dell\'OTP. Riprova più tardi.'
      };
    }
  }

  // Metodo legacy per compatibilità (usa sendOTPForLogin per default)
  static async sendOTP(email: string): Promise<OTPResponse> {
    return this.sendOTPForLogin(email);
  }

  // Verifica OTP per il LOGIN (richiede email esistente e attiva)
  static async verifyOTPForLogin(email: string, otp: string): Promise<OTPResponse> {
    try {
      // Verifica che l'email esista e sia attiva
      const emailExists = await this.verifyEmailExists(email);
      
      if (!emailExists) {
        return {
          success: false,
          message: 'Email non valida o account disattivato'
        };
      }

      // Qui implementeresti la verifica dell'OTP dal database
      // Per ora simuliamo la verifica
      if (otp.length === 6 && /^\d{6}$/.test(otp)) {
        return {
          success: true,
          message: 'OTP verificato con successo!'
        };
      }

      return {
        success: false,
        message: 'OTP non valido'
      };
    } catch (error) {
      console.error('Errore verifica OTP:', error);
      return {
        success: false,
        message: 'Errore durante la verifica dell\'OTP'
      };
    }
  }

  static async verifyOTP(email: string, otp: string): Promise<OTPResponse> {
    return this.verifyOTPForLogin(email, otp);
  }
}
