import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface InputProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
}

export default function Input({
  label,
  icon,
  error,
  containerStyle,
  labelStyle,
  inputStyle,
  ...textInputProps
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}
      
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        {icon && (
          <Ionicons 
            name={icon} 
            size={24} 
            color={error ? Colors.fitness.error : Colors.fitness.primary} 
            style={styles.icon}
          />
        )}
        
        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor={Colors.fitness.textMuted}
          {...textInputProps}
        />
      </View>
      
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.fitness.textPrimary,
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.fitness.surface,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 2,
    borderColor: Colors.fitness.card,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputError: {
    borderColor: Colors.fitness.error,
  },
  icon: {
    marginRight: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.fitness.textPrimary,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    color: Colors.fitness.error,
    marginTop: 8,
    marginLeft: 4,
  },
});
