import { Alert } from 'react-native';

export interface QRCodeData {
  id: string;
  type: 'user' | 'workout' | 'nutrition' | 'progress';
  data: any;
  timestamp: number;
}

export class QRCodeService {
  // Generate QR code data for different types
  static generateUserQR(userId: string, userData: any): string {
    const qrData: QRCodeData = {
      id: userId,
      type: 'user',
      data: userData,
      timestamp: Date.now(),
    };
    return JSON.stringify(qrData);
  }

  static generateWorkoutQR(workoutId: string, workoutData: any): string {
    const qrData: QRCodeData = {
      id: workoutId,
      type: 'workout',
      data: workoutData,
      timestamp: Date.now(),
    };
    return JSON.stringify(qrData);
  }

  static generateNutritionQR(nutritionId: string, nutritionData: any): string {
    const qrData: QRCodeData = {
      id: nutritionId,
      type: 'nutrition',
      data: nutritionData,
      timestamp: Date.now(),
    };
    return JSON.stringify(qrData);
  }

  static generateProgressQR(progressId: string, progressData: any): string {
    const qrData: QRCodeData = {
      id: progressId,
      type: 'progress',
      data: progressData,
      timestamp: Date.now(),
    };
    return JSON.stringify(qrData);
  }

  // Parse scanned QR code data
  static parseQRCodeData(qrString: string): QRCodeData | null {
    try {
      const parsed = JSON.parse(qrString);
      
      // Validate the structure
      if (parsed.id && parsed.type && parsed.data && parsed.timestamp) {
        return parsed as QRCodeData;
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing QR code data:', error);
      return null;
    }
  }

  // Handle scanned QR code based on type
  static handleScannedQR(qrString: string, navigation: any): void {
    try {
      const qrData = this.parseQRCodeData(qrString);
      
      if (!qrData) {
        Alert.alert('QR Code Non Valido', 'Il codice QR scansionato non è valido.');
        return;
      }

      switch (qrData.type) {
        case 'user':
          this.handleUserQR(qrData, navigation);
          break;
        case 'workout':
          this.handleWorkoutQR(qrData, navigation);
          break;
        case 'nutrition':
          this.handleNutritionQR(qrData, navigation);
          break;
        case 'progress':
          this.handleProgressQR(qrData, navigation);
          break;
        default:
          Alert.alert('Tipo QR Sconosciuto', 'Questo tipo di codice QR non è supportato.');
      }
    } catch (error) {
      console.error('Error handling QR code:', error);
      Alert.alert('Errore', 'Si è verificato un errore durante la scansione del codice QR.');
    }
  }

  private static handleUserQR(qrData: QRCodeData, navigation: any): void {
    Alert.alert(
      'QR Code Utente Scansionato',
      `ID Utente: ${qrData.id}\nNome: ${qrData.data.name || 'N/A'}`,
      [
        {
          text: 'Visualizza Profilo',
          onPress: () => {
            // Navigate to user profile
            navigation.navigate('ClientManagement', { userId: qrData.id });
          },
        },
        {
          text: 'Annulla',
          style: 'cancel',
        },
      ]
    );
  }

  private static handleWorkoutQR(qrData: QRCodeData, navigation: any): void {
    Alert.alert(
      'QR Code Allenamento Scansionato',
      `Allenamento: ${qrData.data.name || 'N/A'}\nDurata: ${qrData.data.duration || 'N/A'}`,
      [
        {
          text: 'Inizia Allenamento',
          onPress: () => {
            navigation.navigate('Workout', { workoutId: qrData.id });
          },
        },
        {
          text: 'Visualizza Dettagli',
          onPress: () => {
            navigation.navigate('Workout', { workoutId: qrData.id, viewOnly: true });
          },
        },
        {
          text: 'Annulla',
          style: 'cancel',
        },
      ]
    );
  }

  private static handleNutritionQR(qrData: QRCodeData, navigation: any): void {
    Alert.alert(
      'QR Code Nutrizione Scansionato',
      `Pasto: ${qrData.data.name || 'N/A'}\nCalorie: ${qrData.data.calories || 'N/A'}`,
      [
        {
          text: 'Registra Pasto',
          onPress: () => {
            navigation.navigate('Nutrition', { nutritionId: qrData.id });
          },
        },
        {
          text: 'Visualizza Dettagli',
          onPress: () => {
            navigation.navigate('Nutrition', { nutritionId: qrData.id, viewOnly: true });
          },
        },
        {
          text: 'Annulla',
          style: 'cancel',
        },
      ]
    );
  }

  private static handleProgressQR(qrData: QRCodeData, navigation: any): void {
    Alert.alert(
      'QR Code Progresso Scansionato',
      `Tipo Progresso: ${qrData.data.type || 'N/A'}\nData: ${new Date(qrData.timestamp).toLocaleDateString('it-IT')}`,
      [
        {
          text: 'Visualizza Progresso',
          onPress: () => {
            navigation.navigate('Progress', { progressId: qrData.id });
          },
        },
        {
          text: 'Annulla',
          style: 'cancel',
        },
      ]
    );
  }

  // Generate a simple demo QR code for testing
  static generateDemoQR(): string {
    return this.generateUserQR('demo-user-123', {
      name: 'Demo User',
      email: 'demo@spcfitness.com',
      membershipType: 'Premium',
    });
  }
}

export default QRCodeService; 