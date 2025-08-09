import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WeightEntry {
  date: string;
  weight: number;
}

interface FoodEntry {
  name: string;
  calories: number;
  date: string;
}

interface UserDataContextType {
  weightEntries: WeightEntry[];
  foodEntries: FoodEntry[];
  todayFoods: FoodEntry[];
  addWeightEntry: (weight: number) => Promise<void>;
  addFoodEntry: (food: { name: string; calories: number }) => Promise<void>;
  getWeightHistory: () => WeightEntry[];
}

export const UserDataContext = createContext<UserDataContextType>({
  weightEntries: [],
  foodEntries: [],
  todayFoods: [],
  addWeightEntry: async () => {},
  addFoodEntry: async () => {},
  getWeightHistory: () => [],
});

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const weights = await AsyncStorage.getItem('weightEntries');
      const foods = await AsyncStorage.getItem('foodEntries');
      
      if (weights) setWeightEntries(JSON.parse(weights));
      if (foods) setFoodEntries(JSON.parse(foods));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const addWeightEntry = async (weight: number) => {
    const newEntry: WeightEntry = {
      date: new Date().toISOString().split('T')[0],
      weight,
    };
    
    const updatedEntries = [...weightEntries, newEntry];
    setWeightEntries(updatedEntries);
    await AsyncStorage.setItem('weightEntries', JSON.stringify(updatedEntries));
  };

  const addFoodEntry = async (food: { name: string; calories: number }) => {
    const newEntry: FoodEntry = {
      ...food,
      date: new Date().toISOString().split('T')[0],
    };
    
    const updatedEntries = [...foodEntries, newEntry];
    setFoodEntries(updatedEntries);
    await AsyncStorage.setItem('foodEntries', JSON.stringify(updatedEntries));
  };

  const todayFoods = foodEntries.filter(
    food => food.date === new Date().toISOString().split('T')[0]
  );

  const getWeightHistory = () => weightEntries;

  return (
    <UserDataContext.Provider value={{
      weightEntries,
      foodEntries,
      todayFoods,
      addWeightEntry,
      addFoodEntry,
      getWeightHistory,
    }}>
      {children}
    </UserDataContext.Provider>
  );
}; 