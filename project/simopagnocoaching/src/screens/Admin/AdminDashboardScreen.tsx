import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { supabase } from '../../services/supabase';
import { theme } from '../../styles/theme';

type User = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
};

const AdminDashboardScreen = ({ navigation }: any) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'content', 'stats'

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // In a real app, you would join the auth.users and public.profiles tables
      // This is a simplified example
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        throw error;
      }

      if (data) {
        setUsers(data as User[]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Errore', 'Impossibile caricare gli utenti');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.navigate('Login');
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View>
        <Text style={styles.userName}>{item.full_name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userRole}>
          Ruolo: <Text style={{ fontWeight: 'bold' }}>{item.role}</Text>
        </Text>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => Alert.alert('Modifica', `Modifica utente ${item.full_name}`)}
        >
          <Text style={styles.actionButtonText}>Modifica</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => Alert.alert('Elimina', `Elimina utente ${item.full_name}?`)}
        >
          <Text style={styles.actionButtonText}>Elimina</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <FlatList
            data={users}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {loading ? 'Caricamento utenti...' : 'Nessun utente trovato'}
              </Text>
            }
          />
        );
      case 'content':
        return (
          <View style={styles.centeredContent}>
            <Text style={styles.emptyText}>Gestione contenuti</Text>
            <Text style={styles.subText}>
              Qui potrai gestire video, foto e altri contenuti dell'app
            </Text>
          </View>
        );
      case 'stats':
        return (
          <View style={styles.centeredContent}>
            <Text style={styles.emptyText}>Statistiche</Text>
            <Text style={styles.subText}>
              Visualizza statistiche sull'utilizzo dell'app
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard Admin</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'users' && styles.activeTabText,
            ]}
          >
            Utenti
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'content' && styles.activeTab]}
          onPress={() => setActiveTab('content')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'content' && styles.activeTabText,
            ]}
          >
            Contenuti
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
          onPress={() => setActiveTab('stats')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'stats' && styles.activeTabText,
            ]}
          >
            Statistiche
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary,
  },
  headerTitle: {
    fontSize: theme.fonts.size.xl,
    color: 'white',
    fontFamily: theme.fonts.bold,
  },
  logoutButton: {
    padding: theme.spacing.sm,
  },
  logoutButtonText: {
    color: 'white',
    fontFamily: theme.fonts.bold,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.fonts.size.md,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  userCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  userName: {
    fontSize: theme.fonts.size.lg,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.fonts.bold,
  },
  userEmail: {
    fontSize: theme.fonts.size.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.fonts.regular,
  },
  userRole: {
    fontSize: theme.fonts.size.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.sm,
  },
  actionButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.small,
    marginLeft: theme.spacing.sm,
  },
  actionButtonText: {
    color: 'white',
    fontSize: theme.fonts.size.sm,
    fontFamily: theme.fonts.bold,
  },
  editButton: {
    backgroundColor: theme.colors.primary,
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fonts.size.lg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    fontFamily: theme.fonts.regular,
  },
  subText: {
    fontSize: theme.fonts.size.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontFamily: theme.fonts.regular,
  },
});

export default AdminDashboardScreen; 