import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Colors } from '../constants/colors';

interface WorkoutScreenProps {
  navigation: any;
}

export default function WorkoutScreen({ navigation }: WorkoutScreenProps) {
  const workouts = [
    {
      id: 1,
      name: 'Upper Body Strength',
      duration: '45 min',
      exercises: 8,
      difficulty: 'Intermediate',
      status: 'ready',
    },
    {
      id: 2,
      name: 'Lower Body Power',
      duration: '50 min',
      exercises: 10,
      difficulty: 'Advanced',
      status: 'completed',
    },
    {
      id: 3,
      name: 'Core & Cardio',
      duration: '30 min',
      exercises: 6,
      difficulty: 'Beginner',
      status: 'ready',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return Colors.success;
      case 'ready':
        return Colors.primary;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'ready':
        return 'Start Workout';
      default:
        return 'Not Available';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Workouts</Text>
        <Text style={styles.headerSubtitle}>Your personalized training plans</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Workout</Text>
          
          <View style={styles.todayCard}>
            <View style={styles.todayHeader}>
              <Text style={styles.todayTitle}>Upper Body Strength</Text>
              <View style={styles.difficultyBadge}>
                <Text style={styles.difficultyText}>Intermediate</Text>
              </View>
            </View>
            
            <View style={styles.todayStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>45</Text>
                <Text style={styles.statLabel}>Minutes</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>8</Text>
                <Text style={styles.statLabel}>Exercises</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>3</Text>
                <Text style={styles.statLabel}>Sets Each</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.startButton}>
              <Text style={styles.startButtonText}>Start Workout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Workouts</Text>
          
          {workouts.map((workout) => (
            <View key={workout.id} style={styles.workoutCard}>
              <View style={styles.workoutHeader}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(workout.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(workout.status)}</Text>
                </View>
              </View>
              
              <View style={styles.workoutDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>⏱️</Text>
                  <Text style={styles.detailText}>{workout.duration}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>💪</Text>
                  <Text style={styles.detailText}>{workout.exercises} exercises</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>📊</Text>
                  <Text style={styles.detailText}>{workout.difficulty}</Text>
                </View>
              </View>
              
              <View style={styles.workoutActions}>
                <TouchableOpacity style={styles.viewButton}>
                  <Text style={styles.viewButtonText}>View Details</Text>
                </TouchableOpacity>
                
                {workout.status === 'ready' && (
                  <TouchableOpacity style={styles.startMiniButton}>
                    <Text style={styles.startMiniButtonText}>Start</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
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
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    marginTop: 24,
  },
  todayCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  todayTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  difficultyBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  todayStats: {
    flexDirection: 'row',
    marginBottom: 24,
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
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  startButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  workoutCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  workoutDetails: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  workoutActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewButton: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  startMiniButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  startMiniButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  bottomPadding: {
    height: 40,
  },
});