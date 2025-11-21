import React, { useState } from 'react';
import {View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBabyStore } from '../store/babyStore';
import { useTimerStore } from '../store/timerStore';
import { FeedingService } from '../services/feedingService';
import { Button } from '../components/Button';
import { Timer } from '../components/Timer';
import { ModalHeader } from '../components/ModalHeader';
import { Feeding } from '../types';
import { format } from 'date-fns';

interface AddFeedingScreenProps {
  navigation: any;
}

export const AddFeedingScreen: React.FC<AddFeedingScreenProps> = ({ navigation }) => {
  const { getCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();
  
  const {
    isRunning,
    side: activeSide,
    leftDuration,
    rightDuration,
    startTimer,
    stopTimer,
    resetTimer,
    sessionStartTime,
  } = useTimerStore();
  
  const [feedingType, setFeedingType] = useState<Feeding['type']>('breast');
  const [milkAmount, setMilkAmount] = useState('');
  const [milkBrand, setMilkBrand] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  
  const handleStartStop = (side: 'left' | 'right') => {
    if (isRunning && activeSide === side) {
      stopTimer();
    } else if (!isRunning) {
      startTimer(side);
    }
  };
  
  const handleSave = async () => {
    if (!currentBaby) {
      Alert.alert('错误', '请先选择宝宝');
      return;
    }
    
    // 验证数据
    if (feedingType === 'breast') {
      if (leftDuration === 0 && rightDuration === 0) {
        Alert.alert('提示', '请至少记录一侧的哺乳时长');
        return;
      }
    } else {
      if (!milkAmount || parseFloat(milkAmount) <= 0) {
        Alert.alert('提示', '请输入有效的奶量');
        return;
      }
    }
    
    setSaving(true);
    try {
      const feedingData: Omit<Feeding, 'id' | 'createdAt' | 'updatedAt'> = {
        babyId: currentBaby.id,
        time: Date.now(),
        type: feedingType,
      };
      
      if (feedingType === 'breast') {
        feedingData.leftDuration = Math.floor(leftDuration / 60); // 转换为分钟
        feedingData.rightDuration = Math.floor(rightDuration / 60);
      } else {
        feedingData.milkAmount = parseFloat(milkAmount);
        if (feedingType === 'formula' && milkBrand) {
          feedingData.milkBrand = milkBrand;
        }
      }
      
      if (notes) {
        feedingData.notes = notes;
      }
      
      await FeedingService.create(feedingData);
      
      // 重置表单
      resetTimer();
      setMilkAmount('');
      setMilkBrand('');
      setNotes('');
      
      // 关闭页面
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save feeding:', error);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setSaving(false);
    }
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
      <ModalHeader
        title="记录喂养"
        onCancel={() => navigation.goBack()}
        onSave={handleSave}
        saving={saving}
        disabled={isRunning}
      />
      
      <KeyboardAvoidingView 

      
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}

      
        style={{ flex: 1 }}

      
        keyboardVerticalOffset={0}

      
      >

      
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
        {/* 类型选择 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>喂养类型</Text>
          <View style={styles.typeButtons}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                feedingType === 'breast' && styles.typeButtonActive,
              ]}
              onPress={() => setFeedingType('breast')}
            >
              <Ionicons
                name="woman"
                size={24}
                color={feedingType === 'breast' ? '#007AFF' : '#8E8E93'}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  feedingType === 'breast' && styles.typeButtonTextActive,
                ]}
              >
                亲喂母乳
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.typeButton,
                feedingType === 'bottled_breast_milk' && styles.typeButtonActive,
              ]}
              onPress={() => setFeedingType('bottled_breast_milk')}
            >
              <Ionicons
                name="water"
                size={24}
                color={feedingType === 'bottled_breast_milk' ? '#007AFF' : '#8E8E93'}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  feedingType === 'bottled_breast_milk' && styles.typeButtonTextActive,
                ]}
              >
                瓶喂母乳
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.typeButton,
                feedingType === 'formula' && styles.typeButtonActive,
              ]}
              onPress={() => setFeedingType('formula')}
            >
              <Ionicons
                name="nutrition"
                size={24}
                color={feedingType === 'formula' ? '#007AFF' : '#8E8E93'}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  feedingType === 'formula' && styles.typeButtonTextActive,
                ]}
              >
                配方奶
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* 亲喂母乳 - 计时器 */}
        {feedingType === 'breast' && (
          <View style={styles.section}>
            {/* 哺乳开始时间 */}
            {sessionStartTime && (
              <View style={styles.sessionInfo}>
                <Ionicons name="time-outline" size={16} color="#8E8E93" />
                <Text style={styles.sessionInfoText}>
                  开始时间：{format(new Date(sessionStartTime), 'HH:mm')}
                </Text>
              </View>
            )}
            
            <Text style={styles.sectionTitle}>哺乳时长</Text>
            <View style={styles.timersRow}>
              <View style={styles.timerContainer}>
                <Timer side="left" />
                <Button
                  title={isRunning && activeSide === 'left' ? '停止' : '开始'}
                  onPress={() => handleStartStop('left')}
                  variant={isRunning && activeSide === 'left' ? 'danger' : 'primary'}
                  style={styles.timerButton}
                />
              </View>
              
              <View style={styles.timerContainer}>
                <Timer side="right" />
                <Button
                  title={isRunning && activeSide === 'right' ? '停止' : '开始'}
                  onPress={() => handleStartStop('right')}
                  variant={isRunning && activeSide === 'right' ? 'danger' : 'primary'}
                  style={styles.timerButton}
                />
              </View>
            </View>
          </View>
        )}
        
        {/* 瓶喂母乳/配方奶 - 奶量输入 */}
        {feedingType !== 'breast' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>奶量 (ml)</Text>
            <TextInput
              style={styles.input}
              value={milkAmount}
              onChangeText={setMilkAmount}
              keyboardType="numeric"
              placeholder="请输入奶量"
              placeholderTextColor="#C7C7CC"
            />
          </View>
        )}
        
        {/* 配方奶 - 品牌输入 */}
        {feedingType === 'formula' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>奶粉品牌（可选）</Text>
            <TextInput
              style={styles.input}
              value={milkBrand}
              onChangeText={setMilkBrand}
              placeholder="请输入奶粉品牌"
              placeholderTextColor="#C7C7CC"
            />
          </View>
        )}
        
        {/* 备注 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>备注（可选）</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="如：吐奶、喝得很急等"
            placeholderTextColor="#C7C7CC"
            multiline
            numberOfLines={3}
          />
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>

      
      </KeyboardAvoidingView>
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
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  sessionInfoText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 6,
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
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  typeButtonTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  timersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerButton: {
    marginTop: 12,
    minWidth: 100,
  },
  input: {
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000000',
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

