import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

const WhyChoose = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Perché scegliere <Text style={styles.titleRed}>SPC</Text>.
      </Text>
      <View style={styles.underline} />

      <View style={styles.focusCard}>
        <Text style={styles.focusIcon}>🏃‍♂️🏃‍♀️</Text>
        <Text style={styles.focusTitle}>FOCUS SUL TUO OBIETTIVO</Text>
        <Text style={styles.focusDescription}>
          Abbiamo bisogno solo del tuo impegno. Saremo la tua guida sportiva e nutrizionale durante il tuo percorso, 
          che tu voglia perdere peso, aumentare la massa muscolare o eccellere nel tuo sport, penseremo a tutto noi!
        </Text>
      </View>

      <View style={styles.communicationCard}>
        <Text style={styles.communicationIcon}>😊📱</Text>
        <Text style={styles.communicationTitle}>COMUNICAZIONE EFFICACE</Text>
        <Text style={styles.communicationDescription}>
          Disponibilità piena tramite WhatsApp / Telegram / Email / SMS con risposte RAPIDE
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 100,
    maxWidth: 1200,
    alignSelf: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: theme.colors.white,
    marginBottom: 60,
  },
  titleRed: {
    color: theme.colors.primary,
  },
  underline: {
    width: 60,
    height: 4,
    backgroundColor: theme.colors.primary,
    marginBottom: 60,
  },
  focusCard: {
    alignItems: 'center',
    padding: 60,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: theme.colors.primary,
    borderRadius: 20,
    marginBottom: 80,
  },
  focusIcon: {
    fontSize: 64,
    marginBottom: 30,
  },
  focusTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.white,
    textTransform: 'uppercase',
    marginBottom: 30,
  },
  focusDescription: {
    fontSize: 18,
    lineHeight: 28,
    color: theme.colors.white,
    textAlign: 'center',
    maxWidth: 600,
  },
  communicationCard: {
    alignItems: 'center',
    padding: 40,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: theme.colors.primary,
    borderRadius: 20,
    maxWidth: 500,
    alignSelf: 'center',
  },
  communicationIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  communicationTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.white,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  communicationDescription: {
    fontSize: 16,
    color: theme.colors.white,
    textAlign: 'center',
  },
});

export default WhyChoose; 