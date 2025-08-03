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

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>SPC Fitness</Text>
          <Text style={styles.subtitle}>Welcome Back!</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>💪</Text>
              <Text style={styles.actionTitle}>Start Workout</Text>
              <Text style={styles.actionSubtitle}>Begin today's session</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📱</Text>
              <Text style={styles.actionTitle}>Chat Coach</Text>
              <Text style={styles.actionSubtitle}>Get guidance</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>🍎</Text>
              <Text style={styles.actionTitle}>Log Nutrition</Text>
              <Text style={styles.actionSubtitle}>Track your meals</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionTitle}>View Progress</Text>
              <Text style={styles.actionSubtitle}>Check your stats</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('QRCode')}
            >
              <Text style={styles.actionIcon}>📱</Text>
              <Text style={styles.actionTitle}>QR Code</Text>
              <Text style={styles.actionSubtitle}>Scan & Generate</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>2</Text>
                <Text style={styles.summaryLabel}>Workouts Left</Text>
              </View>
              
              <View style={styles.summaryDivider} />
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>1,847</Text>
                <Text style={styles.summaryLabel}>Calories Goal</Text>
              </View>
              
              <View style={styles.summaryDivider} />
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>8</Text>
                <Text style={styles.summaryLabel}>Hours Sleep</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityEmoji}>🏋️</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Upper Body Workout</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
              <View style={styles.activityBadge}>
                <Text style={styles.activityBadgeText}>Completed</Text>
              </View>
            </View>
            
            <View style={styles.activityDivider} />
            
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityEmoji}>🥗</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Lunch Logged</Text>
                <Text style={styles.activityTime}>4 hours ago</Text>
              </View>
              <View style={[styles.activityBadge, { backgroundColor: Colors.info }]}>
                <Text style={styles.activityBadgeText}>Tracked</Text>
              </View>
            </View>
            
            <View style={styles.activityDivider} />
            
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityEmoji}>💬</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Coach Message</Text>
                <Text style={styles.activityTime}>6 hours ago</Text>
              </View>
              <View style={[styles.activityBadge, { backgroundColor: Colors.warning }]}>
                <Text style={styles.activityBadgeText}>New</Text>
              </View>
            </View>
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
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '600',
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
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  summaryDivider: {
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
    fontSize: 16,
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
  bottomPadding: {
    height: 40,
  },
});