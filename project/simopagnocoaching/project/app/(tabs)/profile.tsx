import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { User, Target, Settings, Info, CreditCard as Edit3, Check, X } from 'lucide-react-native';
import { UserProfile } from '@/types/food';
import { getUserProfile, saveUserProfile } from '@/utils/storage';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);

  const loadProfile = async () => {
    try {
      const userProfile = await getUserProfile();
      setProfile(userProfile);
      setEditedProfile(userProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!editedProfile) return;

    try {
      await saveUserProfile(editedProfile);
      setProfile(editedProfile);
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setEditing(false);
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          {!editing ? (
            <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
              <Edit3 size={20} color="#6B7280" />
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <X size={20} color="#EF4444" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Check size={20} color="#10B981" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Profile Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <User size={40} color="#6B7280" strokeWidth={1.5} />
          </View>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.memberSince}>
            Member since {new Date(profile.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.card}>
            <InfoRow
              label="Name"
              value={editing ? undefined : profile.name}
              editing={editing}
              onChangeText={(text) => 
                setEditedProfile(prev => prev ? { ...prev, name: text } : null)
              }
              editValue={editedProfile?.name || ''}
            />
            <InfoRow
              label="Age"
              value={editing ? undefined : (profile.age?.toString() || 'Not set')}
              editing={editing}
              onChangeText={(text) => 
                setEditedProfile(prev => prev ? { ...prev, age: parseInt(text) || undefined } : null)
              }
              editValue={editedProfile?.age?.toString() || ''}
              keyboardType="numeric"
            />
            <InfoRow
              label="Weight (kg)"
              value={editing ? undefined : (profile.weight?.toString() || 'Not set')}
              editing={editing}
              onChangeText={(text) => 
                setEditedProfile(prev => prev ? { ...prev, weight: parseInt(text) || undefined } : null)
              }
              editValue={editedProfile?.weight?.toString() || ''}
              keyboardType="numeric"
            />
            <InfoRow
              label="Height (cm)"
              value={editing ? undefined : (profile.height?.toString() || 'Not set')}
              editing={editing}
              onChangeText={(text) => 
                setEditedProfile(prev => prev ? { ...prev, height: parseInt(text) || undefined } : null)
              }
              editValue={editedProfile?.height?.toString() || ''}
              keyboardType="numeric"
              isLast
            />
          </View>
        </View>

        {/* Activity Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Level</Text>
          <View style={styles.card}>
            <Text style={styles.activityLevel}>
              {profile.activityLevel.charAt(0).toUpperCase() + profile.activityLevel.slice(1).replace('_', ' ')}
            </Text>
          </View>
        </View>

        {/* Daily Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Goals</Text>
          <View style={styles.goalsGrid}>
            <GoalCard
              label="Calories"
              value={profile.goals.calories}
              color="#F59E0B"
              editing={editing}
              onChangeText={(text) => 
                setEditedProfile(prev => prev ? { 
                  ...prev, 
                  goals: { ...prev.goals, calories: parseInt(text) || 0 }
                } : null)
              }
              editValue={editedProfile?.goals.calories.toString() || ''}
            />
            <GoalCard
              label="Protein (g)"
              value={profile.goals.protein}
              color="#EF4444"
              editing={editing}
              onChangeText={(text) => 
                setEditedProfile(prev => prev ? { 
                  ...prev, 
                  goals: { ...prev.goals, protein: parseInt(text) || 0 }
                } : null)
              }
              editValue={editedProfile?.goals.protein.toString() || ''}
            />
            <GoalCard
              label="Sugar (g)"
              value={profile.goals.sugar}
              color="#8B5CF6"
              editing={editing}
              onChangeText={(text) => 
                setEditedProfile(prev => prev ? { 
                  ...prev, 
                  goals: { ...prev.goals, sugar: parseInt(text) || 0 }
                } : null)
              }
              editValue={editedProfile?.goals.sugar.toString() || ''}
            />
            <GoalCard
              label="Fat (g)"
              value={profile.goals.fat}
              color="#06B6D4"
              editing={editing}
              onChangeText={(text) => 
                setEditedProfile(prev => prev ? { 
                  ...prev, 
                  goals: { ...prev.goals, fat: parseInt(text) || 0 }
                } : null)
              }
              editValue={editedProfile?.goals.fat.toString() || ''}
            />
          </View>
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Info size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>FoodLens</Text>
                <Text style={styles.infoSubtitle}>
                  AI-powered nutrition tracking through photo analysis
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, editing, onChangeText, editValue, keyboardType, isLast }: any) {
  return (
    <View style={[styles.infoRow, !isLast && styles.infoRowBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      {editing ? (
        <TextInput
          style={styles.infoInput}
          value={editValue}
          onChangeText={onChangeText}
          keyboardType={keyboardType || 'default'}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      ) : (
        <Text style={styles.infoValue}>{value}</Text>
      )}
    </View>
  );
}

function GoalCard({ label, value, color, editing, onChangeText, editValue }: any) {
  return (
    <View style={styles.goalCard}>
      <Text style={styles.goalLabel}>{label}</Text>
      {editing ? (
        <TextInput
          style={[styles.goalInput, { borderColor: color }]}
          value={editValue}
          onChangeText={onChangeText}
          keyboardType="numeric"
          textAlign="center"
        />
      ) : (
        <Text style={[styles.goalValue, { color }]}>{value}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  editButton: {
    padding: 8,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    padding: 8,
  },
  saveButton: {
    padding: 8,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#111827',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  infoInput: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 120,
  },
  activityLevel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
    textAlign: 'center',
    paddingVertical: 8,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  goalLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 8,
  },
  goalValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  goalInput: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 80,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 2,
  },
  infoSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
});