import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../constants/colors';
import { SupabaseTestService } from '../services/supabaseTest';

interface DebugScreenProps {
  navigation: any;
}

export default function DebugScreen({ navigation }: DebugScreenProps) {
  const [testResults, setTestResults] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    setTesting(true);
    try {
      const results = await SupabaseTestService.runAllTests();
      setTestResults(results);
    } catch (error: any) {
      Alert.alert('Test Error', error.message);
    } finally {
      setTesting(false);
    }
  };

  const getStatusColor = (success: boolean) => {
    return success ? Colors.success : Colors.error;
  };

  const getStatusIcon = (success: boolean) => {
    return success ? '✅' : '❌';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Debug Supabase</Text>
        <TouchableOpacity onPress={runTests} disabled={testing}>
          <Text style={[styles.refreshButton, testing && styles.refreshButtonDisabled]}>
            🔄 Refresh
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {testing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Running Supabase tests...</Text>
          </View>
        ) : testResults ? (
          <>
            {/* Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Test Summary</Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Passed:</Text>
                  <Text style={[styles.summaryValue, { color: Colors.success }]}>
                    {testResults.summary.passed}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Failed:</Text>
                  <Text style={[styles.summaryValue, { color: Colors.error }]}>
                    {testResults.summary.failed}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total:</Text>
                  <Text style={styles.summaryValue}>
                    {testResults.summary.total}
                  </Text>
                </View>
              </View>
            </View>

            {/* Connection Test */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {getStatusIcon(testResults.connection.success)} Database Connection
              </Text>
              <View style={[
                styles.testCard,
                { borderColor: getStatusColor(testResults.connection.success) }
              ]}>
                <Text style={[
                  styles.testStatus,
                  { color: getStatusColor(testResults.connection.success) }
                ]}>
                  {testResults.connection.success ? 'SUCCESS' : 'FAILED'}
                </Text>
                
                {testResults.connection.success ? (
                  <Text style={styles.testData}>
                    {JSON.stringify(testResults.connection.data, null, 2)}
                  </Text>
                ) : (
                  <Text style={styles.errorText}>
                    {testResults.connection.error}
                  </Text>
                )}
              </View>
            </View>

            {/* Auth Test */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {getStatusIcon(testResults.auth.success)} Authentication
              </Text>
              <View style={[
                styles.testCard,
                { borderColor: getStatusColor(testResults.auth.success) }
              ]}>
                <Text style={[
                  styles.testStatus,
                  { color: getStatusColor(testResults.auth.success) }
                ]}>
                  {testResults.auth.success ? 'SUCCESS' : 'FAILED'}
                </Text>
                
                {testResults.auth.success ? (
                  <Text style={styles.testData}>
                    {JSON.stringify(testResults.auth.data, null, 2)}
                  </Text>
                ) : (
                  <Text style={styles.errorText}>
                    {testResults.auth.error}
                  </Text>
                )}
              </View>
            </View>

            {/* Profile Test */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {getStatusIcon(testResults.profiles.success)} Profile Operations
              </Text>
              <View style={[
                styles.testCard,
                { borderColor: getStatusColor(testResults.profiles.success) }
              ]}>
                <Text style={[
                  styles.testStatus,
                  { color: getStatusColor(testResults.profiles.success) }
                ]}>
                  {testResults.profiles.success ? 'SUCCESS' : 'FAILED'}
                </Text>
                
                {testResults.profiles.success ? (
                  <Text style={styles.testData}>
                    {JSON.stringify(testResults.profiles.data, null, 2)}
                  </Text>
                ) : (
                  <Text style={styles.errorText}>
                    {testResults.profiles.error}
                  </Text>
                )}
              </View>
            </View>

            {/* Debug Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔧 Debug Information</Text>
              <View style={styles.debugCard}>
                <Text style={styles.debugText}>
                  • Check if Supabase project is running{'\n'}
                  • Verify URL and API keys{'\n'}
                  • Ensure database tables exist{'\n'}
                  • Check RLS policies{'\n'}
                  • Verify network connection
                </Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionsGrid}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => Alert.alert('Config', 'Check supabase.ts configuration')}
                >
                  <Text style={styles.actionButtonText}>Check Config</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => Alert.alert('Database', 'Verify database schema')}
                >
                  <Text style={styles.actionButtonText}>Check Schema</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => Alert.alert('RLS', 'Check Row Level Security policies')}
                >
                  <Text style={styles.actionButtonText}>Check RLS</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={runTests}
                >
                  <Text style={styles.actionButtonText}>Re-run Tests</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No test results available</Text>
            <TouchableOpacity style={styles.runTestsButton} onPress={runTests}>
              <Text style={styles.runTestsButtonText}>Run Tests</Text>
            </TouchableOpacity>
          </View>
        )}

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  refreshButton: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginTop: 12,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  testCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
  },
  testStatus: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  testData: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: Colors.textSecondary,
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
  },
  debugCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  debugText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noDataText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  runTestsButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  runTestsButtonText: {
    color: Colors.text,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});