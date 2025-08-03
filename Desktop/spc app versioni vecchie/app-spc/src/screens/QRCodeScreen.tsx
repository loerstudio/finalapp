import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg';
import { Colors } from '../constants/colors';
import QRCodeService from '../services/qrCode';

const { width } = Dimensions.get('window');

interface QRCodeScreenProps {
  navigation: any;
}

export default function QRCodeScreen({ navigation }: QRCodeScreenProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanMode, setScanMode] = useState(true);
  const [qrData, setQrData] = useState(() => {
    try {
      return QRCodeService.generateDemoQR();
    } catch (error) {
      console.error('Error generating demo QR:', error);
      return 'SPC-FITNESS-DEMO-12345';
    }
  });
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    QRCodeService.handleScannedQR(data, navigation);
  };

  const generateQRCode = () => {
    setShowQRModal(true);
  };

  const scanQRCode = () => {
    setScanMode(true);
    setScanned(false);
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Richiesta permesso fotocamera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Nessun accesso alla fotocamera</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Indietro</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Codice QR</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Mode Toggle */}
      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, scanMode && styles.toggleButtonActive]}
          onPress={scanQRCode}
        >
          <Text style={[styles.toggleButtonText, scanMode && styles.toggleButtonTextActive]}>
            Scansiona QR
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, !scanMode && styles.toggleButtonActive]}
          onPress={generateQRCode}
        >
          <Text style={[styles.toggleButtonText, !scanMode && styles.toggleButtonTextActive]}>
            Genera QR
          </Text>
        </TouchableOpacity>
      </View>

      {/* Scanner View */}
      {scanMode && (
        <View style={styles.scannerContainer}>
          <CameraView
            style={styles.scanner}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          />
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame} />
            <Text style={styles.scannerText}>Posiziona il codice QR nel riquadro</Text>
          </View>
          {scanned && (
            <TouchableOpacity style={styles.scanAgainButton} onPress={() => setScanned(false)}>
              <Text style={styles.scanAgainButtonText}>Tocca per Scansionare di Nuovo</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* QR Code Generator Modal */}
      <Modal
        visible={showQRModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Il Tuo Codice QR</Text>
              <TouchableOpacity onPress={() => setShowQRModal(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.qrContainer}>
              <QRCode
                value={qrData}
                size={200}
                color={Colors.text}
                backgroundColor={Colors.background}
              />
            </View>
            
            <Text style={styles.qrDataText}>{qrData}</Text>
            
            <TouchableOpacity style={styles.shareButton}>
              <Text style={styles.shareButtonText}>Condividi Codice QR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: Colors.text,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  modeToggle: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  toggleButtonTextActive: {
    color: Colors.text,
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  scanner: {
    flex: 1,
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerFrame: {
    width: width * 0.7,
    height: width * 0.7,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scannerText: {
    color: Colors.text,
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  scanAgainButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: Colors.text,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  buttonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    minWidth: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: Colors.text,
    fontWeight: '600',
  },
  qrContainer: {
    backgroundColor: Colors.text,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  qrDataText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  shareButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  shareButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
}); 