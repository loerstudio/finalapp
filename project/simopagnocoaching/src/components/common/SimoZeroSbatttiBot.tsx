import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, Image, Text, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const SimoZeroSbatttiBot = () => {
  const navigation = useNavigation<any>();
  const floatAnim = useRef(new Animated.Value(0)).current;
  const [imgError, setImgError] = React.useState(false);

  let routeName = undefined;
  try {
    const route = useRoute();
    routeName = route?.name;
    console.log('ROUTE:', routeName); // DEBUG
  } catch (e) {
    // Navigazione non pronta o errore: fallback, mostra comunque il bottone
    routeName = undefined;
  }
  if (routeName === 'ChatbotScreen' || window.location.pathname.includes('ChatbotScreen')) return null;
  // Se routeName non è definito, mostra comunque il bottone (fallback)

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 8,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);

  return (
    <Animated.View style={[styles.fabContainer, { transform: [{ translateY: floatAnim }] }]}> 
      <TouchableOpacity
        style={styles.fabButton}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('ChatbotScreen')}
      >
        {!imgError ? (
          <Image
            source={require('../../assets/images/SPC073-removebg-preview.png')}
            style={styles.fabImage}
            onError={() => setImgError(true)}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.fabFallback}>AI</Text>
        )}
        <View style={styles.fabBadge}><Text style={styles.fabBadgeText}>AI</Text></View>
        <Text style={styles.fabLabel}>Chatbot</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 110,
    right: 40,
    zIndex: 99999,
  },
  fabButton: {
    backgroundColor: 'white',
    borderColor: '#e53935',
    borderWidth: 4,
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#e53935',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'visible',
  },
  fabImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  fabFallback: {
    fontSize: 28,
    color: '#e53935',
    fontWeight: 'bold',
  },
  fabBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#e53935',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#e53935',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  fabBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
  },
  fabLabel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 8,
    textAlign: 'center',
    color: '#e53935',
    fontWeight: '700',
    fontSize: 14,
    pointerEvents: 'none',
  },
});

export default SimoZeroSbatttiBot; 