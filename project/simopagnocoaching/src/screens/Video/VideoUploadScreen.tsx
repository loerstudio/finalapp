import React, { useState, useContext } from 'react';
import { Alert } from 'react-native';
import styled from 'styled-components/native';
import * as ImagePicker from 'expo-image-picker';
import { MediaContext } from '../../context/MediaContext';
import { theme } from '../../styles/theme';

const Container = styled.ScrollView`
  flex: 1;
  background-color: ${theme.colors.background};
  padding: ${theme.spacing.md}px;
`;

const UploadButton = styled.TouchableOpacity`
  background-color: ${theme.colors.primary};
  padding: ${theme.spacing.lg}px;
  border-radius: ${theme.borderRadius.medium}px;
  align-items: center;
  margin-bottom: ${theme.spacing.md}px;
`;

const SecondaryButton = styled.TouchableOpacity`
  background-color: ${theme.colors.secondary};
  padding: ${theme.spacing.lg}px;
  border-radius: ${theme.borderRadius.medium}px;
  align-items: center;
  margin-bottom: ${theme.spacing.md}px;
`;

const ButtonText = styled.Text`
  color: white;
  font-size: ${theme.fonts.size.lg}px;
  font-weight: bold;
`;

const Input = styled.TextInput`
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium}px;
  padding: ${theme.spacing.md}px;
  margin-bottom: ${theme.spacing.md}px;
  font-size: ${theme.fonts.size.md}px;
`;

const PreviewContainer = styled.View`
  margin-top: ${theme.spacing.md}px;
`;

export default function VideoUploadScreen() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { uploadVideo } = useContext(MediaContext);

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permessi necessari', 'Abbiamo bisogno dei permessi per accedere alla galleria');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedVideo(result.assets[0].uri);
    }
  };

  const recordVideo = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permessi necessari', 'Abbiamo bisogno dei permessi per usare la fotocamera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedVideo(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!selectedVideo || !title.trim()) {
      Alert.alert('Errore', 'Seleziona un video e inserisci un titolo');
      return;
    }

    try {
      await uploadVideo({
        uri: selectedVideo,
        title: title.trim(),
        description: description.trim(),
      });
      Alert.alert('Successo', 'Video caricato con successo!');
      setSelectedVideo(null);
      setTitle('');
      setDescription('');
    } catch (error) {
      Alert.alert('Errore', 'Errore nel caricamento del video');
    }
  };

  return (
    <Container>
      <UploadButton onPress={pickVideo}>
        <ButtonText>Scegli dalla Galleria</ButtonText>
      </UploadButton>
      
      <SecondaryButton onPress={recordVideo}>
        <ButtonText>Registra Video</ButtonText>
      </SecondaryButton>

      {selectedVideo && (
        <PreviewContainer>
          <Input
            placeholder="Titolo del video"
            value={title}
            onChangeText={setTitle}
          />
          <Input
            placeholder="Descrizione (opzionale)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
          <UploadButton onPress={handleUpload}>
            <ButtonText>Carica Video</ButtonText>
          </UploadButton>
        </PreviewContainer>
      )}
    </Container>
  );
} 