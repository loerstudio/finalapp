import React from 'react';
import styled from 'styled-components/native';
import { theme } from '../../styles/theme';

const Container = styled.ScrollView`
  flex: 1;
  background-color: ${theme.colors.background};
  padding: ${theme.spacing.md}px;
`;

const ProfileImage = styled.View`
  width: 150px;
  height: 150px;
  border-radius: 75px;
  background-color: ${theme.colors.primary};
  align-self: center;
  margin-bottom: ${theme.spacing.lg}px;
  justify-content: center;
  align-items: center;
`;

const ProfileInitials = styled.Text`
  font-size: ${theme.fonts.size.xxxl}px;
  font-family: ${theme.fonts.bold};
  color: white;
`;

const Title = styled.Text`
  font-size: ${theme.fonts.size.xxl}px;
  font-family: ${theme.fonts.bold};
  color: ${theme.colors.text};
  text-align: center;
  margin-bottom: ${theme.spacing.md}px;
`;

const Subtitle = styled.Text`
  font-size: ${theme.fonts.size.lg}px;
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin-bottom: ${theme.spacing.xl}px;
  font-family: ${theme.fonts.medium};
`;

const Section = styled.View`
  margin-bottom: ${theme.spacing.xl}px;
`;

const SectionTitle = styled.Text`
  font-size: ${theme.fonts.size.xl}px;
  font-family: ${theme.fonts.bold};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.md}px;
`;

const SectionText = styled.Text`
  font-size: ${theme.fonts.size.md}px;
  color: ${theme.colors.textSecondary};
  line-height: 24px;
  font-family: ${theme.fonts.regular};
`;

export default function AboutScreen() {
  return (
    <Container>
      <ProfileImage>
        <ProfileInitials>SP</ProfileInitials>
      </ProfileImage>

      <Title>Simone Pagnottoni</Title>
      <Subtitle>Personal Trainer & Padel Coach</Subtitle>

      <Section>
        <SectionTitle>Chi Sono</SectionTitle>
        <SectionText>
          Sono un personal trainer e coach di padel con anni di esperienza nel settore del fitness e dello sport.
          La mia missione è aiutare le persone a raggiungere i loro obiettivi attraverso allenamenti personalizzati
          e un approccio olistico al benessere.
        </SectionText>
      </Section>

      <Section>
        <SectionTitle>Esperienza</SectionTitle>
        <SectionText>
          • Personal Trainer certificato{'\n'}
          • Coach di Padel professionista{'\n'}
          • Specializzato in nutrizione sportiva{'\n'}
          • Esperto in programmazione degli allenamenti{'\n'}
          • Formatore per professionisti del fitness
        </SectionText>
      </Section>

      <Section>
        <SectionTitle>La Mia Filosofia</SectionTitle>
        <SectionText>
          Credo che il successo nel fitness e nello sport derivi da un approccio equilibrato che combina
          allenamento, nutrizione e benessere mentale. Il mio obiettivo è guidare i miei clienti verso
          uno stile di vita sano e sostenibile, aiutandoli a raggiungere risultati duraturi.
        </SectionText>
      </Section>
    </Container>
  );
} 