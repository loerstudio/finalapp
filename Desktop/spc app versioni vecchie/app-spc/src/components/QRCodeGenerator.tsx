import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Colors } from '../constants/colors';

const { width } = Dimensions.get('window');

interface QRCodeGeneratorProps {
  visible: boolean;
  onClose: () => void;
  data: string;
  title?: string;
  subtitle?: string;
  showShareButton?: boolean;
  onShare?: () => void;
}

export default function QRCodeGenerator({
  visible,
  onClose,
  data,
  title = 'QR Code',
  subtitle,
  showShareButton = true,
  onShare,
}: QRCodeGeneratorProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* QR Code */}
          <View style={styles.qrContainer}>
            <QRCode
              value={data}
              size={Math.min(width * 0.6, 250)}
              color={Colors.text}
              backgroundColor={Colors.background}
            />
          </View>

          {/* Subtitle */}
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}

          {/* Data Display */}
          <View style={styles.dataContainer}>
            <Text style={styles.dataLabel}>Data:</Text>
            <Text style={styles.dataText} numberOfLines={3}>
              {data}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {showShareButton && onShare && (
              <TouchableOpacity style={styles.shareButton} onPress={onShare}>
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.closeActionButton} onPress={onClose}>
              <Text style={styles.closeActionButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    minWidth: 300,
    maxWidth: width - 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  title: {
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
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  dataContainer: {
    width: '100%',
    marginBottom: 20,
  },
  dataLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  dataText: {
    color: Colors.textTertiary,
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  shareButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  closeActionButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  closeActionButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
}); 