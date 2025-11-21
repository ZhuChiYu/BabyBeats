import React, { useState, useEffect } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { FeedingService } from '../services/feedingService';
import { ModalHeader } from '../components/ModalHeader';
import { Feeding } from '../types';
import { Colors } from '../constants';
import { format } from 'date-fns';

interface EditFeedingScreenProps {
  navigation: any;
  route: {
    params: {
      feedingId: string;
    };
  };
}

export const EditFeedingScreen: React.FC<EditFeedingScreenProps> = ({ navigation, route }) => {
  const { feedingId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [feedingType, setFeedingType] = useState<'breast' | 'bottled_breast_milk' | 'formula'>('breast');
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // 亲喂数据
  const [leftDuration, setLeftDuration] = useState('0');
  const [rightDuration, setRightDuration] = useState('0');
  
  // 瓶喂/配方奶数据
  const [milkAmount, setMilkAmount] = useState('');
  const [milkBrand, setMilkBrand] = useState('');
  
  const [notes, setNotes] = useState('');
  
  useEffect(() => {
    loadFeeding();
  }, [feedingId]);
  
  const loadFeeding = async () => {
    try {
      const feeding = await FeedingService.getById(feedingId);
      if (!feeding) {
        Alert.alert('错误', '记录不存在', [
          { text: '确定', onPress: () => navigation.goBack() },
        ]);
        return;
      }
      
      setFeedingType(feeding.type);
      setTime(new Date(feeding.time));
      
      if (feeding.type === 'breast') {
        setLeftDuration(String(feeding.leftDuration || 0));
        setRightDuration(String(feeding.rightDuration || 0));
      } else {
        setMilkAmount(String(feeding.milkAmount || ''));
        if (feeding.type === 'formula') {
          setMilkBrand(feeding.milkBrand || '');
        }
      }
      
      setNotes(feeding.notes || '');
    } catch (error) {
      Alert.alert('错误', '加载失败', [
        { text: '确定', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: Partial<Feeding> = {
        time: time.getTime(),
        type: feedingType,
        notes: notes || undefined,
      };
      
      if (feedingType === 'breast') {
        updates.leftDuration = parseInt(leftDuration) || 0;
        updates.rightDuration = parseInt(rightDuration) || 0;
      } else {
        const amount = parseFloat(milkAmount);
        if (isNaN(amount) || amount <= 0) {
          Alert.alert('错误', '请输入有效的奶量');
          setSaving(false);
          return;
        }
        updates.milkAmount = amount;
        if (feedingType === 'formula') {
          updates.milkBrand = milkBrand || undefined;
        }
      }
      
      await FeedingService.update(feedingId, updates);
      
      // 关闭页面
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
        title="编辑喂养记录"
        onCancel={() => navigation.goBack()}
        onSave={handleSave}
        saving={saving}
      />
      
      <KeyboardAvoidingView 

      
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}

      
        style={{ flex: 1 }}

      
        keyboardVerticalOffset={0}

      
      >

      
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
        {/* 喂养类型 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>喂养类型</Text>
          <View style={styles.typeSelector}>
            {[
              { value: 'breast', label: '亲喂母乳', icon: 'woman' },
              { value: 'bottled_breast_milk', label: '瓶喂母乳', icon: 'water' },
              { value: 'formula', label: '配方奶', icon: 'nutrition' },
            ].map(type => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeButton,
                  feedingType === type.value && styles.typeButtonActive,
                ]}
                onPress={() => setFeedingType(type.value as any)}
              >
                <Ionicons
                  name={type.icon as any}
                  size={24}
                  color={feedingType === type.value ? '#FFFFFF' : '#8E8E93'}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    feedingType === type.value && styles.typeButtonTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* 时间 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>时间</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Ionicons name="time-outline" size={20} color={Colors.primary} />
            <Text style={styles.timeButtonText}>
              {format(time, 'yyyy-MM-dd HH:mm')}
            </Text>
          </TouchableOpacity>
          
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="datetime"
              display="spinner"
              onChange={(event, selectedDate) => {
                setShowTimePicker(false);
                if (selectedDate) {
                  setTime(selectedDate);
                }
              }}
            />
          )}
        </View>
        
        {/* 数据输入 */}
        {feedingType === 'breast' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>哺乳时长</Text>
            <View style={styles.durationRow}>
              <View style={styles.durationItem}>
                <Text style={styles.inputLabel}>左侧（分钟）</Text>
                <TextInput
                  style={styles.input}
                  value={leftDuration}
                  onChangeText={setLeftDuration}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              <View style={styles.durationItem}>
                <Text style={styles.inputLabel}>右侧（分钟）</Text>
                <TextInput
                  style={styles.input}
                  value={rightDuration}
                  onChangeText={setRightDuration}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>奶量</Text>
            <TextInput
              style={styles.input}
              value={milkAmount}
              onChangeText={setMilkAmount}
              keyboardType="numeric"
              placeholder="输入奶量（ml）"
            />
            
            {feedingType === 'formula' && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 16 }]}>品牌（可选）</Text>
                <TextInput
                  style={styles.input}
                  value={milkBrand}
                  onChangeText={setMilkBrand}
                  placeholder="输入奶粉品牌"
                />
              </>
            )}
          </View>
        )}
        
        {/* 备注 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>备注（可选）</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="添加备注..."
            multiline
            numberOfLines={4}
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
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    marginTop: 8,
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  timeButtonText: {
    fontSize: 16,
    color: '#000000',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  durationItem: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#000000',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

