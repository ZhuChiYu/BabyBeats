import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTimerStore } from '../store/timerStore';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { Colors } from '../constants';

export const LiveTimerCard: React.FC = () => {
  const navigation = useNavigation();
  const { isRunning, side, sessionStartTime, leftDuration, rightDuration, getCurrentDuration } = useTimerStore();
  const [currentDuration, setCurrentDuration] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setCurrentDuration(getCurrentDuration());
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // 如果没有进行中的计时，不显示
  if (!isRunning && leftDuration === 0 && rightDuration === 0) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
    if (isRunning) {
      return leftDuration + rightDuration + currentDuration;
    }
    return leftDuration + rightDuration;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('AddFeeding' as never)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="time" size={24} color={Colors.feeding} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isRunning ? '哺乳进行中' : '哺乳已暂停'}
          </Text>
          {isRunning && (
            <View style={styles.liveDot}>
              <View style={styles.liveDotInner} />
            </View>
          )}
        </View>
        
        {sessionStartTime && (
          <Text style={styles.startTime}>
            开始于 {format(new Date(sessionStartTime), 'HH:mm')}
          </Text>
        )}
        
        <View style={styles.durationRow}>
          <View style={styles.durationItem}>
            <Text style={styles.durationLabel}>左侧</Text>
            <Text style={styles.durationValue}>
              {formatTime(side === 'left' && isRunning ? leftDuration + currentDuration : leftDuration)}
            </Text>
          </View>
          
          <View style={styles.durationItem}>
            <Text style={styles.durationLabel}>右侧</Text>
            <Text style={styles.durationValue}>
              {formatTime(side === 'right' && isRunning ? rightDuration + currentDuration : rightDuration)}
            </Text>
          </View>
          
          <View style={styles.durationItem}>
            <Text style={styles.durationLabel}>总计</Text>
            <Text style={[styles.durationValue, styles.totalValue]}>
              {formatTime(getTotalDuration())}
            </Text>
          </View>
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9F0',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFE5CC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFE5CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginRight: 8,
  },
  liveDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  startTime: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 12,
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationItem: {
    alignItems: 'center',
  },
  durationLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 4,
  },
  durationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.feeding,
    fontVariant: ['tabular-nums'],
  },
  totalValue: {
    fontSize: 18,
    color: '#FF3B30',
  },
});

