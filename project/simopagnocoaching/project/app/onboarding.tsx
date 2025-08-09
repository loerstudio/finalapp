import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, User, Target, ArrowRight, Check } from 'lucide-react-native';
import { saveUserProfile } from '@/utils/storage';
import { UserProfile } from '@/types/food';

const steps = [
  {
    title: 'Welcome to FoodLens',
    subtitle: 'Track your nutrition with AI-powered photo analysis',
    icon: Camera,
  },
  {
    title: 'Tell us about yourself',
    subtitle: 'Help us personalize your experience',
    icon: User,
  },
  {
    title: 'Set your goals',
    subtitle: 'What are your daily nutrition targets?',
    icon: Target,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weight: '',
    height: '',
    activityLevel: 'moderate' as const,
    calorieGoal: '2000',
    proteinGoal: '150',
    sugarGoal: '50',
    fatGoal: '65',
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    const profile: UserProfile = {
      id: 'user-' + Date.now(),
      name: formData.name,
      age: parseInt(formData.age) || undefined,
      weight: parseInt(formData.weight) || undefined,
      height: parseInt(formData.height) || undefined,
      activityLevel: formData.activityLevel,
      goals: {
        calories: parseInt(formData.calorieGoal),
        protein: parseInt(formData.proteinGoal),
        sugar: parseInt(formData.sugarGoal),
        fat: parseInt(formData.fatGoal),
      },
      createdAt: new Date().toISOString(),
    };

    await saveUserProfile(profile);
    router.replace('/(tabs)');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep />;
      case 1:
        return <PersonalInfoStep formData={formData} setFormData={setFormData} />;
      case 2:
        return <GoalsStep formData={formData} setFormData={setFormData} />;
      default:
        return null;
    }
  };

  const StepIcon = steps[currentStep].icon;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= currentStep ? styles.progressDotActive : styles.progressDotInactive,
              ]}
            />
          ))}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          <StepIcon size={60} color="#10B981" strokeWidth={1.5} />
        </View>

        <Text style={styles.title}>{steps[currentStep].title}</Text>
        <Text style={styles.subtitle}>{steps[currentStep].subtitle}</Text>

        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
          </Text>
          <ArrowRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function WelcomeStep() {
  return (
    <View style={styles.stepContent}>
      <View style={styles.featureList}>
        <FeatureItem 
          icon={Camera} 
          title="Photo Analysis" 
          description="Simply take photos of your meals for instant nutrition tracking" 
        />
        <FeatureItem 
          icon={Target} 
          title="Smart Goals" 
          description="Set personalized nutrition goals based on your lifestyle" 
        />
        <FeatureItem 
          icon={Check} 
          title="Daily Tracking" 
          description="Monitor your progress with detailed daily and weekly insights" 
        />
      </View>
    </View>
  );
}

function PersonalInfoStep({ formData, setFormData }: any) {
  return (
    <View style={styles.stepContent}>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>What's your name?</Text>
        <TextInput
          style={styles.textInput}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="Enter your name"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>Age</Text>
          <TextInput
            style={styles.textInput}
            value={formData.age}
            onChangeText={(text) => setFormData({ ...formData, age: text })}
            placeholder="25"
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>Weight (kg)</Text>
          <TextInput
            style={styles.textInput}
            value={formData.weight}
            onChangeText={(text) => setFormData({ ...formData, weight: text })}
            placeholder="70"
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Activity Level</Text>
        <View style={styles.activityButtons}>
          {[
            { key: 'sedentary', label: 'Sedentary' },
            { key: 'light', label: 'Light' },
            { key: 'moderate', label: 'Moderate' },
            { key: 'active', label: 'Active' },
          ].map((activity) => (
            <TouchableOpacity
              key={activity.key}
              style={[
                styles.activityButton,
                formData.activityLevel === activity.key && styles.activityButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, activityLevel: activity.key })}
            >
              <Text
                style={[
                  styles.activityButtonText,
                  formData.activityLevel === activity.key && styles.activityButtonTextActive,
                ]}
              >
                {activity.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

function GoalsStep({ formData, setFormData }: any) {
  return (
    <View style={styles.stepContent}>
      <View style={styles.goalGrid}>
        <GoalInput
          label="Daily Calories"
          value={formData.calorieGoal}
          onChangeText={(text) => setFormData({ ...formData, calorieGoal: text })}
          placeholder="2000"
          color="#F59E0B"
        />
        <GoalInput
          label="Protein (g)"
          value={formData.proteinGoal}
          onChangeText={(text) => setFormData({ ...formData, proteinGoal: text })}
          placeholder="150"
          color="#EF4444"
        />
        <GoalInput
          label="Sugar (g)"
          value={formData.sugarGoal}
          onChangeText={(text) => setFormData({ ...formData, sugarGoal: text })}
          placeholder="50"
          color="#8B5CF6"
        />
        <GoalInput
          label="Fat (g)"
          value={formData.fatGoal}
          onChangeText={(text) => setFormData({ ...formData, fatGoal: text })}
          placeholder="65"
          color="#06B6D4"
        />
      </View>
    </View>
  );
}

function FeatureItem({ icon: Icon, title, description }: any) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Icon size={24} color="#10B981" strokeWidth={1.5} />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

function GoalInput({ label, value, onChangeText, placeholder, color }: any) {
  return (
    <View style={styles.goalInputContainer}>
      <Text style={styles.goalLabel}>{label}</Text>
      <View style={[styles.goalInput, { borderColor: color }]}>
        <TextInput
          style={styles.goalInputText}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType="numeric"
          placeholderTextColor="#9CA3AF"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#10B981',
  },
  progressDotInactive: {
    backgroundColor: '#E5E7EB',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  stepContent: {
    paddingBottom: 40,
  },
  featureList: {
    gap: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
    marginTop: 4,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#111827',
    marginBottom: 8,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
  },
  activityButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  activityButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  activityButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  activityButtonTextActive: {
    color: '#FFFFFF',
  },
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  goalInputContainer: {
    width: '48%',
  },
  goalLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#111827',
    marginBottom: 8,
  },
  goalInput: {
    height: 48,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  goalInputText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 34,
    paddingTop: 20,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});