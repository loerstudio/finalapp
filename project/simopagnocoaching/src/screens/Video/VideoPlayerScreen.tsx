import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

const VideoPlayerScreen = ({ route, navigation }) => {
  const { videoUri, title } = route.params;
  const [status, setStatus] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      title: title || 'Riproduci Video',
    });
  }, [title, navigation]);

  const handlePlaybackStatusUpdate = (status) => {
    setStatus(status);
    if (status.isLoaded && isLoading) {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Caricamento video...</Text>
        </View>
      )}
      
      <Video
        source={{ uri: videoUri }}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        useNativeControls
        style={styles.video}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back-circle" size={50} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  loadingText: {
    color: theme.colors.white,
    marginTop: 10,
    fontFamily: theme.fonts.medium,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 20,
  },
});

export default VideoPlayerScreen; 