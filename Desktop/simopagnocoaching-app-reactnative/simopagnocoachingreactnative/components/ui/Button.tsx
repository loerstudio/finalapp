import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'right',
  style,
  textStyle,
}: ButtonProps) {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyleArray = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  const renderIcon = () => {
    if (!icon || loading) return null;
    
    const iconColor = variant === 'primary' ? Colors.fitness.background : Colors.fitness.primary;
    const iconSize = size === 'large' ? 24 : size === 'medium' ? 20 : 16;
    
    return (
      <Ionicons 
        name={icon} 
        size={iconSize} 
        color={iconColor} 
        style={iconPosition === 'left' ? styles.iconLeft : styles.iconRight}
      />
    );
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? Colors.fitness.background : Colors.fitness.primary} 
          size="small" 
        />
      ) : (
        <>
          {iconPosition === 'left' && renderIcon()}
          <Text style={textStyleArray}>{title}</Text>
          {iconPosition === 'right' && renderIcon()}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // Variants
  primary: {
    backgroundColor: Colors.fitness.primary,
    shadowColor: Colors.fitness.primary,
    shadowOpacity: 0.3,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.fitness.primary,
  },
  outline: {
    backgroundColor: Colors.fitness.surface,
    borderWidth: 1,
    borderColor: Colors.fitness.card,
  },
  
  // Sizes
  small: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  medium: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  large: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    gap: 16,
  },
  
  // States
  disabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  
  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: Colors.fitness.background,
  },
  secondaryText: {
    color: Colors.fitness.primary,
  },
  outlineText: {
    color: Colors.fitness.textPrimary,
  },
  
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  
  disabledText: {
    opacity: 0.6,
  },
  
  // Icon styles
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
