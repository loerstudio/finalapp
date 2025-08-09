import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Sei sicuro di voler uscire?',
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Esci',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              // Naviga alla schermata di login
              router.replace('/login');
            } catch (error) {
              console.error('Errore durante il logout:', error);
              Alert.alert('Errore', 'Si è verificato un errore durante il logout');
            }
          },
        },
      ]
    );
  };

  const dashboardItems = [
    {
      id: 'workouts',
      title: 'Allenamento',
      subtitle: 'I tuoi allenamenti',
      icon: 'fitness',
      color: '#8B0000',
      onPress: () => router.push('/(tabs)/workouts'),
    },
    {
      id: 'nutrition',
      title: 'Alimentazione',
      subtitle: 'Piano alimentare',
      icon: 'nutrition',
      color: '#2E8B57',
      onPress: () => router.push('/(tabs)/nutrition'),
    },
    {
      id: 'progress',
      title: 'Progressi',
      subtitle: 'Traccia i tuoi risultati',
      icon: 'trending-up',
      color: '#4169E1',
      onPress: () => router.push('/(tabs)/progress'),
    },
    {
      id: 'chat',
      title: 'Chat',
      subtitle: 'Parla con il tuo coach',
      icon: 'chatbubbles',
      color: '#FF6B35',
      onPress: () => router.push('/(tabs)/chat'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Ciao!</Text>
            <Text style={styles.userName}>
              {user?.name || user?.email || 'Atleta'}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Dashboard Grid */}
        <View style={styles.dashboardGrid}>
          {dashboardItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.dashboardItem, { backgroundColor: item.color }]}
              onPress={item.onPress}
              activeOpacity={0.8}
            >
              <View style={styles.itemContent}>
                <View style={styles.iconContainer}>
                  <Ionicons name={item.icon as any} size={32} color="white" />
                </View>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Statistiche Rapide</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Allenamenti</Text>
              <Text style={styles.statPeriod}>Questa settimana</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>85%</Text>
              <Text style={styles.statLabel}>Completamento</Text>
              <Text style={styles.statPeriod}>Obiettivi</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Giorni</Text>
              <Text style={styles.statPeriod}>Consecutivi</Text>
            </View>
          </View>
        </View>

        {/* Motivational Quote */}
        <View style={styles.quoteContainer}>
          <Text style={styles.quoteText}>
            "Il successo non è finale, il fallimento non è fatale: è il coraggio di continuare che conta."
          </Text>
          <Text style={styles.quoteAuthor}>- Winston Churchill</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Spazio extra per il bottom tab
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  userName: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
  },
  logoutButton: {
    padding: 10,
  },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 15,
  },
  dashboardItem: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  itemContent: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 15,
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  itemSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 2,
  },
  statPeriod: {
    fontSize: 12,
    color: '#666',
  },
  quoteContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 40,
    borderRadius: 16,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quoteText: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 10,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
});
