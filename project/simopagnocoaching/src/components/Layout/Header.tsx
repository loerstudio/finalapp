import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

interface HeaderProps {
  onOpenNewsletter: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenNewsletter }) => {
  return (
    <>
      {/* Newsletter Banner */}
      <View style={styles.newsletterBanner}>
        <Text style={styles.newsletterText}>Rimani aggiornato sulle ultime novità!</Text>
        <TouchableOpacity style={styles.iniziaBtn} onPress={onOpenNewsletter}>
          <Text style={styles.iniziaBtnText}>INIZIA QUI</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation */}
      <View style={styles.navbar}>
        <View style={styles.logo}>
          <View style={styles.logoIcon}>
            <Text>🏃</Text>
          </View>
          <View style={styles.logoText}>
            <Text style={[styles.logoTextRed]}>SIMOPAGNO</Text>
            <Text style={styles.logoTextWhite}>COACHING</Text>
          </View>
        </View>

        <View style={styles.navMenu}>
          <TouchableOpacity><Text style={styles.navLink}>Chi sono</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.navLink}>Blog</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.navLink}>Nutrizione</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.navLink}>Allenamento</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.navLink}>Padel</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.navLink}>Formazione</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.navLink}>Listino</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.navLink}>Contatto</Text></TouchableOpacity>
        </View>

        <View style={styles.socialIcons}>
          <Text style={styles.socialText}>CONTATTAMI SU</Text>
          <TouchableOpacity style={styles.socialIcon}><Text>f</Text></TouchableOpacity>
          <TouchableOpacity style={styles.socialIcon}><Text>📷</Text></TouchableOpacity>
          <TouchableOpacity style={styles.socialIcon}><Text>▶</Text></TouchableOpacity>
          <TouchableOpacity style={styles.socialIcon}><Text>🎵</Text></TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  newsletterBanner: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsletterText: {
    color: theme.colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  iniziaBtn: {
    backgroundColor: theme.colors.black,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 25,
  },
  iniziaBtnText: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 40,
    height: 40,
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    gap: 5,
  },
  logoTextRed: {
    color: theme.colors.primary,
    fontWeight: '800',
    fontSize: 18,
  },
  logoTextWhite: {
    color: theme.colors.white,
    fontWeight: '800',
    fontSize: 18,
  },
  navMenu: {
    flexDirection: 'row',
    gap: 30,
  },
  navLink: {
    color: theme.colors.white,
    fontWeight: '600',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
  socialText: {
    color: theme.colors.white,
    fontSize: 14,
    marginRight: 10,
  },
  socialIcon: {
    width: 35,
    height: 35,
    backgroundColor: '#333',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Header; 