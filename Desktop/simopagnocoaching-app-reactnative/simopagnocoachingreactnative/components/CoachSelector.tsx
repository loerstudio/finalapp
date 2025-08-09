import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '@/types';
import { supabaseChatService } from '@/lib/supabaseChatService';

interface CoachSelectorProps {
  onSelectCoach: (coach: User) => void;
  currentUserId: string;
  onCancel?: () => void;
}

export default function CoachSelector({ 
  onSelectCoach, 
  currentUserId,
  onCancel
}: CoachSelectorProps) {
  const [coaches, setCoaches] = useState<User[]>([]);
  const [filteredCoaches, setFilteredCoaches] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCoaches();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = coaches.filter(coach =>
        coach.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCoaches(filtered);
    } else {
      setFilteredCoaches(coaches);
    }
  }, [searchQuery, coaches]);

  const loadCoaches = async () => {
    setLoading(true);
    try {
      const result = await supabaseChatService.getAvailableCoaches();
      if (result.error) {
        console.error('Errore nel caricamento dei coach:', result.error);
        return;
      }
      // Filtra il coach corrente se è un coach
      const filteredCoaches = result.coaches.filter(coach => coach.id !== currentUserId);
      setCoaches(filteredCoaches);
      setFilteredCoaches(filteredCoaches);
    } catch (error) {
      console.error('Errore nel caricamento dei coach:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCoach = (coach: User) => {
    onSelectCoach(coach);
    setSearchQuery('');
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const renderCoach = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.coachItem}
      onPress={() => handleSelectCoach(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Text style={styles.avatar}>👨‍💼</Text>
      </View>
      <View style={styles.coachInfo}>
        <Text style={styles.coachName}>{item.email}</Text>
        <Text style={styles.coachRole}>Coach</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Seleziona Coach</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cerca coach..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Coaches List */}
      <FlatList
        data={filteredCoaches}
        renderItem={renderCoach}
        keyExtractor={item => item.id}
        style={styles.coachesList}
        contentContainerStyle={styles.coachesContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {loading ? 'Caricamento coach...' : 'Nessun coach disponibile'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  closeButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  coachesList: {
    flex: 1,
  },
  coachesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  coachItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    fontSize: 40,
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  coachRole: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
});
