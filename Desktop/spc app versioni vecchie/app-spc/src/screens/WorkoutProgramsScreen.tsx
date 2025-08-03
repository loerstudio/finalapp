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
import { WorkoutService } from '../services/workout';
import { AuthService } from '../services/auth';
import { WorkoutProgram, User } from '../types';

interface WorkoutProgramsScreenProps {
  navigation: any;
}

export default function WorkoutProgramsScreen({ navigation }: WorkoutProgramsScreenProps) {
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get current user
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);

      if (user?.role === 'coach') {
        // Load coach's programs and clients
        const [programsResponse, clientsResponse] = await Promise.all([
          WorkoutService.getCoachPrograms(),
          AuthService.getCoachClients(),
        ]);

        if (programsResponse.success) {
          setPrograms(programsResponse.data || []);
        }

        if (clientsResponse.success) {
          setClients(clientsResponse.data || []);
        }
      } else if (user?.role === 'client') {
        // Load client's programs
        const programsResponse = await WorkoutService.getClientPrograms();
        if (programsResponse.success) {
          setPrograms(programsResponse.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Errore', 'Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCreateProgram = () => {
    if (clients.length === 0) {
      Alert.alert(
        'Nessun Cliente',
        'Devi avere almeno un cliente per creare un programma. Vuoi crearne uno ora?',
        [
          { text: 'Annulla', style: 'cancel' },
          { text: 'Crea Cliente', onPress: () => navigation.navigate('CreateClient') }
        ]
      );
      return;
    }
    navigation.navigate('CreateWorkoutProgram', { clients });
  };

  const handleProgramPress = (program: WorkoutProgram) => {
    navigation.navigate('ProgramDetails', { programId: program.id });
  };

  const handleStartWorkout = (program: WorkoutProgram) => {
    navigation.navigate('LiveWorkout', { programId: program.id });
  };

  const renderCoachView = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Programmi Allenamento</Text>
          <Text style={styles.subtitle}>
            {programs.length} programmi per {clients.length} clienti
          </Text>
        </View>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateProgram}>
          <Text style={styles.createButtonText}>+ Nuovo</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{programs.length}</Text>
          <Text style={styles.statLabel}>Programmi Attivi</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{clients.length}</Text>
          <Text style={styles.statLabel}>Clienti</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {programs.filter(p => p.is_active).length}
          </Text>
          <Text style={styles.statLabel}>In Corso</Text>
        </View>
      </View>

      {/* Programs List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>I Tuoi Programmi</Text>
        
        {programs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Nessun Programma</Text>
            <Text style={styles.emptyStateText}>
              Inizia creando il tuo primo programma di allenamento
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={handleCreateProgram}>
              <Text style={styles.emptyStateButtonText}>Crea Primo Programma</Text>
            </TouchableOpacity>
          </View>
        ) : (
          programs.map((program) => (
            <TouchableOpacity
              key={program.id}
              style={styles.programCard}
              onPress={() => handleProgramPress(program)}
            >
              <View style={styles.programHeader}>
                <View style={styles.programInfo}>
                  <Text style={styles.programName}>{program.name}</Text>
                  <Text style={styles.programClient}>
                    Cliente: {(program as any).client?.first_name} {(program as any).client?.last_name}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  program.is_active ? styles.statusActive : styles.statusInactive
                ]}>
                  <Text style={[
                    styles.statusText,
                    program.is_active ? styles.statusTextActive : styles.statusTextInactive
                  ]}>
                    {program.is_active ? 'Attivo' : 'Inattivo'}
                  </Text>
                </View>
              </View>
              
              {program.description && (
                <Text style={styles.programDescription} numberOfLines={2}>
                  {program.description}
                </Text>
              )}
              
              <View style={styles.programFooter}>
                <Text style={styles.programDate}>
                  Creato: {new Date(program.created_at).toLocaleDateString('it-IT')}
                </Text>
                <TouchableOpacity style={styles.viewButton}>
                  <Text style={styles.viewButtonText}>Visualizza →</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </>
  );

  const renderClientView = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>I Tuoi Programmi</Text>
          <Text style={styles.subtitle}>
            {programs.length} programmi di allenamento
          </Text>
        </View>
      </View>

      {/* Programs List */}
      <View style={styles.section}>
        {programs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Nessun Programma</Text>
            <Text style={styles.emptyStateText}>
              Il tuo coach non ti ha ancora assegnato un programma di allenamento
            </Text>
          </View>
        ) : (
          programs.map((program) => (
            <TouchableOpacity
              key={program.id}
              style={styles.programCard}
              onPress={() => handleProgramPress(program)}
            >
              <View style={styles.programHeader}>
                <View style={styles.programInfo}>
                  <Text style={styles.programName}>{program.name}</Text>
                  <Text style={styles.programClient}>
                    Coach: {(program as any).coach?.first_name} {(program as any).coach?.last_name}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.startWorkoutButton}
                  onPress={() => handleStartWorkout(program)}
                >
                  <Text style={styles.startWorkoutText}>▶ Inizia</Text>
                </TouchableOpacity>
              </View>
              
              {program.description && (
                <Text style={styles.programDescription} numberOfLines={2}>
                  {program.description}
                </Text>
              )}
              
              <View style={styles.programFooter}>
                <Text style={styles.programDate}>
                  Assegnato: {new Date(program.created_at).toLocaleDateString('it-IT')}
                </Text>
                <TouchableOpacity style={styles.viewButton}>
                  <Text style={styles.viewButtonText}>Dettagli →</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Caricamento programmi...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {currentUser?.role === 'coach' ? renderCoachView() : renderClientView()}
        
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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.text,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
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
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  programCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  programInfo: {
    flex: 1,
    marginRight: 12,
  },
  programName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  programClient: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: Colors.success + '20',
  },
  statusInactive: {
    backgroundColor: Colors.textSecondary + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextActive: {
    color: Colors.success,
  },
  statusTextInactive: {
    color: Colors.textSecondary,
  },
  startWorkoutButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  startWorkoutText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  programDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  programFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  programDate: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  viewButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});