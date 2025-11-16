import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTimerStore } from '../store/timerStore';

interface TimerProps {
  side?: 'left' | 'right';
}

export const Timer: React.FC<TimerProps> = ({ side }) => {
  const { isRunning, side: activeSide, getCurrentDuration, leftDuration, rightDuration } = useTimerStore();
  const [displayTime, setDisplayTime] = useState(0);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && activeSide === side) {
      interval = setInterval(() => {
        setDisplayTime(getCurrentDuration());
      }, 1000);
    } else if (side === 'left') {
      setDisplayTime(leftDuration);
    } else if (side === 'right') {
      setDisplayTime(rightDuration);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, activeSide, side, getCurrentDuration, leftDuration, rightDuration]);
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const isActive = isRunning && activeSide === side;
  
  return (
    <View style={[styles.container, isActive && styles.active]}>
      <Text style={styles.label}>
        {side === 'left' ? '左侧' : '右侧'}
      </Text>
      <Text style={[styles.time, isActive && styles.activeTime]}>
        {formatTime(displayTime)}
      </Text>
      {isActive && <View style={styles.pulse} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    position: 'relative',
  },
  active: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  time: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    fontVariant: ['tabular-nums'],
  },
  activeTime: {
    color: '#007AFF',
  },
  pulse: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
});

