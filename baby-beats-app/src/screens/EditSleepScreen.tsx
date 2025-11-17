import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { SleepService } from '../services/sleepService';
import { ModalHeader } from '../components/ModalHeader';
import { Sleep } from '../types';
import { Colors } from '../constants';
import { format } from 'date-fns';

interface EditSleepScreenProps {
  navigation: any;
  route: {
    params: {
      sleepId: string;
    };
  };
}

export const EditSleepScreen: React.FC<EditSleepScreenProps> = ({ navigation, route }) => {
  const { sleepId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [sleepType, setSleepType] = useState<Sleep['sleepType']>('nap');
  const [notes, setNotes] = useState('');
  
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  
  useEffect(() => {
    loadSleep();
  }, [sleepId]);
  
  const loadSleep = async () => {
    try {
      const sleep = await SleepService.getById(sleepId);
      if (!sleep) {
        Alert.alert('错误', '记录不存在', [
          { text: '确定', onPress: () => navigation.goBack() },
        ]);
        return;
      }
      
      setStartTime(new Date(sleep.startTime));
      setEndTime(new Date(sleep.endTime));
      setSleepType(sleep.sleepType);
      setNotes(sleep.notes || '');
    } catch (error) {
      Alert.alert('错误', '加载失败', [
        { text: '确定', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async () => {
    if (endTime <= startTime) {
      Alert.alert('提示', '结束时间必须晚于开始时间');
      return;
    }
    
    const duration = (endTime.getTime() - startTime.getTime()) / 60000;
    if (duration > 720) {
      Alert.alert('提示', '睡眠时长超过12小时，请确认时间是否正确');
      return;
    }
    
    setSaving(true);
    try {
      await SleepService.update(sleepId, {
        startTime: startTime.getTime(),
        endTime: endTime.getTime(),
        sleepType,
        duration: Math.round(duration),
        notes: notes || undefined,
      });
      
      navigation.goBack();
    } catch (error) {
      Alert.alert('错误', '更新失败，请重试');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {

    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ModalHeader
        title="编辑睡眠记录"
        onCancel={() => navigation.goBack()}
        onSave={handleSave}
        saving={saving}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 睡眠类型 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>睡眠类型</Text>
          <View style={styles.typeButtons}>
            {[
              { value: 'nap', label: '白天小睡', icon: 'sunny' },
              { value: 'night', label: '夜间睡眠', icon: 'moon' },
            ].map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeButton,
                  sleepType === type.value && styles.typeButtonActive,
                ]}
                onPress={() => setSleepType(type.value as Sleep['sleepType'])}
              >
                <Ionicons
                  name={type.icon as any}
                  size={24}
                  color={sleepType === type.value ? Colors.primary : '#8E8E93'}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    sleepType === type.value && styles.typeButtonTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* 开始时间 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>开始时间</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={styles.timeButtonText}>
              {format(startTime, 'yyyy-MM-dd HH:mm')}
            </Text>
            <Ionicons name="time-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startTime}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowStartPicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setStartTime(selectedDate);
                }
              }}
              maximumDate={new Date()}
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
            <Text style={styles.timeButtonText}>
              {format(endTime, 'yyyy-MM-dd HH:mm')}
            </Text>
            <Ionicons name="time-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endTime}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowEndPicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setEndTime(selectedDate);
                }
              }}
              maximumDate={new Date()}
            />
          )}
        </View>
        
        {/* 睡眠时长 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>睡眠时长</Text>
          <View style={styles.durationDisplay}>
            <Text style={styles.durationText}>
              {Math.floor((endTime.getTime() - startTime.getTime()) / 3600000)} 小时{' '}
              {Math.round(((endTime.getTime() - startTime.getTime()) % 3600000) / 60000)} 分钟
            </Text>
          </View>
        </View>
        
        {/* 备注 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>备注（可选）</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="如：多次惊醒、哭闹等"
            placeholderTextColor="#C7C7CC"
            multiline
            numberOfLines={4}
          />
        </View>
        
        <View style={{ height: 40 }} />
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
    color: '#000000',
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
    borderColor: Colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  typeButtonTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  timeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    padding: 16,
  },
  timeButtonText: {
    fontSize: 16,
    color: '#000000',
  },
  durationDisplay: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  durationText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
  },
  input: {
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000000',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});

