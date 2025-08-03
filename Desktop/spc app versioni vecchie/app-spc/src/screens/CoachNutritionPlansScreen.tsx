import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../constants/colors';
import { NutritionPlanService } from '../services/nutritionPlan';
import { ClientService } from '../services/client';
import { NutritionPlan, User } from '../types';

interface CoachNutritionPlansScreenProps {
  navigation: any;
}

export default function CoachNutritionPlansScreen({ navigation }: CoachNutritionPlansScreenProps) {
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load nutrition plans
      const plansResponse = await NutritionPlanService.getCoachNutritionPlans();
      if (plansResponse.success && plansResponse.data) {
        setPlans(plansResponse.data);
      }

      // Load clients
      const clientsResponse = await ClientService.getCoachClients();
      if (clientsResponse.success && clientsResponse.data) {
        setClients(clientsResponse.data);
      }

    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = () => {
    if (clients.length === 0) {
      Alert.alert(
        'Nessun Cliente',
        'Devi prima creare dei clienti prima di poter creare piani nutrizionali.',
        [
          { text: 'OK' },
          { text: 'Crea Cliente', onPress: () => navigation.navigate('CreateClient') }
        ]
      );
      return;
    }
    navigation.navigate('CreateNutritionPlan');
  };

  const handleActivatePlan = async (planId: string, clientName: string) => {
    Alert.alert(
      'Attiva Piano',
      `Vuoi attivare questo piano nutrizionale per ${clientName}?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Attiva',
          onPress: async () => {
            const response = await NutritionPlanService.activateNutritionPlan(planId);
            if (response.success) {
              Alert.alert('Successo', response.message);
              loadData(); // Reload data
            } else {
              Alert.alert('Errore', response.error);
            }
          }
        }
      ]
    );
  };

  const handleDeletePlan = async (planId: string, planTitle: string) => {
    Alert.alert(
      'Elimina Piano',
      `Sei sicuro di voler eliminare il piano "${planTitle}"?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            const response = await NutritionPlanService.deleteNutritionPlan(planId);
            if (response.success) {
              Alert.alert('Successo', response.message);
              loadData(); // Reload data
            } else {
              Alert.alert('Errore', response.error);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const getActivePlansCount = () => {
    return plans.filter(plan => plan.is_active).length;
  };

  const getClientPlansCount = (clientId: string) => {
    return plans.filter(plan => plan.client_id === clientId).length;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Caricamento piani nutrizionali...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Piani Nutrizionali</Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreatePlan}>
          <Text style={styles.createButtonText}>+ Nuovo Piano</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Riepilogo</Text>
          <View style={styles.statsCard}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{plans.length}</Text>
                <Text style={styles.statLabel}>Piani Totali</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{getActivePlansCount()}</Text>
                <Text style={styles.statLabel}>Piani Attivi</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{clients.length}</Text>
                <Text style={styles.statLabel}>Clienti</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Clients Overview */}
        {clients.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>I Tuoi Clienti</Text>
            {clients.map((client) => {
              const clientPlans = plans.filter(plan => plan.client_id === client.id);
              const activePlan = clientPlans.find(plan => plan.is_active);
              
              return (
                <View key={client.id} style={styles.clientCard}>
                  <View style={styles.clientHeader}>
                    <Text style={styles.clientName}>
                      {client.first_name} {client.last_name}
                    </Text>
                    <View style={styles.clientStats}>
                      <Text style={styles.clientPlansCount}>
                        {getClientPlansCount(client.id)} piani
                      </Text>
                      {activePlan && (
                        <View style={styles.activeBadge}>
                          <Text style={styles.activeBadgeText}>ATTIVO</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  {activePlan ? (
                    <View style={styles.activePlanInfo}>
                      <Text style={styles.activePlanTitle}>{activePlan.title}</Text>
                      <Text style={styles.activePlanTarget}>
                        Target: {activePlan.target_calories} kcal/giorno
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.noActivePlan}>Nessun piano attivo</Text>
                  )}
                  
                  <View style={styles.clientActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => navigation.navigate('CreateNutritionPlan', { clientId: client.id })}
                    >
                      <Text style={styles.actionButtonText}>Crea Piano</Text>
                    </TouchableOpacity>
                    
                    {clientPlans.length > 0 && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.secondaryButton]}
                        onPress={() => navigation.navigate('ClientNutritionPlans', { 
                          clientId: client.id,
                          clientName: `${client.first_name} ${client.last_name}`
                        })}
                      >
                        <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                          Vedi Piani ({clientPlans.length})
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Recent Plans */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Piani Recenti</Text>
            {plans.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('AllNutritionPlans')}>
                <Text style={styles.seeAllText}>Vedi Tutti</Text>
              </TouchableOpacity>
            )}
          </View>

          {plans.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🍎</Text>
              <Text style={styles.emptyTitle}>Nessun Piano Nutrizionale</Text>
              <Text style={styles.emptyDescription}>
                Inizia creando il primo piano nutrizionale per i tuoi clienti.
              </Text>
              <TouchableOpacity style={styles.emptyButton} onPress={handleCreatePlan}>
                <Text style={styles.emptyButtonText}>Crea Primo Piano</Text>
              </TouchableOpacity>
            </View>
          ) : (
            plans.slice(0, 5).map((plan) => (
              <View key={plan.id} style={styles.planCard}>
                <View style={styles.planHeader}>
                  <View style={styles.planTitleContainer}>
                    <Text style={styles.planTitle}>{plan.title}</Text>
                    <Text style={styles.planClient}>
                      {plan.client?.first_name} {plan.client?.last_name}
                    </Text>
                  </View>
                  <View style={styles.planStatus}>
                    {plan.is_active && (
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>ATTIVO</Text>
                      </View>
                    )}
                  </View>
                </View>

                {plan.description && (
                  <Text style={styles.planDescription}>{plan.description}</Text>
                )}

                <View style={styles.planTargets}>
                  <View style={styles.targetItem}>
                    <Text style={styles.targetValue}>{plan.target_calories}</Text>
                    <Text style={styles.targetLabel}>kcal</Text>
                  </View>
                  <View style={styles.targetItem}>
                    <Text style={styles.targetValue}>{plan.target_protein}g</Text>
                    <Text style={styles.targetLabel}>Proteine</Text>
                  </View>
                  <View style={styles.targetItem}>
                    <Text style={styles.targetValue}>{plan.target_carbs}g</Text>
                    <Text style={styles.targetLabel}>Carboidrati</Text>
                  </View>
                  <View style={styles.targetItem}>
                    <Text style={styles.targetValue}>{plan.target_fats}g</Text>
                    <Text style={styles.targetLabel}>Grassi</Text>
                  </View>
                </View>

                <View style={styles.planFooter}>
                  <Text style={styles.planDate}>
                    Creato: {formatDate(plan.created_at)}
                  </Text>
                  <View style={styles.planActions}>
                    <TouchableOpacity
                      style={styles.actionIcon}
                      onPress={() => navigation.navigate('NutritionPlanDetail', { planId: plan.id })}
                    >
                      <Text style={styles.actionIconText}>👁️</Text>
                    </TouchableOpacity>
                    
                    {!plan.is_active && (
                      <TouchableOpacity
                        style={styles.actionIcon}
                        onPress={() => handleActivatePlan(
                          plan.id, 
                          `${plan.client?.first_name} ${plan.client?.last_name}`
                        )}
                      >
                        <Text style={styles.actionIconText}>✅</Text>
                      </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity
                      style={styles.actionIcon}
                      onPress={() => navigation.navigate('EditNutritionPlan', { planId: plan.id })}
                    >
                      <Text style={styles.actionIconText}>✏️</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.actionIcon}
                      onPress={() => handleDeletePlan(plan.id, plan.title)}
                    >
                      <Text style={[styles.actionIconText, { color: Colors.error }]}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginTop: 12,
  },
  section: {
    margin: 20,
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
  },
  seeAllText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  clientCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  clientStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clientPlansCount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  activeBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: Colors.text,
  },
  activePlanInfo: {
    marginBottom: 12,
  },
  activePlanTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  activePlanTarget: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  noActivePlan: {
    fontSize: 14,
    color: Colors.textTertiary,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  clientActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: Colors.textSecondary,
  },
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  planTitleContainer: {
    flex: 1,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  planClient: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  planStatus: {
    alignItems: 'flex-end',
  },
  planDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  planTargets: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  targetItem: {
    alignItems: 'center',
  },
  targetValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
  },
  targetLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  planFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planDate: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  planActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIcon: {
    padding: 4,
  },
  actionIconText: {
    fontSize: 16,
  },
  emptyState: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
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
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: Colors.text,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});