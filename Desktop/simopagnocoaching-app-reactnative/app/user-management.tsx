import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { UserManagementService, UserProfile, CreateUserRequest } from '../lib/userManagementService';
import { Colors } from '../simopagnocoachingreactnative/constants/Colors';

export default function UserManagementScreen() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [createForm, setCreateForm] = useState<CreateUserRequest>({
    email: '',
    name: '',
    role: 'client',
    password: '',
  });
  const [editForm, setEditForm] = useState({
    name: '',
    role: 'client' as 'coach' | 'client',
    is_active: true,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const result = await UserManagementService.getAllUsers();
      if (result.success) {
        setUsers(result.users || []);
      } else {
        Alert.alert('Errore', result.error || 'Errore nel caricamento utenti');
        if (result.error?.includes('Non autorizzato')) {
          router.replace('/(tabs)');
        }
      }
    } catch (error) {
      Alert.alert('Errore', 'Errore durante il caricamento utenti');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!createForm.email || !createForm.name || !createForm.password) {
      Alert.alert('Errore', 'Compila tutti i campi obbligatori');
      return;
    }

    if (createForm.password.length < 6) {
      Alert.alert('Errore', 'La password deve essere di almeno 6 caratteri');
      return;
    }

    try {
      const result = await UserManagementService.createUser(createForm);
      if (result.success) {
        Alert.alert('Successo', 'Utente creato con successo');
        setShowCreateModal(false);
        setCreateForm({ email: '', name: '', role: 'client', password: '' });
        loadUsers();
      } else {
        Alert.alert('Errore', result.error || 'Errore nella creazione utente');
      }
    } catch (error) {
      Alert.alert('Errore', 'Errore durante la creazione utente');
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      const result = await UserManagementService.updateUser(selectedUser.id, editForm);
      if (result.success) {
        Alert.alert('Successo', 'Utente aggiornato con successo');
        setShowEditModal(false);
        setSelectedUser(null);
        loadUsers();
      } else {
        Alert.alert('Errore', result.error || 'Errore nell\'aggiornamento utente');
      }
    } catch (error) {
      Alert.alert('Errore', 'Errore durante l\'aggiornamento utente');
    }
  };

  const handleToggleUserStatus = async (user: UserProfile) => {
    const action = user.is_active ? 'disattivare' : 'riattivare';
    const confirmMessage = `Sei sicuro di voler ${action} l'utente ${user.name}?`;

    Alert.alert(
      `Conferma ${action}`,
      confirmMessage,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Conferma',
          style: 'destructive',
          onPress: async () => {
            try {
              let result;
              if (user.is_active) {
                result = await UserManagementService.deactivateUser(user.id);
              } else {
                result = await UserManagementService.reactivateUser(user.id);
              }

              if (result.success) {
                Alert.alert('Successo', `Utente ${action} con successo`);
                loadUsers();
              } else {
                Alert.alert('Errore', result.error || `Errore nella ${action} utente`);
              }
            } catch (error) {
              Alert.alert('Errore', `Errore durante la ${action} utente`);
            }
          },
        },
      ]
    );
  };

  const handleDeleteUser = async (user: UserProfile) => {
    Alert.alert(
      'Conferma eliminazione',
      `Sei sicuro di voler eliminare definitivamente l'utente ${user.name}? Questa azione non può essere annullata.`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await UserManagementService.deleteUser(user.id);
              if (result.success) {
                Alert.alert('Successo', 'Utente eliminato con successo');
                loadUsers();
              } else {
                Alert.alert('Errore', result.error || 'Errore nell\'eliminazione utente');
              }
            } catch (error) {
              Alert.alert('Errore', 'Errore durante l\'eliminazione utente');
            }
          },
        },
      ]
    );
  };

  const openEditModal = (user: UserProfile) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      role: user.role,
      is_active: user.is_active,
    });
    setShowEditModal(true);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.fitness.primary} />
        <Text style={styles.loadingText}>Caricamento utenti...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Gestione Utenti</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Aggiungi Utente Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Text style={styles.addButtonText}>+ Nuovo Utente</Text>
      </TouchableOpacity>

      {/* Lista Utenti */}
      <ScrollView style={styles.userList}>
        {users.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.userMeta}>
                <Text style={[styles.userRole, { color: user.role === 'coach' ? Colors.fitness.primary : '#4CAF50' }]}>
                  {user.role === 'coach' ? 'Coach' : 'Cliente'}
                </Text>
                <Text style={[styles.userStatus, { color: user.is_active ? '#4CAF50' : '#F44336' }]}>
                  {user.is_active ? 'Attivo' : 'Disattivato'}
                </Text>
              </View>
            </View>
            
            <View style={styles.userActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openEditModal(user)}
              >
                <Text style={styles.actionButtonText}>Modifica</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, user.is_active ? styles.deactivateButton : styles.activateButton]}
                onPress={() => handleToggleUserStatus(user)}
              >
                <Text style={styles.actionButtonText}>
                  {user.is_active ? 'Disattiva' : 'Riattiva'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteUser(user)}
              >
                <Text style={styles.actionButtonText}>Elimina</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal Creazione Utente */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Crea Nuovo Utente</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor="#666"
              value={createForm.name}
              onChangeText={(text) => setCreateForm({ ...createForm, name: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666"
              value={createForm.email}
              onChangeText={(text) => setCreateForm({ ...createForm, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#666"
              value={createForm.password}
              onChangeText={(text) => setCreateForm({ ...createForm, password: text })}
              secureTextEntry
            />
            
            <View style={styles.roleSelector}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  createForm.role === 'client' && styles.roleButtonActive
                ]}
                onPress={() => setCreateForm({ ...createForm, role: 'client' })}
              >
                <Text style={[
                  styles.roleButtonText,
                  createForm.role === 'client' && styles.roleButtonTextActive
                ]}>
                  Cliente
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  createForm.role === 'coach' && styles.roleButtonActive
                ]}
                onPress={() => setCreateForm({ ...createForm, role: 'coach' })}
              >
                <Text style={[
                  styles.roleButtonText,
                  createForm.role === 'coach' && styles.roleButtonTextActive
                ]}>
                  Coach
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Annulla</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleCreateUser}
              >
                <Text style={styles.confirmButtonText}>Crea Utente</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Modifica Utente */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifica Utente</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor="#666"
              value={editForm.name}
              onChangeText={(text) => setEditForm({ ...editForm, name: text })}
            />
            
            <View style={styles.roleSelector}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  editForm.role === 'client' && styles.roleButtonActive
                ]}
                onPress={() => setEditForm({ ...editForm, role: 'client' })}
              >
                <Text style={[
                  styles.roleButtonText,
                  editForm.role === 'client' && styles.roleButtonTextActive
                ]}>
                  Cliente
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  editForm.role === 'coach' && styles.roleButtonActive
                ]}
                onPress={() => setEditForm({ ...editForm, role: 'coach' })}
              >
                <Text style={[
                  styles.roleButtonText,
                  editForm.role === 'coach' && styles.roleButtonTextActive
                ]}>
                  Coach
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Annulla</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleEditUser}
              >
                <Text style={styles.confirmButtonText}>Salva Modifiche</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.fitness.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.fitness.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.fitness.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backButton: {
    color: Colors.fitness.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.fitness.textPrimary,
  },
  placeholder: {
    width: 24,
  },
  addButton: {
    backgroundColor: Colors.fitness.primary,
    marginHorizontal: 24,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: Colors.fitness.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  userList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  userCard: {
    backgroundColor: Colors.fitness.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.fitness.card,
  },
  userInfo: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.fitness.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.fitness.textSecondary,
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  userRole: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  userStatus: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.fitness.card,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.fitness.textPrimary,
  },
  deactivateButton: {
    backgroundColor: '#FF9800',
  },
  activateButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.fitness.surface,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.fitness.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    backgroundColor: Colors.fitness.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.fitness.textPrimary,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.fitness.card,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    backgroundColor: Colors.fitness.background,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.fitness.card,
  },
  roleButtonActive: {
    backgroundColor: Colors.fitness.primary,
    borderColor: Colors.fitness.primary,
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.fitness.textPrimary,
  },
  roleButtonTextActive: {
    color: Colors.fitness.background,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.fitness.card,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.fitness.textSecondary,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: Colors.fitness.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.fitness.background,
  },
});
