import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ScrollView,
  Animated,
  Modal,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../services/supabase';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

const INITIAL_EXERCISE = {
  title: '',
  sets: '',
  reps: '',
  pause: '',
  pauseUnit: 'secondi',
  videoUrl: '',
  imageUrl: '',
  difficulty: 'Principiante',
  muscleGroups: '',
  instructions: '',
  duration: '',
  durationUnit: 'minuti',
};

export default function WorkoutScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  type WorkoutRouteParams = { refresh?: number };
  const route = useRoute<RouteProp<Record<string, WorkoutRouteParams>, string>>();
  const scrollRef = useRef(null);

  const [dbError, setDbError] = useState('');
  // 📱 STATO PRINCIPALE
  const [activeTab, setActiveTab] = useState('programs'); // programs, history, exercises, myWorkouts
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [refreshingTab, setRefreshingTab] = useState(false);

  // 🏋️ PROGRAMMI
  const [programs, setPrograms] = useState([]);
  const [showCreateProgram, setShowCreateProgram] = useState(false);
  const [newProgramName, setNewProgramName] = useState('');
  const [newProgramDescription, setNewProgramDescription] = useState('');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showProgramDetails, setShowProgramDetails] = useState(false);

  // 📚 STORICO
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [selectedHistoryWorkout, setSelectedHistoryWorkout] = useState(null);
  const [showHistoryDetails, setShowHistoryDetails] = useState(false);

  // 💪 ESERCIZI
  const [exercises, setExercises] = useState([]);
  const [newExercise, setNewExercise] = useState(INITIAL_EXERCISE);
  const [showCreateExercise, setShowCreateExercise] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showExerciseDetails, setShowExerciseDetails] = useState(false);
  const [search, setSearch] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('');

  // 🎯 I MIEI ALLENAMENTI - NUOVA SEZIONE
  const [myWorkouts, setMyWorkouts] = useState([]);
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    duration: '',
    exercises: [],
    notes: '',
    mood: 'Buono',
    difficulty: 'Media',
    calories: '',
    imageUrl: ''
  });
  const [selectedMyWorkout, setSelectedMyWorkout] = useState(null);
  const [showMyWorkoutDetails, setShowMyWorkoutDetails] = useState(false);

  // 🎯 UI E CARICAMENTO
  const [loading, setLoading] = useState(false);
  const [loadingProgress] = useState(new Animated.Value(0));
  const [showLoadingBar, setShowLoadingBar] = useState(false);

  // Stati per gestire i modals
  const [showAddExerciseToProgram, setShowAddExerciseToProgram] = useState(false);

  // Stati per i dati selezionati
  const [programForExercises, setProgramForExercises] = useState(null);

  // Stati per i form
  const [newProgram, setNewProgram] = useState({
    name: '',
    description: '',
  });

  // Stati per ricerca
  const [searchQuery, setSearchQuery] = useState('');
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('');
  
  // Stato per esercizi selezionati da aggiungere
  const [selectedExercisesToAdd, setSelectedExercisesToAdd] = useState([]);

  // 📸 GESTIONE MEDIA
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permesso negato', 'Serve il permesso per accedere alla galleria');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setNewExercise({ ...newExercise, imageUrl: result.assets[0].uri });
        Alert.alert('✅ Successo', 'Immagine selezionata!');
      }
    } catch (error) {
      Alert.alert('Errore', 'Impossibile selezionare l\'immagine');
    }
  };

  const pickVideo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permesso negato', 'Serve il permesso per accedere alla galleria');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60, // Massimo 60 secondi
      });

      if (!result.canceled && result.assets[0]) {
        setNewExercise({ ...newExercise, videoUrl: result.assets[0].uri });
        Alert.alert('✅ Successo', 'Video selezionato!');
      }
    } catch (error) {
      Alert.alert('Errore', 'Impossibile selezionare il video');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permesso negato', 'Serve il permesso per accedere alla fotocamera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setNewExercise({ ...newExercise, imageUrl: result.assets[0].uri });
        Alert.alert('✅ Successo', 'Foto scattata!');
      }
    } catch (error) {
      Alert.alert('Errore', 'Impossibile scattare la foto');
    }
  };

  // 📸 GESTIONE MEDIA PER I MIEI ALLENAMENTI
  const pickWorkoutImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permesso negato', 'Serve il permesso per accedere alla galleria');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setNewWorkout({ ...newWorkout, imageUrl: result.assets[0].uri });
        Alert.alert('✅ Successo', 'Immagine allenamento selezionata!');
      }
    } catch (error) {
      Alert.alert('Errore', 'Impossibile selezionare l\'immagine');
    }
  };

  const takeWorkoutPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permesso negato', 'Serve il permesso per accedere alla fotocamera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setNewWorkout({ ...newWorkout, imageUrl: result.assets[0].uri });
        Alert.alert('✅ Successo', 'Foto allenamento scattata!');
      }
    } catch (error) {
      Alert.alert('Errore', 'Impossibile scattare la foto');
    }
  };

  useEffect(() => {
    if (user) {
      loadAllData();
    }
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [user]);

  useEffect(() => {
    if (route.params?.refresh) {
      setRefreshingTab(true);
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: 0, animated: true });
      }
      setShowCreateProgram(false);
      setShowProgramDetails(false);
      setShowCreateExercise(false);
      setShowExerciseDetails(false);
      setShowAddExerciseToProgram(false);
      setShowAddWorkout(false);
      setShowMyWorkoutDetails(false);
      setSelectedProgram(null);
      setSelectedExercise(null);
      setSelectedMyWorkout(null);
      setSelectedExercisesToAdd([]);
      setProgramForExercises(null);
      setExerciseSearchQuery('');
      setSearch('');
      setFilterMuscle('');
      setActiveTab('programs');
      setTimeout(() => setRefreshingTab(false), 700); // animazione breve
    }
  }, [route.params?.refresh]);

  // 🔄 CARICAMENTO DATI
  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPrograms(),
        fetchWorkoutHistory(),
        fetchExercises(),
        fetchMyWorkouts(),
        loadLocalPrograms() // Carica anche programmi locali
      ]);
    } catch (error) {
      console.log('⚠️ Errore nel caricamento dati:', error);
    }
    setLoading(false);
  };

  // 💾 CARICA PROGRAMMI LOCALI
  const loadLocalPrograms = async () => {
    try {
      const localPrograms = await AsyncStorage.getItem('workout_programs_local');
      if (localPrograms) {
        const parsedPrograms = JSON.parse(localPrograms);
        setPrograms(prevPrograms => {
          // Merge programmi locali con quelli dal server evitando duplicati
          const mergedPrograms = [...prevPrograms];
          parsedPrograms.forEach(localProgram => {
            if (!mergedPrograms.find(p => p.id === localProgram.id)) {
              mergedPrograms.push(localProgram);
            }
          });
          return mergedPrograms;
        });
      }
    } catch (error) {
      console.log('⚠️ Errore caricamento programmi locali:', error);
    }
  };

  // 💾 SALVA PROGRAMMI LOCALI
  const saveLocalPrograms = async (programs) => {
    try {
      const localPrograms = programs.filter(p => p.isLocal);
      await AsyncStorage.setItem('workout_programs_local', JSON.stringify(localPrograms));
    } catch (error) {
      console.log('⚠️ Errore salvataggio programmi locali:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  // 📊 FETCH PROGRAMMI
  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('workout_programs')
        .select('*')
        .eq('user_id', user?.email || 'demo@user.com')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const programsWithExercises = data.map(program => ({
          ...program,
          exercises: program.exercises ? JSON.parse(program.exercises) : []
        }));
        setPrograms(programsWithExercises);
      }
    } catch (error) {
      console.log('⚠️ Errore caricamento programmi:', error);
    }
  };

  // 📊 FETCH STORICO
  const fetchWorkoutHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('workout_history')
        .select('*')
        .eq('user_id', user?.email || 'demo@user.com')
        .order('completed_at', { ascending: false });

      if (!error && data) {
        const historyWithData = data.map(workout => ({
          ...workout,
          exercises_done: workout.exercises_done ? JSON.parse(workout.exercises_done) : []
        }));
        setWorkoutHistory(historyWithData);
      }
    } catch (error) {
      console.log('⚠️ Errore caricamento storico:', error);
    }
  };

  // 📊 FETCH ESERCIZI
  const fetchExercises = async () => {
    try {
    const { data, error } = await supabase
      .from('coaching_program')
      .select('*')
        .eq('user_id', user?.email || 'demo@user.com')
      .order('created_at', { ascending: false });

      if (!error && data) {
        setExercises(data || []);
      }
    } catch (error) {
      console.log('⚠️ Errore caricamento esercizi:', error);
    }
  };

  // 📊 FETCH I MIEI ALLENAMENTI
  const fetchMyWorkouts = async () => {
    setDbError('');
    try {
      const { data, error } = await supabase
        .from('my_workouts')
        .select('*')
        .eq('user_id', user?.email || 'demo@user.com')
        .order('date', { ascending: false });
      if (!error && data) {
        console.log('Workouts fetchati da Supabase:', data);
        const workoutsWithData = data.map(workout => ({
          ...workout,
          exercises: workout.exercises ? JSON.parse(workout.exercises) : []
        }));
        setMyWorkouts(workoutsWithData);
      } else {
        console.error('Errore Supabase fetch:', error);
        setDbError('Errore fetch da Supabase: ' + (error?.message || error));
        // Fallback locale
        const localWorkouts = await AsyncStorage.getItem('my_workouts_local');
        if (localWorkouts) {
          const parsedWorkouts = JSON.parse(localWorkouts);
          setMyWorkouts(parsedWorkouts);
        }
      }
    } catch (error) {
      console.error('Errore fetch workout:', error);
      setDbError('Errore fetch workout: ' + error.message);
    }
  };

  // 💪 AGGIUNGI NUOVO ALLENAMENTO
  const handleAddWorkout = async () => {
    setDbError('');
    if (!newWorkout.name.trim()) {
      Alert.alert('Errore', 'Inserisci un nome per l\'allenamento');
      return;
    }
    if (newWorkout.date > new Date().toISOString().split('T')[0]) {
      setDateError('Non puoi selezionare una data futura');
      return;
    }
    setDateError('');
    setLoading(true);
    try {
      const workoutData = {
        user_id: user?.email || 'demo@user.com',
        name: newWorkout.name,
        date: newWorkout.date,
        duration: newWorkout.duration === "" ? null : Number(newWorkout.duration),
        exercises: JSON.stringify(newWorkout.exercises),
        notes: newWorkout.notes,
        mood: newWorkout.mood,
        difficulty: newWorkout.difficulty,
        calories: newWorkout.calories === "" ? null : Number(newWorkout.calories),
        image_url: newWorkout.imageUrl,
        completed: false,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('my_workouts')
        .insert([workoutData])
        .select();

      if (!error && data) {
        console.log('Workout salvato su Supabase:', data);
        Alert.alert('✅ Successo', 'Allenamento registrato con successo!');
        setShowAddWorkout(false);
        setNewWorkout({
          name: '',
          date: new Date().toISOString().split('T')[0],
          duration: '',
          exercises: [],
          notes: '',
          mood: 'Buono',
          difficulty: 'Media',
          calories: '',
          imageUrl: ''
        });
        fetchMyWorkouts();
      } else {
        console.error('Errore Supabase insert:', error);
        setDbError('Errore salvataggio su Supabase: ' + (error?.message || error));
        // Fallback locale
        const localWorkout = {
          id: 'local_' + Date.now(),
          ...workoutData,
          isLocal: true
        };
        const updatedWorkouts = [localWorkout, ...myWorkouts];
        setMyWorkouts(updatedWorkouts);
        await AsyncStorage.setItem('my_workouts_local', JSON.stringify(updatedWorkouts));
        Alert.alert('⚠️ Salvato solo in locale', 'Allenamento registrato localmente. Verrà sincronizzato quando la connessione sarà disponibile.');
        setShowAddWorkout(false);
        setNewWorkout({
          name: '',
          date: new Date().toISOString().split('T')[0],
          duration: '',
          exercises: [],
          notes: '',
          mood: 'Buono',
          difficulty: 'Media',
          calories: '',
          imageUrl: ''
        });
      }
    } catch (error) {
      console.error('Errore salvataggio workout:', error);
      setDbError('Errore salvataggio workout: ' + error.message);
      Alert.alert('Errore', 'Impossibile salvare l\'allenamento');
    }
    setLoading(false);
  };

  // 🗑️ ELIMINA ALLENAMENTO
  const deleteMyWorkout = async (workoutId) => {
    Alert.alert(
      'Conferma eliminazione',
      'Sei sicuro di voler eliminare questo allenamento?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('my_workouts')
                .delete()
                .eq('id', workoutId);

              if (!error) {
                Alert.alert('✅ Successo', 'Allenamento eliminato');
                fetchMyWorkouts();
              } else {
                Alert.alert('Errore', 'Impossibile eliminare l\'allenamento');
              }
            } catch (error) {
              console.log('⚠️ Errore eliminazione allenamento:', error);
              Alert.alert('Errore', 'Impossibile eliminare l\'allenamento');
            }
          }
        }
      ]
    );
  };

  // 🎨 ANIMAZIONE LOADING
  const startLoadingAnimation = () => {
    setShowLoadingBar(true);
    loadingProgress.setValue(0);

    Animated.timing(loadingProgress, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start(() => {
      setTimeout(() => {
        setShowLoadingBar(false);
        loadingProgress.setValue(0);
      }, 500);
    });
  };

  // 🏗️ CREA PROGRAMMA
  const handleCreateProgram = async () => {
    if (!newProgramName.trim()) {
      Alert.alert('Errore', 'Inserisci un nome per il programma');
      return;
    }

    setLoading(true);
    startLoadingAnimation();

    try {
      // Prova a salvare su Supabase
      const { data, error } = await supabase
        .from('workout_programs')
        .insert({
          user_id: user?.email || 'demo@user.com',
          name: newProgramName,
          description: newProgramDescription,
          exercises: JSON.stringify([]),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (!error && data) {
        // Successo Supabase
        const newProgram = { ...data, exercises: [] };
        setPrograms(prev => [newProgram, ...prev]);
        Alert.alert('✅ Successo', `Programma "${newProgramName}" creato e salvato nel cloud!`);
      } else {
        // Fallback locale se Supabase fallisce
        console.log('⚠️ Supabase error:', error);
        const localProgram = {
          id: 'local_' + Date.now(),
          user_id: user?.email || 'demo@user.com',
          name: newProgramName,
          description: newProgramDescription,
          exercises: [],
          created_at: new Date().toISOString(),
          isLocal: true
        };
        const updatedPrograms = [localProgram, ...programs];
        setPrograms(updatedPrograms);
        await saveLocalPrograms(updatedPrograms);
        Alert.alert('✅ Successo', `Programma "${newProgramName}" creato localmente!`);
      }
    } catch (error) {
      // Fallback locale in caso di errore di rete
      console.log('⚠️ Network error:', error);
      const localProgram = {
        id: 'local_' + Date.now(),
        user_id: user?.email || 'demo@user.com',
        name: newProgramName,
        description: newProgramDescription,
        exercises: [],
        created_at: new Date().toISOString(),
        isLocal: true
      };
      const updatedPrograms = [localProgram, ...programs];
      setPrograms(updatedPrograms);
      await saveLocalPrograms(updatedPrograms);
      Alert.alert('✅ Successo', `Programma "${newProgramName}" creato localmente! Verrà sincronizzato quando la connessione sarà disponibile.`);
    }

    setTimeout(() => {
      setNewProgramName('');
      setNewProgramDescription('');
      setShowCreateProgram(false);
      setLoading(false);
      setShowLoadingBar(false);
    }, 2000);
  };

  // 🗑️ RIMUOVI ESERCIZIO DAL PROGRAMMA
  const removeExerciseFromProgram = async (program, exerciseIndex) => {
    Alert.alert(
      'Rimuovi Esercizio',
      `Vuoi rimuovere questo esercizio da "${program.name}"?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Rimuovi',
          style: 'destructive',
          onPress: async () => {
            try {
              // Rimuovi l'esercizio dall'array
              const updatedExercises = program.exercises.filter((_, index) => index !== exerciseIndex);

              // Aggiorna su Supabase
              const { error } = await supabase
                .from('workout_programs')
                .update({ exercises: JSON.stringify(updatedExercises) })
                .eq('id', program.id);

              if (error) {
                console.error('Errore aggiornamento programma:', error);
                // Fallback locale
                if (!program) {
                  Alert.alert('Errore', 'Nessun programma selezionato.');
                  return;
                }
                const updatedPrograms = programs.map(p => 
                  p.id === program.id 
                    ? { ...p, exercises: updatedExercises }
                    : p
                );
                setPrograms(updatedPrograms);
                await AsyncStorage.setItem('workout_programs', JSON.stringify(updatedPrograms));
              } else {
                // Ricarica i programmi
                await fetchPrograms();
              }

              // Aggiorna il programma selezionato
              setSelectedProgram({ ...program, exercises: updatedExercises });

              Alert.alert('✅ Successo', 'Esercizio rimosso dal programma!');
            } catch (error) {
              console.error('Errore rimozione esercizio:', error);
              Alert.alert('Errore', 'Impossibile rimuovere l\'esercizio');
            }
          }
        }
      ]
    );
  };

  // 🎯 AUTO-AGGIUNTA ESERCIZIO AL PROGRAMMA
  const autoAddExerciseToProgram = async (exercise) => {
    try {
      console.log('🔥 Auto-aggiunta esercizio al programma:', programForExercises?.name);
      
      // Prepara gli esercizi esistenti + nuovo
      const currentExercises = programForExercises.exercises || [];
      const newExercises = [...currentExercises, exercise];

      // Aggiorna su Supabase
      const { error } = await supabase
        .from('workout_programs')
        .update({ exercises: JSON.stringify(newExercises) })
        .eq('id', programForExercises.id);

      if (error) {
        console.error('Errore aggiornamento programma:', error);
        // Fallback locale
        const updatedPrograms = programs.map(p => 
          p.id === programForExercises.id 
            ? { ...p, exercises: newExercises }
            : p
        );
        setPrograms(updatedPrograms);
        await saveLocalPrograms(updatedPrograms);
      } else {
        // Ricarica i programmi
        await fetchPrograms();
      }

      // Aggiorna il programma selezionato se è lo stesso
      if (selectedProgram && selectedProgram.id === programForExercises.id) {
        setSelectedProgram({ ...programForExercises, exercises: newExercises });
      }

      Alert.alert(
        '✅ Successo Completo!', 
        `Esercizio "${exercise.title}" creato e aggiunto automaticamente a "${programForExercises.name}"!`,
        [
          {
            text: 'Continua ad Aggiungere',
            onPress: () => {
              // Torna al modal di aggiunta esercizi
              setShowAddExerciseToProgram(true);
            }
          },
          {
            text: 'Visualizza Programma',
            onPress: () => {
              // Torna ai dettagli del programma
              setShowProgramDetails(true);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Errore auto-aggiunta:', error);
      Alert.alert('Errore', 'Esercizio creato ma non aggiunto automaticamente al programma');
    }
  };

  // 🏗️ CREA ESERCIZIO
  const handleCreateExercise = async () => {
    if (!newExercise.title.trim()) {
      Alert.alert('Errore', 'Inserisci un nome per l\'esercizio');
      return;
    }

    setLoading(true);
    startLoadingAnimation();

    try {
      // Prova prima con Supabase
      const { data, error } = await supabase
        .from('coaching_program')
        .insert({
          user_id: user?.email || 'demo@user.com',
      title: newExercise.title,
          sets: newExercise.sets || null,
          reps: newExercise.reps || null,
          pause: newExercise.pause || null,
          pause_unit: newExercise.pauseUnit,
      difficulty: newExercise.difficulty,
      muscle_groups: newExercise.muscleGroups,
      instructions: newExercise.instructions,
          duration: newExercise.duration || null,
          duration_unit: newExercise.durationUnit,
          video_url: newExercise.videoUrl || null,
          image_url: newExercise.imageUrl || null,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (!error && data) {
        setExercises(prev => [data, ...prev]);
        
        // AUTO-AGGIUNTA AL PROGRAMMA SE SIAMO IN MODALITÀ AGGIUNTA ESERCIZI
        if (programForExercises) {
          await autoAddExerciseToProgram(data);
    } else {
          Alert.alert('✅ Successo', `Esercizio "${newExercise.title}" creato e salvato nel cloud!`);
        }
      } else {
        throw new Error('Supabase fallito');
      }
    } catch (error) {
      console.log('⚠️ Errore Supabase, salvataggio locale:', error);
      
      // Fallback: Salvataggio locale
      const localExercise = {
        id: 'local_exercise_' + Date.now(),
        user_id: user?.email || 'demo@user.com',
      title: newExercise.title,
        sets: newExercise.sets || null,
        reps: newExercise.reps || null,
        pause: newExercise.pause || null,
        pause_unit: newExercise.pauseUnit,
      difficulty: newExercise.difficulty,
      muscle_groups: newExercise.muscleGroups,
      instructions: newExercise.instructions,
        duration: newExercise.duration || null,
        duration_unit: newExercise.durationUnit,
        video_url: newExercise.videoUrl || null,
        image_url: newExercise.imageUrl || null,
        created_at: new Date().toISOString(),
        isLocal: true
      };
      
      setExercises(prev => [localExercise, ...prev]);
      
      // AUTO-AGGIUNTA AL PROGRAMMA SE SIAMO IN MODALITÀ AGGIUNTA ESERCIZI
      if (programForExercises) {
        await autoAddExerciseToProgram(localExercise);
    } else {
        Alert.alert('✅ Successo', `Esercizio "${newExercise.title}" creato localmente!`);
    }
    }

    setTimeout(() => {
      setNewExercise(INITIAL_EXERCISE);
      setShowCreateExercise(false);
    setLoading(false);
      setShowLoadingBar(false);
    }, 2000);
  };

  // 🎯 AVVIA ALLENAMENTO
  const startWorkout = async (program) => {
    if (!program.exercises || program.exercises.length === 0) {
      Alert.alert('Attenzione', 'Questo programma non ha esercizi. Aggiungine alcuni prima di iniziare.');
      return;
    }

    Alert.alert(
      '🏋️ Inizia Allenamento',
      `Vuoi iniziare "${program.name}"?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Inizia',
          onPress: () => completeWorkout(program)
        }
      ]
    );
  };

  // ✅ COMPLETA ALLENAMENTO
  const completeWorkout = async (program) => {
    try {
      const { data, error } = await supabase
        .from('workout_history')
        .insert({
          user_id: user?.email || 'demo@user.com',
          program_name: program.name,
          exercises_done: JSON.stringify(program.exercises),
          duration_minutes: 45, // Durata di default
          notes: '',
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (!error && data) {
        const newWorkout = {
          ...data,
          exercises_done: JSON.parse(data.exercises_done)
        };
        setWorkoutHistory(prev => [newWorkout, ...prev]);
        Alert.alert('🎉 Ottimo lavoro!', 'Allenamento completato e salvato nello storico!');
      }
    } catch (error) {
      Alert.alert('Errore', 'Impossibile salvare l\'allenamento');
    }
  };

  // 🗑️ ELIMINA PROGRAMMA
  const deleteProgram = async (programId) => {
    Alert.alert(
      'Elimina Programma',
      'Sei sicuro di voler eliminare questo programma?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            try {
              const programToDelete = programs.find(p => p.id === programId);
              
              if (programToDelete?.isLocal) {
                // Elimina solo localmente
                const updatedPrograms = programs.filter(p => p.id !== programId);
                setPrograms(updatedPrograms);
                await saveLocalPrograms(updatedPrograms);
                Alert.alert('✅ Programma eliminato', 'Programma rimosso dai tuoi dati locali');
              } else {
                // Elimina da Supabase
                const { error } = await supabase
                  .from('workout_programs')
                  .delete()
                  .eq('id', programId);

                if (error) {
                  console.error('Errore eliminazione da Supabase:', error);
                  // Elimina solo localmente come fallback
                  const updatedPrograms = programs.filter(p => p.id !== programId);
                  setPrograms(updatedPrograms);
                  await saveLocalPrograms(updatedPrograms);
                  Alert.alert('⚠️ Eliminato localmente', 'Programma rimosso localmente, verrà sincronizzato quando possibile');
                } else {
                  // Ricarica i programmi dopo eliminazione
                  await fetchPrograms();
                  Alert.alert('✅ Programma eliminato', 'Programma eliminato dal cloud');
                }
              }
            } catch (error) {
              console.error('Errore eliminazione programma:', error);
              Alert.alert('Errore', 'Impossibile eliminare il programma');
            }
          }
        }
      ]
    );
  };

  // Funzione per aprire il modal di aggiunta esercizi
  const openAddExercisesToProgram = (program) => {
    console.log('🚀🚀🚀 DENTRO openAddExercisesToProgram! 🚀🚀🚀');
    console.log('🔥 Programma ricevuto:', program?.name);
    console.log('🔥 ID programma:', program?.id);
    console.log('🔥 Esercizi disponibili totali:', exercises.length);
    console.log('🔥 State showAddExerciseToProgram prima:', showAddExerciseToProgram);
    
    setProgramForExercises(program);
    setSelectedExercisesToAdd([]);
    setExerciseSearchQuery('');
    setShowAddExerciseToProgram(true);
    
    console.log('🔥 Modal dovrebbe aprirsi ora...');
    
    // Timeout per verificare se il modal si è aperto
    setTimeout(() => {
      console.log('🔥 State showAddExerciseToProgram dopo 100ms:', showAddExerciseToProgram);
    }, 100);
  };

  // Funzione per aggiungere/rimuovere esercizi dalla selezione
  const toggleExerciseSelection = (exercise) => {
    setSelectedExercisesToAdd(prev => {
      const isSelected = prev.find(e => e.id === exercise.id);
      if (isSelected) {
        return prev.filter(e => e.id !== exercise.id);
      } else {
        return [...prev, exercise];
      }
    });
  };

  // Funzione per aggiungere esercizi selezionati al programma
  const addExercisesToProgram = async () => {
    console.log('🔥 Tentativo aggiunta esercizi al programma');
    console.log('🔥 Programma:', programForExercises?.name);
    console.log('🔥 Esercizi selezionati:', selectedExercisesToAdd.length);
    
    if (!programForExercises || selectedExercisesToAdd.length === 0) {
      console.log('🔥 Errore: nessun programma o esercizi selezionati');
      return;
    }

    try {
      // Prepara gli esercizi esistenti + nuovi
      const currentExercises = programForExercises.exercises || [];
      const newExercises = [...currentExercises, ...selectedExercisesToAdd];

      // Aggiorna su Supabase
      const { error } = await supabase
        .from('workout_programs')
        .update({ exercises: JSON.stringify(newExercises) })
        .eq('id', programForExercises.id);

      if (error) {
        console.error('Errore aggiornamento programma:', error);
        // Fallback locale
        const updatedPrograms = programs.map(p => 
          p.id === programForExercises.id 
            ? { ...p, exercises: newExercises }
            : p
        );
        setPrograms(updatedPrograms);
        await AsyncStorage.setItem('workout_programs', JSON.stringify(updatedPrograms));
      } else {
        // Ricarica i programmi
        await fetchPrograms();
      }

      // Aggiorna il programma selezionato se è lo stesso
      if (selectedProgram && selectedProgram.id === programForExercises.id) {
        setSelectedProgram({ ...programForExercises, exercises: newExercises });
      }

      // Chiudi il modal
      setShowAddExerciseToProgram(false);
      setSelectedExercisesToAdd([]);
      setProgramForExercises(null);

      Alert.alert('Successo', `${selectedExercisesToAdd.length} esercizi aggiunti al programma!`);
    } catch (error) {
      console.error('Errore:', error);
      Alert.alert('Errore', 'Impossibile aggiungere gli esercizi al programma');
    }
  };

  // Filtra esercizi per la ricerca nel modal di aggiunta
  const filteredExercisesForAdd = exercises.filter(exercise =>
    exercise.title.toLowerCase().includes(exerciseSearchQuery.toLowerCase()) ||
    (exercise.muscle_groups && exercise.muscle_groups.toLowerCase().includes(exerciseSearchQuery.toLowerCase()))
  );

  // 🎨 FILTRI
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.title?.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = !filterMuscle || exercise.muscle_groups?.toLowerCase().includes(filterMuscle.toLowerCase());
    return matchesSearch && matchesMuscle;
  });

  // 🎨 RENDER TAB HEADER - RIMOSSO (solo programmi)
  const renderTabHeader = () => null;

  // 🎨 RENDER PROGRAMMI
  const renderProgramsTab = () => (
    <View style={styles.tabContent}>
              <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>I Tuoi Programmi</Text>
          <TouchableOpacity
            style={styles.addButtonLarge}
            onPress={() => setShowCreateProgram(true)}
          >
            <Ionicons name="add" size={28} color="#fff" />
            <Text style={styles.addButtonText}>Nuovo</Text>
          </TouchableOpacity>
        </View>

      {programs.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="fitness" size={60} color="#666" />
          <Text style={styles.emptyStateText}>Nessun programma ancora</Text>
          <Text style={styles.emptyStateSubtext}>Crea il tuo primo programma di allenamento</Text>
        </View>
      ) : (
        <FlatList
          data={programs}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          bounces={true}
          scrollEventThrottle={16}
          decelerationRate="normal"
          contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.programCard}
              onPress={() => {
                setSelectedProgram(item);
                setShowProgramDetails(true);
              }}
            >
              <View style={styles.programHeader}>
                <Text style={styles.programName}>{item.name}</Text>
                <View style={styles.programActions}>
                  <TouchableOpacity
                    style={styles.startButtonLarge}
                    onPress={() => startWorkout(item)}
                  >
                    <Ionicons name="play" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Inizia</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButtonLarge}
                    onPress={() => deleteProgram(item.id)}
                  >
                    <Ionicons name="trash" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Elimina</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {item.description ? (
                <Text style={styles.programDescription}>{item.description}</Text>
              ) : null}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text>{item.exercises?.length || 0} esercizi</Text>
                <TouchableOpacity
                  style={{ marginLeft: 18, padding: 2, borderRadius: 8, backgroundColor: '#e53935', alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}
                  onPress={(e) => {
                    e.stopPropagation && e.stopPropagation();
                    openAddExercisesToProgram(item);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );

  // 🎨 RENDER STORICO
  const renderHistoryTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Storico Allenamenti</Text>
      </View>

      {workoutHistory.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="stats-chart" size={60} color="#666" />
          <Text style={styles.emptyStateText}>Nessun allenamento completato</Text>
          <Text style={styles.emptyStateSubtext}>Inizia un programma per vedere lo storico</Text>
        </View>
      ) : (
        <FlatList
          data={workoutHistory}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          bounces={true}
          scrollEventThrottle={16}
          decelerationRate="normal"
          contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.historyCard}
              onPress={() => {
                setSelectedHistoryWorkout(item);
                setShowHistoryDetails(true);
              }}
            >
              <View style={styles.historyHeader}>
                <Text style={styles.historyProgramName}>{item.program_name}</Text>
                <Text style={styles.historyDate}>
                  {new Date(item.completed_at).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.historyInfo}>
                {item.exercises_done?.length || 0} esercizi • {item.duration_minutes} min
              </Text>
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );

  // 🎨 RENDER ESERCIZI
  const renderExercisesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>I Tuoi Esercizi</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateExercise(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#999" />
        <TextInput
            style={styles.searchInput}
            placeholder="Cerca esercizi..."
            placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />
      </View>
      </View>

      {filteredExercises.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="barbell" size={60} color="#666" />
          <Text style={styles.emptyStateText}>
            {search ? 'Nessun esercizio trovato' : 'Nessun esercizio ancora'}
          </Text>
          <Text style={styles.emptyStateSubtext}>
            {search ? 'Prova con un termine diverso' : 'Crea il tuo primo esercizio personalizzato'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          bounces={true}
          scrollEventThrottle={16}
          decelerationRate="normal"
          contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.exerciseCard}
              onPress={() => {
                setSelectedExercise(item);
                setShowExerciseDetails(true);
              }}
            >
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{item.title}</Text>
                <View style={styles.exerciseActions}>
                  <TouchableOpacity
                    style={styles.addToProgramButton}
                    onPress={() => autoAddExerciseToProgram(item)}
                  >
                    <Ionicons name="add-circle" size={20} color="#4caf50" />
        </TouchableOpacity>
      </View>
              </View>
              {item.muscle_groups && (
                <Text style={styles.exerciseMuscles}>{item.muscle_groups}</Text>
              )}
              <View style={styles.exerciseStats}>
                <Text style={styles.exerciseStat}>
                  {item.sets} serie • {item.reps} reps
                </Text>
                {item.difficulty && (
                  <Text style={styles.exerciseDifficulty}>{item.difficulty}</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );

  // 🎯 RENDER I MIEI ALLENAMENTI - NUOVA SEZIONE
  const renderMyWorkoutsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>I Miei Allenamenti</Text>
      <TouchableOpacity
          style={styles.addButtonLarge}
          onPress={() => setShowAddWorkout(true)}
        >
          <Ionicons name="add" size={28} color="#fff" />
          <Text style={styles.addButtonText}>Registra</Text>
        </TouchableOpacity>
      </View>

      {myWorkouts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="trophy" size={60} color="#666" />
          <Text style={styles.emptyStateText}>Nessun allenamento registrato</Text>
          <Text style={styles.emptyStateSubtext}>Registra il tuo primo allenamento completato</Text>
        </View>
      ) : (
        <FlatList
          data={myWorkouts}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          bounces={true}
          scrollEventThrottle={16}
          decelerationRate="normal"
          contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.myWorkoutCard, item.completed && { opacity: 0.6, borderColor: '#4caf50' }]}
              onPress={() => {
                console.log('Workout selezionato:', item);
                setSelectedMyWorkout(item);
                setShowMyWorkoutDetails(true);
              }}
            >
              <View style={styles.myWorkoutHeader}>
                <View style={styles.myWorkoutInfo}>
                  <Text style={[styles.myWorkoutName, item.completed && { textDecorationLine: 'line-through', color: '#4caf50' }]}>{item.name}</Text>
                  <Text style={styles.myWorkoutDate}>
                    {new Date(item.date).toLocaleDateString('it-IT', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </Text>
                </View>
                <View style={styles.myWorkoutActions}>
                  {item.completed && <Ionicons name="checkmark-circle" size={24} color="#4caf50" style={{ marginRight: 8 }} />}
                  <TouchableOpacity
                    style={styles.deleteButtonLarge}
                    onPress={() => deleteMyWorkout(item.id)}
                  >
                    <Ionicons name="trash" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Elimina</Text>
      </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.myWorkoutStats}>
                {item.duration && (
                  <View style={styles.statItem}>
                    <Ionicons name="time" size={16} color="#4caf50" />
                    <Text style={styles.statText}>{item.duration} min</Text>
                  </View>
                )}
                {item.calories && (
                  <View style={styles.statItem}>
                    <Ionicons name="flame" size={16} color="#ff9800" />
                    <Text style={styles.statText}>{item.calories} cal</Text>
                  </View>
                )}
                <View style={styles.statItem}>
                  <Ionicons name="barbell" size={16} color="#2196f3" />
                  <Text style={styles.statText}>{item.exercises?.length || 0} esercizi</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="happy" size={16} color="#9c27b0" />
                  <Text style={styles.statText}>{item.mood}</Text>
                </View>
              </View>

              {item.notes && (
                <Text style={styles.myWorkoutNotes}>{item.notes}</Text>
              )}

              {item.image_url && (
                <Image source={{ uri: item.image_url }} style={styles.myWorkoutImage} />
              )}
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );

  // Stato per mostrare il date picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateError, setDateError] = useState('');

  // 2. Funzione per segnare come fatto/non fatto
  const toggleWorkoutCompleted = async (workout) => {
    setDbError('');
    const updated = { ...workout, completed: !workout.completed };
    // Aggiorna su Supabase se non è locale
    if (!workout.isLocal && workout.id) {
      try {
        const { error } = await supabase.from('my_workouts').update({ completed: updated.completed }).eq('id', workout.id);
        if (error) {
          console.error('Errore Supabase update:', error);
          setDbError('Errore update su Supabase: ' + (error?.message || error));
        }
      } catch (error) {
        console.error('Errore update workout:', error);
        setDbError('Errore update workout: ' + error.message);
      }
    }
    // Aggiorna localmente
    const updatedList = myWorkouts.map(w => w.id === workout.id ? updated : w);
    setMyWorkouts(updatedList);
    await AsyncStorage.setItem('my_workouts_local', JSON.stringify(updatedList.filter(w => w.isLocal)));
    setSelectedMyWorkout(updated);
  }

  try {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft} />
          <Text style={styles.headerTitle}>Workout</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Loading Bar */}
        {showLoadingBar && (
          <View style={styles.loadingBarContainer}>
            <Animated.View
              style={[
                styles.loadingBar,
                {
                  width: loadingProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        )}

        {refreshingTab && (
          <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(30,30,30,0.7)', zIndex: 99, alignItems: 'center', justifyContent: 'center'}}>
            <ActivityIndicator size="large" color="#e53935" />
          </View>
        )}

        {dbError ? (
          <View style={{ backgroundColor: '#ffdddd', padding: 10, margin: 10, borderRadius: 8 }}>
            <Text style={{ color: '#b71c1c', fontWeight: 'bold' }}>{dbError}</Text>
          </View>
        ) : null}

        {/* Content - Solo Programmi */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'programs' && styles.tabButtonActive]}
              onPress={() => setActiveTab('programs')}
            >
              <Ionicons 
                name="fitness" 
                size={20} 
                color={activeTab === 'programs' ? '#e53935' : '#666'} 
              />
              <Text style={[styles.tabText, activeTab === 'programs' && styles.tabTextActive]}>
                Programmi
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'myWorkouts' && styles.tabButtonActive]}
              onPress={() => setActiveTab('myWorkouts')}
            >
              <Ionicons 
                name="trophy" 
                size={20} 
                color={activeTab === 'myWorkouts' ? '#e53935' : '#666'} 
              />
              <Text style={[styles.tabText, activeTab === 'myWorkouts' && styles.tabTextActive]}>
                I Miei Allenamenti
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'programs' && renderProgramsTab()}
          {activeTab === 'myWorkouts' && renderMyWorkoutsTab()}
        </Animated.View>

        {/* CREATE PROGRAM MODAL */}
        <Modal
          visible={showCreateProgram}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowCreateProgram(false)}>
                <Text style={styles.modalCancel}>Annulla</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Nuovo Programma</Text>
              <TouchableOpacity onPress={handleCreateProgram}>
                <Text style={styles.modalSave}>Salva</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome del Programma *</Text>
            <TextInput
                  style={styles.textInput}
                  placeholder="es. Push Pull Legs"
                  placeholderTextColor="#666"
                  value={newProgramName}
                  onChangeText={setNewProgramName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Descrizione (opzionale)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Descrivi il tuo programma..."
                  placeholderTextColor="#666"
                  value={newProgramDescription}
                  onChangeText={setNewProgramDescription}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </ScrollView>
          </View>
        </Modal>

        {/* CREATE EXERCISE MODAL */}
        <Modal
          visible={showCreateExercise}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowCreateExercise(false)}>
                <Text style={styles.modalCancel}>Annulla</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Nuovo Esercizio</Text>
              <TouchableOpacity onPress={handleCreateExercise}>
                <Text style={styles.modalSave}>Salva</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
              bounces={true}
              scrollEventThrottle={16}
              contentContainerStyle={{ paddingBottom: 30, flexGrow: 1 }}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome Esercizio *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="es. Panca Piana"
                  placeholderTextColor="#666"
              value={newExercise.title}
                  onChangeText={(text) => setNewExercise({ ...newExercise, title: text })}
            />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Serie</Text>
            <TextInput
                    style={styles.textInput}
                    placeholder="3"
                    placeholderTextColor="#666"
              value={newExercise.sets}
                    onChangeText={(text) => setNewExercise({ ...newExercise, sets: text })}
                    keyboardType="numeric"
            />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Ripetizioni</Text>
            <TextInput
                    style={styles.textInput}
                    placeholder="10"
                    placeholderTextColor="#666"
              value={newExercise.reps}
                    onChangeText={(text) => setNewExercise({ ...newExercise, reps: text })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Pausa (sec)</Text>
            <TextInput
                    style={styles.textInput}
                    placeholder="60"
                    placeholderTextColor="#666"
              value={newExercise.pause}
                    onChangeText={(text) => setNewExercise({ ...newExercise, pause: text })}
                    keyboardType="numeric"
            />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Durata (min)</Text>
            <TextInput
                    style={styles.textInput}
                    placeholder="5"
                    placeholderTextColor="#666"
                    value={newExercise.duration}
                    onChangeText={(text) => setNewExercise({ ...newExercise, duration: text })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Gruppi Muscolari</Text>
            <TextInput
                  style={styles.textInput}
                  placeholder="es. Petto, Tricipiti"
                  placeholderTextColor="#666"
              value={newExercise.muscleGroups}
                  onChangeText={(text) => setNewExercise({ ...newExercise, muscleGroups: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Difficoltà</Text>
                <View style={styles.difficultySelector}>
                  {['Principiante', 'Intermedio', 'Avanzato'].map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.difficultyOption,
                        newExercise.difficulty === level && styles.difficultyOptionSelected
                      ]}
                      onPress={() => setNewExercise({ ...newExercise, difficulty: level })}
                    >
                      <Text style={[
                        styles.difficultyText,
                        newExercise.difficulty === level && styles.difficultyTextSelected
                      ]}>
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Video Dimostrativo (opzionale)</Text>
                <View style={styles.mediaButtonsContainer}>
                  <TouchableOpacity style={styles.mediaButton} onPress={pickVideo}>
                    <Ionicons name="videocam" size={20} color="#fff" />
                    <Text style={styles.mediaButtonText}>Seleziona Video</Text>
                  </TouchableOpacity>
                  {newExercise.videoUrl && (
                    <TouchableOpacity 
                      style={styles.mediaButtonSecondary}
                      onPress={() => setNewExercise({ ...newExercise, videoUrl: '' })}
                    >
                      <Ionicons name="close" size={16} color="#e53935" />
                      <Text style={styles.mediaButtonTextSecondary}>Rimuovi</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {newExercise.videoUrl && (
                  <Text style={styles.mediaSelectedText}>✅ Video selezionato</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Immagine Dimostrativa (opzionale)</Text>
                <View style={styles.mediaButtonsContainer}>
                  <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
                    <Ionicons name="image" size={20} color="#fff" />
                    <Text style={styles.mediaButtonText}>Dalla Galleria</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.mediaButton} onPress={takePhoto}>
                    <Ionicons name="camera" size={20} color="#fff" />
                    <Text style={styles.mediaButtonText}>Scatta Foto</Text>
                  </TouchableOpacity>
                  {newExercise.imageUrl && (
                    <TouchableOpacity 
                      style={styles.mediaButtonSecondary}
                      onPress={() => setNewExercise({ ...newExercise, imageUrl: '' })}
                    >
                      <Ionicons name="close" size={16} color="#e53935" />
                      <Text style={styles.mediaButtonTextSecondary}>Rimuovi</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {newExercise.imageUrl && (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: newExercise.imageUrl }} style={styles.imagePreview} />
                    <Text style={styles.mediaSelectedText}>✅ Immagine selezionata</Text>
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Istruzioni</Text>
            <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Come eseguire l'esercizio..."
                  placeholderTextColor="#666"
              value={newExercise.instructions}
                  onChangeText={(text) => setNewExercise({ ...newExercise, instructions: text })}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </ScrollView>
          </View>
        </Modal>

        {/* PROGRAM DETAILS MODAL */}
        <Modal
          visible={showProgramDetails}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowProgramDetails(false)}>
                <Text style={styles.modalCancel}>Chiudi</Text>
                </TouchableOpacity>
              <Text style={styles.modalTitle}>Dettagli Programma</Text>
              <TouchableOpacity onPress={() => selectedProgram && startWorkout(selectedProgram)}>
                <Text style={styles.modalSave}>Inizia</Text>
                </TouchableOpacity>
              </View>

            <ScrollView style={styles.modalContent}>
              {selectedProgram && (
                <>
                  <View style={styles.detailsCard}>
                    <Text style={styles.detailsTitle}>{selectedProgram.name}</Text>
                    {selectedProgram.description && (
                      <Text style={styles.detailsDescription}>{selectedProgram.description}</Text>
                    )}
                    <Text style={styles.detailsInfo}>
                      📅 Creato il: {new Date(selectedProgram.created_at).toLocaleDateString('it-IT')}
                    </Text>
                    <Text style={styles.detailsInfo}>
                      🏋️ Esercizi: {selectedProgram.exercises?.length || 0}
                    </Text>
                    {selectedProgram.isLocal && (
                      <Text style={styles.localBadge}>💾 Salvato localmente</Text>
                    )}
                  </View>

                  <View style={styles.exercisesList}>
                    <Text style={styles.exercisesHeader}>Esercizi nel Programma:</Text>
                    {selectedProgram.exercises && selectedProgram.exercises.length > 0 ? (
                      selectedProgram.exercises.map((exercise, index) => (
                        <View key={index} style={styles.exerciseDetailCard}>
                          <View style={styles.exerciseDetailHeader}>
                            <View style={styles.exerciseDetailInfoContainer}>
                              <Text style={styles.exerciseDetailTitle}>{exercise.title || exercise.name}</Text>
                              {exercise.muscle_groups && (
                                <Text style={styles.exerciseDetailMuscle}>{exercise.muscle_groups}</Text>
                              )}
                              {exercise.sets && exercise.reps && (
                                <Text style={styles.exerciseDetailInfo}>
                                  {exercise.sets} serie × {exercise.reps} rep
                                </Text>
                              )}
                              {exercise.instructions && (
                                <Text style={styles.exerciseDetailInstructions}>{exercise.instructions}</Text>
                              )}
                            </View>
                            <TouchableOpacity
                              style={styles.removeExerciseButton}
                              onPress={() => removeExerciseFromProgram(selectedProgram, index)}
                            >
                              <Ionicons name="trash" size={20} color="#f44336" />
            </TouchableOpacity>
          </View>
                        </View>
                      ))
                    ) : (
                      <View style={styles.noExercises}>
                        <Text style={styles.noExercisesText}>Nessun esercizio ancora aggiunto</Text>
                      </View>
                    )}
                </View>
                </>
              )}
            </ScrollView>
            
            {/* PULSANTE FUORI DAL SCROLLVIEW - SEMPRE VISIBILE E FUNZIONANTE */}
            {selectedProgram && (
              <View style={styles.fixedButtonContainer}>
                <TouchableOpacity 
                  style={styles.addFirstExerciseButtonLarge}
                  onPress={() => {
                    console.log('🔥🔥🔥 PULSANTE PREMUTO!!! 🔥🔥🔥');
                    console.log('🔥 Programma selezionato:', selectedProgram?.name);
                    console.log('🔥 ID programma:', selectedProgram?.id);
                    console.log('🔥 Esercizi attuali:', selectedProgram?.exercises?.length || 0);
                    
                    // PRIMA: Chiudi il modal dettagli programma
                    console.log('🔥 Chiudendo modal dettagli...');
                    setShowProgramDetails(false);
                    
                    // DOPO: Apri il modal aggiunta esercizi
                    setTimeout(() => {
                      console.log('🔥 Aprendo modal aggiunta esercizi...');
                      setProgramForExercises(selectedProgram);
                      setSelectedExercisesToAdd([]);
                      setExerciseSearchQuery('');
                      setShowAddExerciseToProgram(true);
                      console.log('🔥 Modal aggiunta esercizi dovrebbe essere aperto ora!');
                    }, 300); // Aspetta che il primo modal si chiuda
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add-circle" size={40} color="#fff" />
                  <Text style={styles.addFirstExerciseTextLarge}>
                    {selectedProgram.exercises && selectedProgram.exercises.length > 0 ? 'AGGIUNGI ESERCIZI' : 'AGGIUNGI PRIMO ESERCIZIO'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Modal>

        {/* EXERCISE DETAILS MODAL */}
        <Modal
          visible={showExerciseDetails}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowExerciseDetails(false)}>
                <Text style={styles.modalCancel}>Chiudi</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Dettagli Esercizio</Text>
              <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.modalContent}>
              {selectedExercise && (
                <>
                  <View style={styles.detailsCard}>
                    <Text style={styles.detailsTitle}>{selectedExercise.title}</Text>
                    {selectedExercise.muscle_groups && (
                      <Text style={styles.detailsMuscle}>🎯 {selectedExercise.muscle_groups}</Text>
                    )}
                    
                    <View style={styles.exerciseStats}>
                      {selectedExercise.sets && (
                        <View style={styles.statItem}>
                          <Text style={styles.statLabel}>Serie</Text>
                          <Text style={styles.statValue}>{selectedExercise.sets}</Text>
                        </View>
                      )}
                      {selectedExercise.reps && (
                        <View style={styles.statItem}>
                          <Text style={styles.statLabel}>Ripetizioni</Text>
                          <Text style={styles.statValue}>{selectedExercise.reps}</Text>
                        </View>
                      )}
                      {selectedExercise.pause && (
                        <View style={styles.statItem}>
                          <Text style={styles.statLabel}>Pausa</Text>
                          <Text style={styles.statValue}>{selectedExercise.pause} {selectedExercise.pause_unit || 'sec'}</Text>
                        </View>
                      )}
                      {selectedExercise.difficulty && (
                        <View style={styles.statItem}>
                          <Text style={styles.statLabel}>Difficoltà</Text>
                          <Text style={styles.statValue}>{selectedExercise.difficulty}</Text>
                        </View>
                      )}
                    </View>

                    {selectedExercise.instructions && (
                      <View style={styles.instructionsSection}>
                        <Text style={styles.instructionsHeader}>📝 Istruzioni:</Text>
                        <Text style={styles.instructionsText}>{selectedExercise.instructions}</Text>
                      </View>
                    )}
                    
                    <Text style={styles.detailsInfo}>
                      📅 Creato il: {new Date(selectedExercise.created_at).toLocaleDateString('it-IT')}
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </Modal>

        {/* HISTORY DETAILS MODAL */}
        <Modal
          visible={showHistoryDetails}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowHistoryDetails(false)}>
                <Text style={styles.modalCancel}>Chiudi</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Allenamento Completato</Text>
              <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.modalContent}>
              {selectedHistoryWorkout && (
                <>
                  <View style={styles.detailsCard}>
                    <Text style={styles.detailsTitle}>{selectedHistoryWorkout.program_name}</Text>
                    <Text style={styles.detailsInfo}>
                      📅 {new Date(selectedHistoryWorkout.completed_at).toLocaleDateString('it-IT')} alle {new Date(selectedHistoryWorkout.completed_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Text style={styles.detailsInfo}>
                      ⏱️ Durata: {selectedHistoryWorkout.duration_minutes} minuti
                    </Text>
                    <Text style={styles.detailsInfo}>
                      🏋️ Esercizi completati: {selectedHistoryWorkout.exercises_done?.length || 0}
                    </Text>
                    {selectedHistoryWorkout.notes && (
                      <Text style={styles.detailsNotes}>📝 Note: {selectedHistoryWorkout.notes}</Text>
                    )}
                  </View>

                  <View style={styles.exercisesList}>
                    <Text style={styles.exercisesHeader}>Esercizi Completati:</Text>
                    {selectedHistoryWorkout.exercises_done && selectedHistoryWorkout.exercises_done.length > 0 ? (
                      selectedHistoryWorkout.exercises_done.map((exercise, index) => (
                        <View key={index} style={styles.exerciseDetailCard}>
                          <Text style={styles.exerciseDetailTitle}>{exercise.title || exercise.name}</Text>
                          {exercise.muscle_groups && (
                            <Text style={styles.exerciseDetailMuscle}>{exercise.muscle_groups}</Text>
                          )}
                          {exercise.sets && exercise.reps && (
                            <Text style={styles.exerciseDetailInfo}>
                              ✅ {exercise.sets} serie × {exercise.reps} rep
                            </Text>
                          )}
                        </View>
                      ))
                    ) : (
                      <View style={styles.noExercises}>
                        <Text style={styles.noExercisesText}>Nessun dettaglio disponibile</Text>
                      </View>
                    )}
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </Modal>

        {/* ADD EXERCISES TO PROGRAM MODAL */}
        <Modal
          visible={showAddExerciseToProgram}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setShowAddExerciseToProgram(false)}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              
              <View style={styles.headerCenter}>
                <Text style={styles.modalTitle}>
                  Aggiungi Esercizi
                </Text>
                {programForExercises && (
                  <Text style={styles.modalSubtitle}>
                    a "{programForExercises.name}"
                  </Text>
                )}
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.modalSaveButton,
                  selectedExercisesToAdd.length === 0 && styles.modalSaveButtonDisabled
                ]}
                onPress={addExercisesToProgram}
                disabled={selectedExercisesToAdd.length === 0}
              >
                <Ionicons name="checkmark" size={24} color="#fff" />
                <Text style={styles.modalSaveButtonText}>
                  AGGIUNGI ({selectedExercisesToAdd.length})
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              {/* Info Bar */}
              <View style={styles.infoBar}>
                <Text style={styles.infoText}>
                  📋 {exercises.length} esercizi disponibili
                </Text>
                <TouchableOpacity 
                  style={styles.quickCreateButton}
                  onPress={() => {
                    setShowAddExerciseToProgram(false);
                    setShowCreateExercise(true);
                  }}
                >
                  <Ionicons name="add" size={16} color="#e53935" />
                  <Text style={styles.quickCreateText}>Nuovo</Text>
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                  <Ionicons name="search" size={20} color="#999" />
            <TextInput
                    style={styles.searchInput}
                    placeholder="Cerca esercizi..."
                    placeholderTextColor="#999"
                    value={exerciseSearchQuery}
                    onChangeText={setExerciseSearchQuery}
          />
        </View>
              </View>

              {/* Selected Count */}
              {selectedExercisesToAdd.length > 0 && (
                <View style={styles.selectedCountContainer}>
                  <Text style={styles.selectedCountText}>
                    {selectedExercisesToAdd.length} esercizi selezionati
                  </Text>
                </View>
              )}

              {/* Exercises List */}
              <ScrollView 
                style={styles.exerciseSelectionList}
                showsVerticalScrollIndicator={false}
                bounces={true}
                scrollEventThrottle={16}
                decelerationRate="normal"
                contentContainerStyle={styles.exerciseSelectionContent}
              >
                {filteredExercisesForAdd.length > 0 ? (
                  filteredExercisesForAdd.map((exercise) => {
                    const isSelected = selectedExercisesToAdd.find(e => e.id === exercise.id);
                    const isAlreadyInProgram = programForExercises?.exercises?.find(e => e.id === exercise.id);
                    
                    return (
                      <TouchableOpacity
                        key={exercise.id}
                        style={[
                          styles.exerciseSelectionCard,
                          isSelected && styles.exerciseSelectionCardSelected,
                          isAlreadyInProgram && styles.exerciseSelectionCardDisabled
                        ]}
                        onPress={() => !isAlreadyInProgram && toggleExerciseSelection(exercise)}
                        disabled={isAlreadyInProgram}
                      >
                        <View style={styles.exerciseSelectionHeader}>
                          <View style={styles.exerciseSelectionInfo}>
                            <Text style={[
                              styles.exerciseSelectionTitle,
                              isAlreadyInProgram && styles.exerciseSelectionTitleDisabled
                            ]}>
                              {exercise.title}
                            </Text>
                            {exercise.muscle_groups && (
                              <Text style={[
                                styles.exerciseSelectionMuscle,
                                isAlreadyInProgram && styles.exerciseSelectionMuscleDisabled
                              ]}>
                                {exercise.muscle_groups}
                              </Text>
                            )}
                            {exercise.sets && exercise.reps && (
                              <Text style={[
                                styles.exerciseSelectionDetails,
                                isAlreadyInProgram && styles.exerciseSelectionDetailsDisabled
                              ]}>
                                {exercise.sets} serie × {exercise.reps} rep
                              </Text>
                            )}
                          </View>
                          <View style={styles.exerciseSelectionActions}>
                            {isAlreadyInProgram ? (
                              <View style={styles.alreadyAddedBadge}>
                                <Text style={styles.alreadyAddedText}>Già presente</Text>
                              </View>
                            ) : (
                              <View style={[
                                styles.selectionCheckbox,
                                isSelected && styles.selectionCheckboxSelected
                              ]}>
                                {isSelected && (
                                  <Ionicons name="checkmark" size={16} color="#fff" />
                                )}
                              </View>
                            )}
                          </View>
                        </View>
              </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="fitness" size={60} color="#666" />
                    <Text style={styles.emptyStateText}>
                      {exerciseSearchQuery ? 'Nessun esercizio trovato' : 'Nessun esercizio disponibile'}
                    </Text>
                    <Text style={styles.emptyStateSubtext}>
                      {exerciseSearchQuery ? 'Prova con un termine diverso' : 'Crea il tuo primo esercizio per iniziare'}
                    </Text>
                    {!exerciseSearchQuery && (
                      <View style={styles.emptyActions}>
                        <TouchableOpacity 
                          style={styles.createExerciseButtonLarge}
                          onPress={() => {
                            // Salva il programma corrente per auto-aggiunta
                            console.log('🔥 Creazione esercizio da aggiungere automaticamente a:', programForExercises?.name);
                            setShowAddExerciseToProgram(false);
                            setShowCreateExercise(true);
                          }}
                        >
                          <Ionicons name="add-circle" size={40} color="#fff" />
                          <Text style={styles.createExerciseTextLarge}>CREA ESERCIZIO</Text>
              </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={styles.addSampleButtonLarge}
                          onPress={async () => {
                            // Aggiungi esercizio di esempio
                            const sampleExercise = {
                              id: 'sample_' + Date.now(),
                              title: 'Panca Piana',
                              sets: '3',
                              reps: '10',
                              muscle_groups: 'Petto, Tricipiti',
                              instructions: 'Esercizio di esempio per testare',
                              created_at: new Date().toISOString()
                            };
                            setExercises(prev => [sampleExercise, ...prev]);
                            Alert.alert('✅ Esercizio di esempio aggiunto!', 'Ora puoi selezionarlo e aggiungerlo al programma');
                          }}
                        >
                          <Ionicons name="flash" size={36} color="#fff" />
                          <Text style={styles.addSampleTextLarge}>AGGIUNGI ESEMPIO</Text>
            </TouchableOpacity>
          </View>
                    )}
              </View>
                )}
      </ScrollView>
            </View>
          </View>
        </Modal>

        {/* ADD MY WORKOUT MODAL */}
        <Modal
          visible={showAddWorkout}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowAddWorkout(false)}>
                <Text style={styles.modalCancel}>Annulla</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Registra Allenamento</Text>
              <TouchableOpacity onPress={handleAddWorkout} disabled={loading}>
                <Text style={[styles.modalSave, loading && { opacity: 0.5 }]}>
                  {loading ? 'Salvando...' : 'Salva'}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome Allenamento *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="es. Upper Body - Push"
                  placeholderTextColor="#666"
                  value={newWorkout.name}
                  onChangeText={(text) => setNewWorkout({ ...newWorkout, name: text })}
        />
      </View>

              <View style={{ marginBottom: 12 }}>
                {Platform.OS === 'web' ? (
                  <input
                    type="date"
                    value={newWorkout.date}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={e => {
                      const val = e.target.value;
                      if (val > new Date().toISOString().split('T')[0]) {
                        setDateError('Non puoi selezionare una data futura');
                      } else {
                        setDateError('');
                        setNewWorkout({ ...newWorkout, date: val });
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 8,
                      border: '1px solid #e53935',
                      background: '#fff',
                      color: '#e53935',
                      fontWeight: 'bold',
                      fontSize: 16,
                      textAlign: 'center',
                    }}
                  />
                ) : (
                  <>
                    <TouchableOpacity
                      style={{
                        borderWidth: 1,
                        borderColor: '#e53935',
                        borderRadius: 8,
                        padding: 12,
                        backgroundColor: '#fff',
                        alignItems: 'center',
                      }}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text style={{ color: '#e53935', fontWeight: 'bold' }}>
                        {newWorkout.date ? new Date(newWorkout.date).toLocaleDateString('it-IT') : 'Seleziona data'}
                      </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={newWorkout.date ? new Date(newWorkout.date) : new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, selectedDate) => {
                          setShowDatePicker(Platform.OS === 'ios');
                          if (selectedDate) {
                            if (selectedDate > new Date()) {
                              setDateError('Non puoi selezionare una data futura');
                            } else {
                              setDateError('');
                              setNewWorkout({ ...newWorkout, date: selectedDate.toISOString().split('T')[0] });
                            }
                          }
                        }}
                        maximumDate={new Date()}
                      />
                    )}
                  </>
                )}
                {!!dateError && <Text style={{ color: 'red', marginTop: 4 }}>{dateError}</Text>}
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Durata (min)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="45"
                    placeholderTextColor="#666"
                    value={newWorkout.duration}
                    onChangeText={(text) => setNewWorkout({ ...newWorkout, duration: text })}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Calorie</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="300"
                    placeholderTextColor="#666"
                    value={newWorkout.calories}
                    onChangeText={(text) => setNewWorkout({ ...newWorkout, calories: text })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Difficoltà</Text>
                <View style={styles.difficultySelector}>
                  {['Facile', 'Media', 'Difficile'].map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.difficultyOption,
                        newWorkout.difficulty === level && styles.difficultyOptionSelected
                      ]}
                      onPress={() => setNewWorkout({ ...newWorkout, difficulty: level })}
                    >
                      <Text style={[
                        styles.difficultyText,
                        newWorkout.difficulty === level && styles.difficultyTextSelected
                      ]}>
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Umore</Text>
                <View style={styles.difficultySelector}>
                  {['Ottimo', 'Buono', 'Normale', 'Stanchezza'].map((mood) => (
                    <TouchableOpacity
                      key={mood}
                      style={[
                        styles.difficultyOption,
                        newWorkout.mood === mood && styles.difficultyOptionSelected
                      ]}
                      onPress={() => setNewWorkout({ ...newWorkout, mood: mood })}
                    >
                      <Text style={[
                        styles.difficultyText,
                        newWorkout.mood === mood && styles.difficultyTextSelected
                      ]}>
                        {mood}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Note (opzionale)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Come ti sei sentito? Note particolari..."
                  placeholderTextColor="#666"
                  value={newWorkout.notes}
                  onChangeText={(text) => setNewWorkout({ ...newWorkout, notes: text })}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Foto Allenamento (opzionale)</Text>
                <View style={styles.mediaButtonsContainer}>
                  <TouchableOpacity style={styles.mediaButton} onPress={takeWorkoutPhoto}>
                    <Ionicons name="camera" size={16} color="#fff" />
                    <Text style={styles.mediaButtonText}>Scatta Foto</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.mediaButton} onPress={pickWorkoutImage}>
                    <Ionicons name="images" size={16} color="#fff" />
                    <Text style={styles.mediaButtonText}>Galleria</Text>
                  </TouchableOpacity>
                </View>
                {newWorkout.imageUrl && (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: newWorkout.imageUrl }} style={styles.imagePreview} />
                    <Text style={styles.mediaSelectedText}>✅ Immagine selezionata</Text>
                  </View>
                )}
      </View>
    </ScrollView>
          </View>
        </Modal>

        {/* MY WORKOUT DETAILS MODAL */}
        <Modal
          visible={showMyWorkoutDetails}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowMyWorkoutDetails(false)}>
                <Text style={styles.modalCancel}>Chiudi</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Dettagli Allenamento</Text>
              <View style={styles.headerRight} />
            </View>
            <ScrollView style={styles.modalContent}>
              {(() => {
                try {
                  if (!selectedMyWorkout || !selectedMyWorkout.id) {
                    return <Text style={{ color: 'red', margin: 20 }}>Errore: workout non valido o dati mancanti.</Text>;
                  }
                  console.log('Render modale workout:', selectedMyWorkout);
                  return (
                    <>
                      <View style={styles.detailsCard}>
                        <Text style={styles.detailsTitle}>{selectedMyWorkout.name}</Text>
                        <Text style={styles.detailsInfo}>
                          📅 {new Date(selectedMyWorkout.date).toLocaleDateString('it-IT', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Text>
                        {selectedMyWorkout.duration && (
                          <Text style={styles.detailsInfo}>
                            ⏱️ Durata: {selectedMyWorkout.duration} minuti
                          </Text>
                        )}
                        {selectedMyWorkout.calories && (
                          <Text style={styles.detailsInfo}>
                            🔥 Calorie: {selectedMyWorkout.calories} cal
                          </Text>
                        )}
                        <Text style={styles.detailsInfo}>
                          💪 Difficoltà: {selectedMyWorkout.difficulty}
                        </Text>
                        <Text style={styles.detailsInfo}>
                          😊 Umore: {selectedMyWorkout.mood}
                        </Text>
                        {selectedMyWorkout.notes && (
                          <Text style={styles.detailsNotes}>📝 Note: {selectedMyWorkout.notes}</Text>
                        )}
                      </View>

                      {selectedMyWorkout.image_url && (
                        <View style={styles.imagePreviewContainer}>
                          <Image source={{ uri: selectedMyWorkout.image_url }} style={styles.myWorkoutImage} />
                        </View>
                      )}

                      <View style={styles.exercisesList}>
                        <Text style={styles.exercisesHeader}>Esercizi Registrati:</Text>
                        {selectedMyWorkout.exercises && selectedMyWorkout.exercises.length > 0 ? (
                          selectedMyWorkout.exercises.map((exercise, index) => (
                            <View key={index} style={styles.exerciseDetailCard}>
                              <Text style={styles.exerciseDetailTitle}>{exercise.title || exercise.name}</Text>
                              {exercise.muscle_groups && (
                                <Text style={styles.exerciseDetailMuscle}>{exercise.muscle_groups}</Text>
                              )}
                              {exercise.sets && exercise.reps && (
                                <Text style={styles.exerciseDetailInfo}>
                                  ✅ {exercise.sets} serie × {exercise.reps} rep
                                </Text>
                              )}
                            </View>
                          ))
                        ) : (
                          <View style={styles.noExercises}>
                            <Text style={styles.noExercisesText}>Nessun esercizio registrato</Text>
                          </View>
                        )}
                      </View>

                      {/* 4. Nella modale dettagli, aggiungi pulsante 'Segna come fatto/non fatto' */}
                      {selectedMyWorkout && (
                        <TouchableOpacity
                          style={{
                            backgroundColor: selectedMyWorkout.completed ? '#bbb' : '#4caf50',
                            borderRadius: 20,
                            padding: 12,
                            alignItems: 'center',
                            marginVertical: 16,
                          }}
                          onPress={() => toggleWorkoutCompleted(selectedMyWorkout)}
                        >
                          <Ionicons name={selectedMyWorkout.completed ? 'close-circle' : 'checkmark-circle'} size={22} color="#fff" />
                          <Text style={{ color: '#fff', fontWeight: 'bold', marginTop: 4 }}>
                            {selectedMyWorkout.completed ? 'Segna come da fare' : 'Segna come fatto'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </>
                  );
                } catch (e) {
                  console.error('Errore rendering dettagli workout:', e);
                  return <Text style={{ color: 'red', margin: 20 }}>Errore di rendering dettagli workout.</Text>;
                }
              })()}
            </ScrollView>
          </View>
        </Modal>

        {/* Bottom Navigation Spacer */}
        <View style={styles.bottomSpacer} />
      </View>
    );
  } catch (err) {
    console.error('Errore rendering WorkoutScreen:', err);
    return (
      <View style={styles.container}>
        <Text style={{ color: 'red', margin: 24, fontWeight: 'bold' }}>
          Errore grave: {String(err)}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1a1a1a',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: 40,
  },
  headerLeft: {
    width: 40,
  },
  loadingBarContainer: {
    height: 3,
    backgroundColor: 'rgba(229, 57, 53, 0.2)',
  },
  loadingBar: {
    height: '100%',
    backgroundColor: '#e53935',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    margin: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  tabButtonActive: {
    backgroundColor: '#e53935',
    shadowColor: '#e53935',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 6,
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabContent: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e53935',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  programCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  programHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  programName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  programActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  startButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4caf50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f44336',
    alignItems: 'center',
    justifyContent: 'center',
  },
  programDescription: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 8,
  },
  programInfo: {
    fontSize: 14,
    color: '#999',
  },
  historyCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyProgramName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  historyDate: {
    fontSize: 14,
    color: '#999',
  },
  historyInfo: {
    fontSize: 14,
    color: '#ccc',
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    marginLeft: 10,
  },
  exerciseCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  exerciseMuscle: {
    fontSize: 14,
    color: '#e53935',
    marginBottom: 8,
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#ccc',
  },
  exerciseDifficulty: {
    fontSize: 12,
    color: '#999',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalCancel: {
    fontSize: 16,
    color: '#999',
  },
  modalSave: {
    fontSize: 16,
    color: '#e53935',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  bottomSpacer: {
    height: 170, // Aumentato per i bottoni ancora più alti
    backgroundColor: 'transparent',
  },
  detailsCard: {
    padding: 20,
    backgroundColor: '#2a2a2a',
    borderRadius: 15,
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  detailsDescription: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 8,
  },
  detailsInfo: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  localBadge: {
    fontSize: 12,
    color: '#e53935',
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  exercisesList: {
    marginBottom: 20,
  },
  exercisesHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  exerciseDetailCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  exerciseDetailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  exerciseDetailMuscle: {
    fontSize: 14,
    color: '#e53935',
    marginBottom: 8,
  },
  exerciseDetailInfo: {
    fontSize: 14,
    color: '#ccc',
  },
  noExercises: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noExercisesText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  noExercisesSubtext: {
    fontSize: 14,
    color: '#999',
  },
  detailsMuscle: {
    fontSize: 14,
    color: '#e53935',
    marginBottom: 8,
  },
  exerciseStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#999',
    marginRight: 8,
  },
  statValue: {
    fontSize: 14,
    color: '#fff',
  },
  instructionsSection: {
    marginBottom: 20,
  },
  instructionsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#ccc',
  },
  detailsNotes: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  exerciseDetailInstructions: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    fontStyle: 'italic',
  },
  // Stili per aggiunta esercizi
  exercisesHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e53935',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addExerciseText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  addFirstExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    paddingVertical: 12,
  },
  addFirstExerciseText: {
    color: '#e53935',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalSaveDisabled: {
    color: '#666',
  },
  selectedCountContainer: {
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 15,
  },
  selectedCountText: {
    color: '#e53935',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  exerciseSelectionList: {
    flex: 1,
  },
  exerciseSelectionContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  exerciseSelectionCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  exerciseSelectionCardSelected: {
    borderColor: '#e53935',
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
  },
  exerciseSelectionCardDisabled: {
    opacity: 0.5,
    backgroundColor: '#1f1f1f',
  },
  exerciseSelectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseSelectionInfo: {
    flex: 1,
  },
  exerciseSelectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  exerciseSelectionTitleDisabled: {
    color: '#666',
  },
  exerciseSelectionMuscle: {
    fontSize: 14,
    color: '#e53935',
    marginBottom: 4,
  },
  exerciseSelectionMuscleDisabled: {
    color: '#666',
  },
  exerciseSelectionDetails: {
    fontSize: 12,
    color: '#ccc',
  },
  exerciseSelectionDetailsDisabled: {
    color: '#666',
  },
  exerciseSelectionActions: {
    marginLeft: 15,
  },
  selectionCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionCheckboxSelected: {
    backgroundColor: '#e53935',
    borderColor: '#e53935',
  },
  alreadyAddedBadge: {
    backgroundColor: '#666',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  alreadyAddedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  createExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  createExerciseText: {
    color: '#e53935',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
  },
  infoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  quickCreateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e53935',
  },
  quickCreateText: {
    color: '#e53935',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyActions: {
    alignItems: 'center',
    marginTop: 20,
  },
  addSampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  addSampleText: {
    color: '#4caf50',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  addButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e53935',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#e53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  startButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4caf50',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  deleteButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f44336',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#f44336',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  addExerciseButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e53935',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#e53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 180,
    justifyContent: 'center',
  },
  addExerciseTextLarge: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  addFirstExerciseButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e53935',
    paddingVertical: 25, // Più grande
    paddingHorizontal: 40, // Più grande
    borderRadius: 30, // Più arrotondato
    marginTop: 20,
    shadowColor: '#e53935',
    shadowOffset: { width: 0, height: 8 }, // Ombra più grande
    shadowOpacity: 0.4,
    shadowRadius: 15, // Ombra più diffusa
    elevation: 12,
    minWidth: 300, // Larghezza minima
  },
  addFirstExerciseTextLarge: {
    color: '#fff',
    fontSize: 20, // Testo più grande
    fontWeight: 'bold',
    marginLeft: 15, // Più spazio dall'icona
    textTransform: 'uppercase',
  },
  modalSaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4caf50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
    justifyContent: 'center',
  },
  modalSaveButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.5,
  },
  modalSaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  createExerciseButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e53935',
    paddingVertical: 22, // Più grande
    paddingHorizontal: 35, // Più grande
    borderRadius: 30, // Più arrotondato
    marginTop: 20,
    shadowColor: '#e53935',
    shadowOffset: { width: 0, height: 6 }, // Ombra migliore
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    minWidth: 280, // Larghezza minima
  },
  createExerciseTextLarge: {
    color: '#fff',
    fontSize: 19, // Testo più grande
    fontWeight: 'bold',
    marginLeft: 12,
    textTransform: 'uppercase',
  },
  addSampleButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4caf50',
    paddingVertical: 22, // Più grande
    paddingHorizontal: 35, // Più grande
    borderRadius: 30, // Più arrotondato
    marginTop: 15,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 6 }, // Ombra migliore
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    minWidth: 280, // Larghezza minima
  },
  addSampleTextLarge: {
    color: '#fff',
    fontSize: 19, // Testo più grande
    fontWeight: 'bold',
    marginLeft: 12,
    textTransform: 'uppercase',
  },
  centerButtonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  difficultySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  difficultyOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#666',
    alignItems: 'center',
  },
  difficultyOptionSelected: {
    backgroundColor: '#e53935',
    borderColor: '#e53935',
  },
  difficultyText: {
    fontSize: 14,
    color: '#999',
  },
  difficultyTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  mediaButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e53935',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
    flex: 1,
    marginHorizontal: 2,
    justifyContent: 'center',
  },
  mediaButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e53935',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  mediaButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  mediaButtonTextSecondary: {
    color: '#e53935',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  mediaSelectedText: {
    color: '#4caf50',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  imagePreview: {
    width: 200,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  exerciseDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  exerciseDetailInfoContainer: {
    flex: 1,
    marginRight: 10,
  },
  removeExerciseButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  // Stili per la sezione "I Miei Allenamenti"
  myWorkoutCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  myWorkoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  myWorkoutInfo: {
    flex: 1,
    marginRight: 10,
  },
  myWorkoutName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  myWorkoutDate: {
    fontSize: 14,
    color: '#999',
    textTransform: 'capitalize',
  },
  myWorkoutActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  myWorkoutStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 6,
  },
  statText: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 4,
    fontWeight: '600',
  },
  myWorkoutNotes: {
    fontSize: 14,
    color: '#ccc',
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 20,
  },
  myWorkoutImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginTop: 8,
  },
  // Stili corretti per gli esercizi
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addToProgramButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  exerciseMuscles: {
    fontSize: 14,
    color: '#4caf50',
    marginBottom: 8,
    fontWeight: '600',
  },
  exerciseStat: {
    fontSize: 14,
    color: '#ccc',
  },
  exerciseDifficulty: {
    fontSize: 12,
    color: '#ff9800',
    fontWeight: '600',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
}); 