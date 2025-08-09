import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { theme } from '../../styles/theme';

interface NewsletterModalProps {
  visible: boolean;
  onClose: () => void;
}

const NewsletterModal: React.FC<NewsletterModalProps> = ({ visible, onClose }) => {
  const handleSubmit = () => {
    // Handle form submission
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Rimani aggiornato sulle ultime novità!</Text>
          <Text style={styles.subtitle}>Unisciti a noi, siamo più di 25.000!</Text>
          <Text style={styles.description}>
            Iscriviti subito alla newsletter, ti basta compilare il form che trovi qui sotto!!
          </Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Il tuo nome"
              placeholderTextColor={theme.colors.white}
            />
            <TextInput
              style={styles.input}
              placeholder="La tua migliore email"
              placeholderTextColor={theme.colors.white}
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Telefono"
              placeholderTextColor={theme.colors.white}
              keyboardType="phone-pad"
            />
            <View style={styles.select}>
              <Text style={styles.selectPlaceholder}>Il tuo obiettivo...</Text>
            </View>

            <View style={styles.checkboxGroup}>
              <View style={styles.checkbox} />
              <Text style={styles.checkboxLabel}>
                Ho letto e acconsento l'informativa sulla privacy. Presto il consenso al trattamento per le finalità 1, 2, 3, 4, 5, 6, 7, 8, 10, 11 (par. 6).
              </Text>
            </View>

            <View style={styles.checkboxGroup}>
              <View style={styles.checkbox} />
              <Text style={styles.checkboxLabel}>
                Desidero iscrivermi alla newsletter. A tale scopo estendo il consenso al trattamento per la finalità indicate al punto 6.9 dell'informativa sulla privacy.
              </Text>
            </View>

            <TouchableOpacity style={styles.confirmButton} onPress={handleSubmit}>
              <Text style={styles.confirmButtonText}>CONFERMA</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: theme.colors.primary,
    padding: 40,
    borderRadius: 10,
    width: '90%',
    maxWidth: 500,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 20,
  },
  closeButtonText: {
    fontSize: 24,
    color: theme.colors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.white,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: theme.colors.white,
    marginBottom: 30,
  },
  form: {
    gap: 20,
  },
  input: {
    width: '100%',
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 5,
    color: theme.colors.white,
  },
  select: {
    width: '100%',
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 5,
  },
  selectPlaceholder: {
    color: theme.colors.white,
  },
  checkboxGroup: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: theme.colors.white,
    borderRadius: 3,
    marginTop: 3,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.white,
  },
  confirmButton: {
    width: '100%',
    padding: 15,
    backgroundColor: theme.colors.black,
    borderRadius: 50,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.white,
    textTransform: 'uppercase',
  },
});

export default NewsletterModal; 