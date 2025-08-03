import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import { Colors } from '../constants/colors';
import { AuthService } from '../services/auth';
import { User } from '../types';

interface ClientManagementScreenProps {
  navigation: any;
}

export default function ClientManagementScreen({ navigation }: ClientManagementScreenProps) {
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await AuthService.getCoachClients();
      if (response.success && response.data) {
        setClients(response.data);
      } else {
        Alert.alert('Errore', response.error || 'Errore nel caricamento clienti');
      }
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Errore nel caricamento clienti');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadClients();
    setRefreshing(false);
  };

  const handleCreateClient = () => {
    navigation.navigate('CreateClient');
  };

  const handleClientPress = (client: User) => {
    navigation.navigate('ClientDetail', { clientId: client.id });
  };

  const getSubscriptionBadgeColor = (subscriptionType?: string) => {
    switch (subscriptionType) {
      case 'premium':
        return Colors.warning;
      case 'basic':
        return Colors.info;
      default:
        return Colors.textSecondary;
    }
  };

  const getSubscriptionText = (subscriptionType?: string) => {
    switch (subscriptionType) {
      case 'premium':
        return 'Premium';
      case 'basic':
        return 'Basic';
      default:
        return 'No Plan';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading clients...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Client Management</Text>
        <Text style={styles.headerSubtitle}>
          Gestisci i tuoi clienti e i loro programmi
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          
          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{clients.length}</Text>
                <Text style={styles.statLabel}>Total Clients</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {clients.filter(c => c.subscription_type === 'premium').length}
                </Text>
                <Text style={styles.statLabel}>Premium</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {clients.filter(c => c.has_nutrition_plan).length}
                </Text>
                <Text style={styles.statLabel}>With Nutrition</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={handleCreateClient}
            >
              <Text style={styles.actionIcon}>👤</Text>
              <Text style={styles.actionTitle}>New Client</Text>
              <Text style={styles.actionSubtitle}>Add new client</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('WorkoutPrograms')}
            >
              <Text style={styles.actionIcon}>💪</Text>
              <Text style={styles.actionTitle}>Workouts</Text>
              <Text style={styles.actionSubtitle}>Manage programs</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('NutritionPlans')}
            >
              <Text style={styles.actionIcon}>🍎</Text>
              <Text style={styles.actionTitle}>Nutrition</Text>
              <Text style={styles.actionSubtitle}>Meal plans</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('ClientProgress')}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionTitle}>Progress</Text>
              <Text style={styles.actionSubtitle}>Track results</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Clients List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Clients</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleCreateClient}
            >
              <Text style={styles.addButtonText}>+ Add Client</Text>
            </TouchableOpacity>
          </View>
          
          {clients.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>No clients yet</Text>
              <Text style={styles.emptySubtitle}>
                Start by adding your first client to begin creating workout and nutrition programs.
              </Text>
              
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={handleCreateClient}
              >
                <Text style={styles.emptyButtonText}>Create First Client</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.clientsList}>
              {clients.map((client) => (
                <TouchableOpacity
                  key={client.id}
                  style={styles.clientCard}
                  onPress={() => handleClientPress(client)}
                >
                  <View style={styles.clientInfo}>
                    <View style={styles.clientAvatar}>
                      <Text style={styles.clientInitials}>
                        {client.first_name.charAt(0)}{client.last_name.charAt(0)}
                      </Text>
                    </View>
                    
                    <View style={styles.clientDetails}>
                      <Text style={styles.clientName}>
                        {client.first_name} {client.last_name}
                      </Text>
                      <Text style={styles.clientEmail}>{client.email}</Text>
                      
                      <View style={styles.clientBadges}>
                        <View style={[
                          styles.badge, 
                          { backgroundColor: getSubscriptionBadgeColor(client.subscription_type) }
                        ]}>
                          <Text style={styles.badgeText}>
                            {getSubscriptionText(client.subscription_type)}
                          </Text>
                        </View>
                        
                        {client.has_nutrition_plan && (
                          <View style={[styles.badge, { backgroundColor: Colors.success }]}>
                            <Text style={styles.badgeText}>Nutrition</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  
                  <Text style={styles.clientArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 24,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    marginTop: 24,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  statsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyState: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  clientsList: {
    gap: 12,
  },
  clientCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  clientInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  clientInitials: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  clientEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  clientBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.text,
  },
  clientArrow: {
    fontSize: 20,
    color: Colors.textSecondary,
    fontWeight: '300',
  },
  bottomPadding: {
    height: 40,
  },
});