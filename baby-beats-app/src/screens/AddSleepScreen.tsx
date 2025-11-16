import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useBabyStore } from '../store/babyStore';
import { SleepService } from '../services/sleepService';
import { Button } from '../components/Button';
import { Sleep } from '../types';

export const AddSleepScreen: React.FC = () => {
  const { getCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();
  
  const [startTime, setStartTime] = useState(new Date(Date.now() - 2 * 60 * 60 * 1000)); // 2小时前
  const [endTime, setEndTime] = useState(new Date());
  const [sleepType, setSleepType] = useState<Sleep['sleepType']>('nap');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  
  const handleSave = async () => {
    if (!currentBaby) {
      Alert.alert('错误', '请先选择宝宝');
      return;
    }
    
    if (endTime <= startTime) {
      Alert.alert('提示', '结束时间必须晚于开始时间');
      return;
    }
    
    const duration = (endTime.getTime() - startTime.getTime()) / 60000; // 分钟
    if (duration > 720) { // 超过12小时
      Alert.alert('提示', '睡眠时长超过12小时，请确认时间是否正确');
      return;
    }
    
    setSaving(true);
    try {
      await SleepService.create({
        babyId: currentBaby.id,
        startTime: startTime.getTime(),
        endTime: endTime.getTime(),
        sleepType,
        notes: notes || undefined,
      });
      
      Alert.alert('成功', '睡眠记录已保存', [
        {
          text: '确定',
          onPress: () => {
            // 重置表单
            setStartTime(new Date(Date.now() - 2 * 60 * 60 * 1000));
            setEndTime(new Date());
            setNotes('');
          },
        },
      ]);
    } catch (error) {
      console.error('Failed to save sleep:', error);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };
  
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDuration = (): string => {
    const minutes = Math.floor((endTime.getTime() - startTime.getTime()) / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}小时${mins}分钟`;
  };
  
  if (!currentBaby) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>请先创建宝宝档案</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 睡眠类型 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>睡眠类型</Text>
          <View style={styles.typeButtons}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                sleepType === 'nap' && styles.typeButtonActive,
              ]}
              onPress={() => setSleepType('nap')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  sleepType === 'nap' && styles.typeButtonTextActive,
                ]}
              >
                白天小睡
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.typeButton,
                sleepType === 'night' && styles.typeButtonActive,
              ]}
              onPress={() => setSleepType('night')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  sleepType === 'night' && styles.typeButtonTextActive,
                ]}
              >
                夜间睡眠
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* 开始时间 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>开始时间</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={styles.timeText}>{formatTime(startTime)}</Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startTime}
              mode="time"
              is24Hour={true}
              display="spinner"
              onChange={(event, selectedDate) => {
                setShowStartPicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setStartTime(selectedDate);
                }
              }}
            />
          )}
        </View>
        
        {/* 结束时间 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>结束时间</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowEndPicker(true)}
          >
            <Text style={styles.timeText}>{formatTime(endTime)}</Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endTime}
              mode="time"
              is24Hour={true}
              display="spinner"
              onChange={(event, selectedDate) => {
                setShowEndPicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setEndTime(selectedDate);
                }
              }}
            />
          )}
        </View>
        
        {/* 睡眠时长 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>睡眠时长</Text>
          <View style={styles.durationDisplay}>
            <Text style={styles.durationText}>{formatDuration()}</Text>
          </View>
        </View>
        
        {/* 备注 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>备注（可选）</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="如：多次惊醒、哭闹等"
            placeholderTextColor="#C7C7CC"
            multiline
            numberOfLines={3}
          />
        </View>
        
        <View style={styles.footer}>
          <Button
            title="保存"
            onPress={handleSave}
            size="large"
            loading={saving}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  typeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 4,
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  typeButtonTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  timeButton: {
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  durationDisplay: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  durationText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  input: {
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000',
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 16,
  },
  saveButton: {
    width: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#8E8E93',
  },
});

