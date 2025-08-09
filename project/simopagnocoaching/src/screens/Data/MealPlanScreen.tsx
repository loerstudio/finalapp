import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

const DAYS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

type MealType = {
  [key: string]: string;
};

type MealPlanType = {
  [key: string]: MealType;
};

const MEAL_PLAN: MealPlanType = {
  'Lunedì': {
    'Colazione': 'Porridge di avena con frutta fresca e noci',
    'Spuntino': 'Yogurt greco con miele',
    'Pranzo': 'Insalata di pollo con verdure miste',
    'Merenda': 'Una mela e 10g di mandorle',
    'Cena': 'Salmone al forno con patate dolci e broccoli'
  },
  'Martedì': {
    'Colazione': 'Frullato proteico con banana e latte di mandorla',
    'Spuntino': 'Una pera',
    'Pranzo': 'Pasta integrale con ragù di lenticchie',
    'Merenda': 'Barretta proteica',
    'Cena': 'Petto di tacchino con quinoa e verdure grigliate'
  },
  'Mercoledì': {
    'Colazione': 'Uova strapazzate con toast integrale',
    'Spuntino': 'Frutta secca (30g)',
    'Pranzo': 'Bowl di riso integrale con tonno e avocado',
    'Merenda': 'Yogurt greco con frutti di bosco',
    'Cena': 'Hamburger di manzo con insalata mista'
  },
  // Altri giorni hanno struttura simile
};

const MealPlanScreen = () => {
  const [activeDay, setActiveDay] = useState(DAYS[0]);

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysContainer}>
        {DAYS.map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              activeDay === day && styles.activeDayButton
            ]}
            onPress={() => setActiveDay(day)}
          >
            <Text style={[
              styles.dayText,
              activeDay === day && styles.activeDayText
            ]}>
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.mealsContainer}>
        {Object.entries(MEAL_PLAN[activeDay] || {}).map(([meal, food]) => (
          <View key={meal} style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <Ionicons 
                name={
                  meal === 'Colazione' ? 'sunny' :
                  meal === 'Pranzo' ? 'restaurant' :
                  meal === 'Cena' ? 'moon' : 'nutrition'
                } 
                size={24} 
                color={theme.colors.primary} 
              />
              <Text style={styles.mealTitle}>{meal}</Text>
            </View>
            <Text style={styles.mealContent}>{food}</Text>
          </View>
        ))}

        <TouchableOpacity style={styles.notesButton}>
          <Text style={styles.notesButtonText}>Note del Coach</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.white} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  daysContainer: {
    flexGrow: 0,
    backgroundColor: theme.colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  dayButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeDayButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dayText: {
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
  },
  activeDayText: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.white,
  },
  mealsContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  mealCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: 15,
    marginBottom: 15,
    ...theme.shadows.small,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  mealTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fonts.size.lg,
    color: theme.colors.text,
    marginLeft: 10,
  },
  mealContent: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fonts.size.md,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  notesButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginVertical: 20,
  },
  notesButtonText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.bold,
    fontSize: theme.fonts.size.md,
    marginRight: 5,
  },
});

export default MealPlanScreen; 