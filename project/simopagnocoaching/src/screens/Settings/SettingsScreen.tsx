import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useI18n, LANGUAGES } from '../../context/I18nContext';
import HeaderLogo from '../../components/common/HeaderLogo';

const SettingsScreen = () => {
  const { theme, themeType, setThemeType, isDarkMode } = useTheme();
  const { t, locale, setLocale } = useI18n();
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const themeOptions = [
    { id: 'light', label: t('light'), icon: 'sunny' },
    { id: 'dark', label: t('dark'), icon: 'moon' },
    { id: 'system', label: t('system'), icon: 'phone-portrait' },
  ];

  const languageOptions = [
    { id: LANGUAGES.IT, label: 'Italiano', flag: '🇮🇹' },
    { id: LANGUAGES.EN, label: 'English', flag: '🇬🇧' },
  ];

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <HeaderLogo />
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
            {t('settings')}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
            {t('theme')}
          </Text>
          <View style={styles.optionsContainer}>
            {themeOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  themeType === option.id && styles.selectedOption,
                  { 
                    backgroundColor: themeType === option.id ? theme.colors.primary : theme.colors.surface,
                    borderColor: theme.colors.border
                  }
                ]}
                onPress={() => setThemeType(option.id)}
              >
                <Ionicons 
                  name={option.icon} 
                  size={24} 
                  color={themeType === option.id ? theme.colors.white : theme.colors.text} 
                />
                <Text 
                  style={[
                    styles.optionText, 
                    { 
                      color: themeType === option.id ? theme.colors.white : theme.colors.text,
                      fontFamily: theme.fonts.medium
                    }
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
            {t('language')}
          </Text>
          <View style={styles.optionsContainer}>
            {languageOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  locale === option.id && styles.selectedOption,
                  { 
                    backgroundColor: locale === option.id ? theme.colors.primary : theme.colors.surface,
                    borderColor: theme.colors.border
                  }
                ]}
                onPress={() => setLocale(option.id)}
              >
                <Text style={styles.flagText}>{option.flag}</Text>
                <Text 
                  style={[
                    styles.optionText, 
                    { 
                      color: locale === option.id ? theme.colors.white : theme.colors.text,
                      fontFamily: theme.fonts.medium
                    }
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
            Info
          </Text>
          <View style={styles.infoContainer}>
            <Text style={[styles.infoText, { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular }]}>
              Simone Pagnottoni Coaching
            </Text>
            <Text style={[styles.infoText, { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular }]}>
              Version 1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    marginBottom: 10,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    padding: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    marginBottom: 8,
    borderWidth: 1,
    minWidth: 100,
  },
  selectedOption: {
    borderWidth: 0,
  },
  optionText: {
    marginLeft: 8,
    fontSize: 16,
  },
  flagText: {
    fontSize: 20,
  },
  infoContainer: {
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
});

export default SettingsScreen; 