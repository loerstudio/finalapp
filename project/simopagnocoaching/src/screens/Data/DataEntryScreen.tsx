import React, { useState, useContext } from 'react';
import { Alert } from 'react-native';
import styled from 'styled-components/native';
import { UserDataContext } from '../../context/UserDataContext';
import { theme } from '../../styles/theme';

const Container = styled.ScrollView`
  flex: 1;
  background-color: ${theme.colors.background};
  padding: ${theme.spacing.md}px;
`;

const SectionTitle = styled.Text`
  font-size: ${theme.fonts.size.xl}px;
  font-family: ${theme.fonts.bold};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.md}px;
`;

const Input = styled.TextInput`
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium}px;
  padding: ${theme.spacing.md}px;
  margin-bottom: ${theme.spacing.md}px;
  font-size: ${theme.fonts.size.md}px;
  font-family: ${theme.fonts.regular};
`;

const SaveButton = styled.TouchableOpacity`
  background-color: ${theme.colors.primary};
  padding: ${theme.spacing.lg}px;
  border-radius: ${theme.borderRadius.medium}px;
  align-items: center;
  margin-bottom: ${theme.spacing.xl}px;
`;

const ButtonText = styled.Text`
  color: white;
  font-size: ${theme.fonts.size.lg}px;
  font-family: ${theme.fonts.bold};
`;

const FoodItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.sm}px;
  border-bottom-width: 1px;
  border-bottom-color: ${theme.colors.border};
`;

const FoodText = styled.Text`
  font-size: ${theme.fonts.size.md}px;
  color: ${theme.colors.text};
  font-family: ${theme.fonts.regular};
`;

const CaloriesText = styled.Text`
  font-size: ${theme.fonts.size.sm}px;
  color: ${theme.colors.textSecondary};
  font-family: ${theme.fonts.regular};
`;

export default function DataEntryScreen() {
  const [weight, setWeight] = useState('');
  const [foodName, setFoodName] = useState('');
  const [foodCalories, setFoodCalories] = useState('');
  const { addWeightEntry, addFoodEntry, todayFoods } = useContext(UserDataContext);

  const handleSaveWeight = async () => {
    if (!weight.trim()) {
      Alert.alert('Errore', 'Inserisci il peso');
      return;
    }

    try {
      await addWeightEntry(parseFloat(weight));
      Alert.alert('Successo', 'Peso salvato!');
      setWeight('');
    } catch (error) {
      Alert.alert('Errore', 'Errore nel salvataggio');
    }
  };

  const handleAddFood = async () => {
    if (!foodName.trim() || !foodCalories.trim()) {
      Alert.alert('Errore', 'Inserisci nome e calorie');
      return;
    }

    try {
      await addFoodEntry({
        name: foodName.trim(),
        calories: parseInt(foodCalories),
      });
      setFoodName('');
      setFoodCalories('');
    } catch (error) {
      Alert.alert('Errore', 'Errore nel salvataggio');
    }
  };

  const totalCalories = todayFoods.reduce((sum, food) => sum + food.calories, 0);

  return (
    <Container>
      <SectionTitle>Peso Giornaliero</SectionTitle>
      <Input
        placeholder="Peso (kg)"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
      />
      <SaveButton onPress={handleSaveWeight}>
        <ButtonText>Salva Peso</ButtonText>
      </SaveButton>

      <SectionTitle>Alimenti Consumati</SectionTitle>
      <Input
        placeholder="Nome alimento"
        value={foodName}
        onChangeText={setFoodName}
      />
      <Input
        placeholder="Calorie"
        value={foodCalories}
        onChangeText={setFoodCalories}
        keyboardType="numeric"
      />
      <SaveButton onPress={handleAddFood}>
        <ButtonText>Aggiungi Alimento</ButtonText>
      </SaveButton>

      <SectionTitle>Oggi hai consumato: {totalCalories} cal</SectionTitle>
      {todayFoods.map((food, index) => (
        <FoodItem key={index}>
          <FoodText>{food.name}</FoodText>
          <CaloriesText>{food.calories} cal</CaloriesText>
        </FoodItem>
      ))}
    </Container>
  );
} 