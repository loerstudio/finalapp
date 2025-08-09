import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

const Solutions = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Trova la tua <Text style={styles.titleRed}>soluzione ideale</Text>.
      </Text>
      <View style={styles.underline} />

      <View style={styles.grid}>
        <View style={styles.card}>
          <View style={styles.icon}>
            <Text>📋</Text>
          </View>
          <Text style={styles.cardTitle}>NUTRIZIONE E DIMAGRIMENTO</Text>
          <Text style={styles.description}>
            Da anni aiutiamo moltissimi italiani ad avere il pieno controllo del loro corpo e del proprio peso. 
            Vi insegniamo a controllare la vostra alimentazione e la vostra dieta facilmente, senza grandi rinunce, 
            per ottenere risultati veri. Ma non solo! Grazie a quanto imparato, potrete mantenere questi risultati 
            in autonomia per sempre.
          </Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>SCOPRI IL METODO SPC</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.icon}>
            <Text>🏃</Text>
          </View>
          <Text style={styles.cardTitle}>TRASFORMA IL TUO FISICO</Text>
          <Text style={styles.description}>
            Unisciti alle centinaia di persone che si sono affidate a SimoPagno Coaching per migliorare la loro 
            forma fisica. Noi non ti molliamo mai! Ti daremo tutti gli strumenti per ottenere il corpo che desideri 
            e migliorare la tua prestazione sportiva.
          </Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>SCOPRI IL METODO SPC</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.icon}>
            <Text>🏆</Text>
          </View>
          <Text style={styles.cardTitle}>PROFESSIONISTA D'ELITE</Text>
          <Text style={styles.description}>
            Servizio Elite dedicato ad atleti PRO, agonisti di qualsiasi sport e bodybuilder che fanno di questo 
            la loro vita. Supporto su Nutrizione, Allenamento ed Integrazione al fine di raggiungere il pieno 
            potenziale e vincere il più possibile.
          </Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>ENTRA NELL'ELITE</Text>
          </TouchableOpacity>
        </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 60,
  },
  card: {
    flex: 1,
    minWidth: 350,
    alignItems: 'center',
    padding: 40,
  },
  icon: {
    width: 80,
    height: 80,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.white,
    textTransform: 'uppercase',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.white,
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderWidth: 2,
    borderColor: theme.colors.white,
    borderRadius: 50,
  },
  buttonText: {
    color: theme.colors.white,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

export default Solutions; 