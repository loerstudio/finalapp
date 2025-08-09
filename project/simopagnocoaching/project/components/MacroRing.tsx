import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface MacroRingProps {
  label: string;
  current: number;
  target: number;
  color: string;
  size?: number;
}

export default function MacroRing({ label, current, target, color, size = 80 }: MacroRingProps) {
  const progress = Math.min(current / target, 1);
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  
  const remaining = Math.max(target - current, 0);
  const isOverTarget = current > target;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F3F4F6"
          strokeWidth="4"
          fill="transparent"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isOverTarget ? '#EF4444' : color}
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      
      <View style={styles.content}>
        <Text style={[styles.current, { color: isOverTarget ? '#EF4444' : color }]}>
          {Math.round(current)}
        </Text>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.remaining}>
          {isOverTarget ? `+${Math.round(current - target)}` : Math.round(remaining)} left
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  current: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 1,
  },
  remaining: {
    fontSize: 9,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
});