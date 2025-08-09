import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function IntegrationScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Integration Screen (Integrazioni)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181818',
  },
  text: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
  },
}); 