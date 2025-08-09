import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Clock, CreditCard as Edit3 } from 'lucide-react-native';
import { Meal } from '@/types/food';
import { formatTime } from '@/utils/dateUtils';

interface MealCardProps {
  meal: Meal;
  onEdit?: () => void;
}

export default function MealCard({ meal, onEdit }: MealCardProps) {
  const getMealTypeColor = (type: string) => {
    switch (type) {
      case 'breakfast': return '#F59E0B';
      case 'lunch': return '#10B981';
      case 'dinner': return '#8B5CF6';
      case 'snack': return '#06B6D4';
      default: return '#6B7280';
    }
  };

  const getMealTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.mealInfo}>
          <View style={[styles.mealTypeDot, { backgroundColor: getMealTypeColor(meal.type) }]} />
          <Text style={styles.mealType}>{getMealTypeLabel(meal.type)}</Text>
          <View style={styles.timeContainer}>
            <Clock size={12} color="#9CA3AF" />
            <Text style={styles.time}>{formatTime(meal.timestamp)}</Text>
          </View>
        </View>
        {onEdit && (
          <TouchableOpacity style={styles.editButton} onPress={onEdit}>
            <Edit3 size={16} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {meal.imageUri && (
        <Image source={{ uri: meal.imageUri }} style={styles.mealImage} />
      )}

      <View style={styles.foodList}>
        {meal.foods.map((food, index) => (
          <View key={food.id} style={styles.foodItem}>
            <Text style={styles.foodName}>{food.name}</Text>
            <Text style={styles.foodQuantity}>{food.quantity}</Text>
          </View>
        ))}
      </View>

      <View style={styles.nutrition}>
        <NutritionItem 
          label="Cal" 
          value={Math.round(meal.totalNutrition.calories)} 
          color="#F59E0B" 
        />
        <NutritionItem 
          label="Protein" 
          value={Math.round(meal.totalNutrition.protein)} 
          unit="g"
          color="#EF4444" 
        />
        <NutritionItem 
          label="Sugar" 
          value={Math.round(meal.totalNutrition.sugar)} 
          unit="g"
          color="#8B5CF6" 
        />
        <NutritionItem 
          label="Fat" 
          value={Math.round(meal.totalNutrition.fat)} 
          unit="g"
          color="#06B6D4" 
        />
      </View>
    </View>
  );
}

function NutritionItem({ label, value, unit = '', color }: any) {
  return (
    <View style={styles.nutritionItem}>
      <Text style={[styles.nutritionValue, { color }]}>
        {value}{unit}
      </Text>
      <Text style={styles.nutritionLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mealTypeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  mealType: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginRight: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  editButton: {
    padding: 4,
  },
  mealImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
  },
  foodList: {
    marginBottom: 16,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  foodName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#111827',
    flex: 1,
  },
  foodQuantity: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  nutrition: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  nutritionLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
});