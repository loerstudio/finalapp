import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import HeaderLogo from '../../components/common/HeaderLogo';

const DataScreen = () => {
  const { theme } = useTheme();
  const { t } = useI18n();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <HeaderLogo />
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
          {t('data')}
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.placeholder, { color: theme.colors.textSecondary }]}>
          Data and analytics will be displayed here
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    marginBottom: 10,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    fontSize: 16,
    fontStyle: 'italic',
  },
});

export default DataScreen; 