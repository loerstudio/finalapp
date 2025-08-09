import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

// Define supported languages
export const LANGUAGES = {
  IT: 'it',
  EN: 'en',
};

// Define translations
const translations = {
  [LANGUAGES.IT]: {
    welcome: 'Benvenuto',
    home: 'Home',
    videos: 'Video',
    photos: 'Foto',
    data: 'Dati',
    settings: 'Impostazioni',
    language: 'Lingua',
    theme: 'Tema',
    dark: 'Scuro',
    light: 'Chiaro',
    system: 'Sistema',
    loading: 'Caricamento...',
    recentWorkouts: 'Allenamenti Recenti',
    yourProgress: 'Il Tuo Progresso',
    weightAndMeasurements: 'Peso e Misure',
    trackYourProgress: 'Monitora i tuoi progressi',
    mealPlan: 'Piano Alimentare',
    nutritionProgram: 'Il tuo programma nutrizionale',
    chatbotGreeting: 'Come posso aiutarti, secco?',
    chatbotPlaceholder: 'Scrivi qui...',
    chatbotSend: 'Invia',
  },
  [LANGUAGES.EN]: {
    welcome: 'Welcome',
    home: 'Home',
    videos: 'Videos',
    photos: 'Photos',
    data: 'Data',
    settings: 'Settings',
    language: 'Language',
    theme: 'Theme',
    dark: 'Dark',
    light: 'Light',
    system: 'System',
    loading: 'Loading...',
    recentWorkouts: 'Recent Workouts',
    yourProgress: 'Your Progress',
    weightAndMeasurements: 'Weight & Measurements',
    trackYourProgress: 'Track your progress',
    mealPlan: 'Meal Plan',
    nutritionProgram: 'Your nutrition program',
    chatbotGreeting: 'How can I help you?',
    chatbotPlaceholder: 'Type here...',
    chatbotSend: 'Send',
  },
};

interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
}

export const I18nContext = createContext<I18nContextType>({
  locale: LANGUAGES.IT,
  setLocale: () => {},
  t: (key) => key,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Italian, but check device locale
  const deviceLocale = Localization.locale.split('-')[0];
  const defaultLocale = Object.values(LANGUAGES).includes(deviceLocale) ? deviceLocale : LANGUAGES.IT;
  
  const [locale, setLocale] = useState(defaultLocale);

  // Load saved locale
  useEffect(() => {
    const loadLocale = async () => {
      try {
        const savedLocale = await AsyncStorage.getItem('userLocale');
        if (savedLocale && Object.values(LANGUAGES).includes(savedLocale)) {
          setLocale(savedLocale);
        }
      } catch (error) {
        console.log('Error loading locale', error);
      }
    };
    
    loadLocale();
  }, []);

  // Save locale when it changes
  useEffect(() => {
    const saveLocale = async () => {
      try {
        await AsyncStorage.setItem('userLocale', locale);
      } catch (error) {
        console.log('Error saving locale', error);
      }
    };
    
    saveLocale();
  }, [locale]);

  // Translation function
  const t = (key: string): string => {
    return translations[locale]?.[key] || translations[LANGUAGES.EN][key] || key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext); 