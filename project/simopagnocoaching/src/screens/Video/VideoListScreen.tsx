import React, { useContext } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { MediaContext } from '../../context/MediaContext';
import { theme } from '../../styles/theme';

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md}px;
`;

const Title = styled.Text`
  font-size: ${theme.fonts.size.xl}px;
  font-family: ${theme.fonts.bold};
  color: ${theme.colors.text};
`;

const AddButton = styled.TouchableOpacity`
  background-color: ${theme.colors.primary};
  padding: ${theme.spacing.sm}px ${theme.spacing.md}px;
  border-radius: ${theme.borderRadius.medium}px;
`;

const AddButtonText = styled.Text`
  color: white;
  font-family: ${theme.fonts.bold};
`;

const VideoCard = styled.TouchableOpacity`
  background-color: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.medium}px;
  margin: ${theme.spacing.sm}px ${theme.spacing.md}px;
  padding: ${theme.spacing.md}px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const VideoTitle = styled.Text`
  font-size: ${theme.fonts.size.lg}px;
  font-family: ${theme.fonts.bold};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.sm}px;
`;

const VideoDate = styled.Text`
  font-size: ${theme.fonts.size.sm}px;
  color: ${theme.colors.textSecondary};
  font-family: ${theme.fonts.regular};
`;

const EmptyState = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.xl}px;
`;

const EmptyText = styled.Text`
  font-size: ${theme.fonts.size.lg}px;
  color: ${theme.colors.textSecondary};
  text-align: center;
  font-family: ${theme.fonts.regular};
`;

export default function VideoListScreen() {
  const navigation = useNavigation();
  const { videos } = useContext(MediaContext);

  const renderVideoItem = ({ item }: { item: any }) => (
    <VideoCard onPress={() => console.log('Play video:', item.id)}>
      <VideoTitle>{item.title}</VideoTitle>
      <VideoDate>{new Date(item.createdAt).toLocaleDateString('it-IT')}</VideoDate>
    </VideoCard>
  );

  return (
    <Container>
      <Header>
        <Title>I tuoi Video</Title>
        <AddButton onPress={() => navigation.navigate('VideoUpload' as never)}>
          <AddButtonText>Aggiungi</AddButtonText>
        </AddButton>
      </Header>

      {videos.length === 0 ? (
        <EmptyState>
          <EmptyText>Nessun video caricato.{'\n'}Inizia caricando il tuo primo video!</EmptyText>
        </EmptyState>
      ) : (
        <FlatList
          data={videos}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Container>
  );
} 