import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';

interface RoleBasedNavigationProps {
  onNavigate: (screen: string) => void;
}

export default function RoleBasedNavigation({ onNavigate }: RoleBasedNavigationProps) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const isCoach = user.role === 'coach';
  const isClient = user.role === 'client';

  const coachFeatures = [
    {
      id: 'clients',
      title: 'I Miei Clienti',
      description: 'Gestisci i tuoi clienti e i loro progressi',
      icon: 'people',
      color: '#4CAF50'
    },
    {
      id: 'create-workout',
      title: 'Crea Allenamento',
      description: 'Crea programmi personalizzati per i clienti',
      icon: 'fitness',
      color: '#2196F3'
    },
    {
      id: 'workout-management',
      title: 'Gestione Allenamenti',
      description: 'Monitora e modifica i programmi esistenti',
      icon: 'clipboard',
      color: '#FF9800'
    },
    {
      id: 'analytics',
      title: 'Analisi e Statistiche',
      description: 'Visualizza i progressi dei tuoi clienti',
      icon: 'analytics',
      color: '#9C27B0'
    }
  ];

  const clientFeatures = [
    {
      id: 'my-workouts',
      title: 'I Miei Allenamenti',
      description: 'Visualizza i tuoi programmi di allenamento',
      icon: 'fitness',
      color: '#4CAF50'
    },
    {
      id: 'progress',
      title: 'I Miei Progressi',
      description: 'Traccia i tuoi risultati e miglioramenti',
      icon: 'trending-up',
      color: '#2196F3'
    },
    {
      id: 'chat',
      title: 'Chat con Coach',
      description: 'Comunica direttamente con il tuo coach',
      icon: 'chatbubbles',
      color: '#FF9800'
    },
    {
      id: 'nutrition',
      title: 'Nutrizione',
      description: 'Consigli e piani alimentari personalizzati',
      icon: 'nutrition',
      color: '#9C27B0'
    }
  ];

  const features = isCoach ? coachFeatures : clientFeatures;
  const roleTitle = isCoach ? 'Coach Dashboard' : 'Dashboard Cliente';
  const roleDescription = isCoach 
    ? 'Gestisci i tuoi clienti e crea programmi personalizzati'
    : 'Accedi ai tuoi allenamenti e monitora i progressi';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header con ruolo */}
      <View style={styles.header}>
        <View style={styles.roleContainer}>
          <View style={[styles.roleIcon, { backgroundColor: isCoach ? '#4CAF50' : '#2196F3' }]}>
            <Ionicons 
              name={isCoach ? 'shield-checkmark' : 'person'} 
              size={24} 
              color="white" 
            />
          </View>
          <View style={styles.roleInfo}>
            <Text style={styles.roleTitle}>{roleTitle}</Text>
            <Text style={styles.roleDescription}>{roleDescription}</Text>
            <Text style={styles.userName}>Benvenuto, {user.name}!</Text>
          </View>
        </View>
      </View>

      {/* Funzionalità disponibili */}
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Funzionalità Disponibili</Text>
        
        {features.map((feature) => (
          <TouchableOpacity
            key={feature.id}
            style={styles.featureCard}
            onPress={() => onNavigate(feature.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
              <Ionicons name={feature.icon as any} size={24} color="white" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Informazioni aggiuntive */}
      <View style={styles.infoContainer}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#666" />
          <Text style={styles.infoText}>
            {isCoach 
              ? 'Come coach, puoi creare programmi personalizzati e monitorare i progressi dei tuoi clienti.'
              : 'Come cliente, hai accesso ai tuoi allenamenti personalizzati e puoi comunicare direttamente con il tuo coach.'
            }
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  featuresContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 15,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    marginLeft: 10,
    lineHeight: 20,
  },
});
