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

interface CoachHomeScreenProps {
  navigation: any;
}

export default function CoachHomeScreen({ navigation }: CoachHomeScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>SPC Fitness</Text>
          <Text style={styles.subtitle}>Coach Portal</Text>
          <Text style={styles.welcomeText}>Welcome Back, Coach!</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coach Dashboard</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('ClientManagement')}
            >
              <Text style={styles.actionIcon}>👥</Text>
              <Text style={styles.actionTitle}>Client Management</Text>
              <Text style={styles.actionSubtitle}>Manage your clients</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('WorkoutPrograms')}
            >
              <Text style={styles.actionIcon}>💪</Text>
              <Text style={styles.actionTitle}>Workout Programs</Text>
              <Text style={styles.actionSubtitle}>Create & edit workouts</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('NutritionPlans')}
            >
              <Text style={styles.actionIcon}>🍎</Text>
              <Text style={styles.actionTitle}>Nutrition Plans</Text>
              <Text style={styles.actionSubtitle}>Design meal plans</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('ClientProgress')}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionTitle}>Client Progress</Text>
              <Text style={styles.actionSubtitle}>Track performance</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('CoachChat')}
            >
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionTitle}>Client Messages</Text>
              <Text style={styles.actionSubtitle}>Chat with clients</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('ExerciseLibrary')}
            >
              <Text style={styles.actionIcon}>📚</Text>
              <Text style={styles.actionTitle}>Exercise Library</Text>
              <Text style={styles.actionSubtitle}>Browse exercises</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          
          <View style={styles.overviewCard}>
            <View style={styles.overviewRow}>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewNumber}>12</Text>
                <Text style={styles.overviewLabel}>Active Clients</Text>
              </View>
              
              <View style={styles.overviewDivider} />
              
              <View style={styles.overviewItem}>
                <Text style={styles.overviewNumber}>5</Text>
                <Text style={styles.overviewLabel}>New Messages</Text>
              </View>
              
              <View style={styles.overviewDivider} />
              
              <View style={styles.overviewItem}>
                <Text style={styles.overviewNumber}>8</Text>
                <Text style={styles.overviewLabel}>Scheduled Sessions</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Client Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Client Activity</Text>
          
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityEmoji}>💪</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Lorenzo completed Upper Body Workout</Text>
                <Text style={styles.activityTime}>30 minutes ago</Text>
              </View>
              <View style={styles.activityBadge}>
                <Text style={styles.activityBadgeText}>Completed</Text>
              </View>
            </View>
            
            <View style={styles.activityDivider} />
            
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityEmoji}>💬</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Maria sent a message</Text>
                <Text style={styles.activityTime}>1 hour ago</Text>
              </View>
              <View style={[styles.activityBadge, { backgroundColor: Colors.warning }]}>
                <Text style={styles.activityBadgeText}>New</Text>
              </View>
            </View>
            
            <View style={styles.activityDivider} />
            
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityEmoji}>🍎</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Alex logged nutrition data</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
              <View style={[styles.activityBadge, { backgroundColor: Colors.info }]}>
                <Text style={styles.activityBadgeText}>Logged</Text>
              </View>
            </View>
            
            <View style={styles.activityDivider} />
            
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityEmoji}>📈</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Sarah reached weight goal</Text>
                <Text style={styles.activityTime}>3 hours ago</Text>
              </View>
              <View style={[styles.activityBadge, { backgroundColor: Colors.success }]}>
                <Text style={styles.activityBadgeText}>Goal!</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Tools</Text>
          
          <View style={styles.toolsGrid}>
            <TouchableOpacity 
              style={styles.toolCard}
              onPress={() => navigation.navigate('LiveWorkout')}
            >
              <Text style={styles.toolIcon}>🎥</Text>
              <Text style={styles.toolTitle}>Live Session</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.toolCard}
              onPress={() => navigation.navigate('FoodDatabase')}
            >
              <Text style={styles.toolIcon}>🔍</Text>
              <Text style={styles.toolTitle}>Food Database</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.toolCard}>
              <Text style={styles.toolIcon}>📱</Text>
              <Text style={styles.toolTitle}>Quick Note</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.toolCard}>
              <Text style={styles.toolIcon}>📊</Text>
              <Text style={styles.toolTitle}>Reports</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Padding */}
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
  header: {
    padding: 24,
    paddingTop: 40,
    alignItems: 'center',
    backgroundColor: Colors.primary,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 20,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
    opacity: 0.9,
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
  overviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.primary,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  overviewDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  activityCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityIcon: {
    width: 48,
    height: 48,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityEmoji: {
    fontSize: 20,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  activityBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.text,
  },
  activityDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  toolCard: {
    width: '23%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  toolIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  toolTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 40,
  },
});