import React, { useState } from 'react';
import {View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBabyStore } from '../store/babyStore';
import { PumpingService } from '../services/pumpingService';
import { ModalHeader } from '../components/ModalHeader';
import { Pumping } from '../types';

interface AddPumpingScreenProps {
  navigation: any;
}

export const AddPumpingScreen: React.FC<AddPumpingScreenProps> = ({ navigation }) => {
  const { getCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();
  
  const [method, setMethod] = useState<Pumping['method']>('electric');
  const [leftAmount, setLeftAmount] = useState('');
  const [rightAmount, setRightAmount] = useState('');
  const [storageMethod, setStorageMethod] = useState<Pumping['storageMethod']>('refrigerate');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  
  const totalAmount = (parseFloat(leftAmount) || 0) + (parseFloat(rightAmount) || 0);
  
  const handleSave = async () => {
    if (!currentBaby) {
      Alert.alert('错误', '请先选择宝宝');
      return;
    }
    
    if (!leftAmount && !rightAmount) {
      Alert.alert('提示', '请至少输入一侧的挤奶量');
      return;
    }
    
    if (totalAmount <= 0) {
      Alert.alert('提示', '请输入有效的挤奶量');
      return;
    }
    
    setSaving(true);
    try {
      await PumpingService.create({
        babyId: currentBaby.id,
        time: Date.now(),
        method,
        leftAmount: parseFloat(leftAmount) || 0,
        rightAmount: parseFloat(rightAmount) || 0,
        storageMethod,
        notes: notes || undefined,
      });
      
      // 重置表单
      setLeftAmount('');
      setRightAmount('');
      setNotes('');
      
      // 关闭页面
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save pumping:', error);
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
        title="记录挤奶"
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
        {/* 挤奶方式 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>挤奶方式</Text>
          <View style={styles.typeButtons}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                method === 'electric' && styles.typeButtonActive,
              ]}
              onPress={() => setMethod('electric')}
            >
              <Ionicons
                name="flash"
                size={24}
                color={method === 'electric' ? '#007AFF' : '#8E8E93'}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  method === 'electric' && styles.typeButtonTextActive,
                ]}
              >
                电动
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.typeButton,
                method === 'manual' && styles.typeButtonActive,
              ]}
              onPress={() => setMethod('manual')}
            >
              <Ionicons
                name="hand-left"
                size={24}
                color={method === 'manual' ? '#007AFF' : '#8E8E93'}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  method === 'manual' && styles.typeButtonTextActive,
                ]}
              >
                手动
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.typeButton,
                method === 'other' && styles.typeButtonActive,
              ]}
              onPress={() => setMethod('other')}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={24}
                color={method === 'other' ? '#007AFF' : '#8E8E93'}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  method === 'other' && styles.typeButtonTextActive,
                ]}
              >
                其他
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* 挤奶量 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>挤奶量 (ml)</Text>
          <View style={styles.amountRow}>
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>左侧</Text>
              <TextInput
                style={styles.amountInput}
                value={leftAmount}
                onChangeText={setLeftAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#C7C7CC"
              />
              <Text style={styles.amountUnit}>ml</Text>
            </View>
            
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>右侧</Text>
              <TextInput
                style={styles.amountInput}
                value={rightAmount}
                onChangeText={setRightAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#C7C7CC"
              />
              <Text style={styles.amountUnit}>ml</Text>
            </View>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>总量：</Text>
            <Text style={styles.totalValue}>{totalAmount} ml</Text>
          </View>
        </View>
        
        {/* 存放方式 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>存放方式</Text>
          <View style={styles.optionButtons}>
            {[
              { value: 'refrigerate', label: '冷藏', icon: 'snow' },
              { value: 'freeze', label: '冷冻', icon: 'snow-outline' },
              { value: 'feed_now', label: '立即喂', icon: 'time' },
              { value: 'other', label: '其他', icon: 'ellipsis-horizontal' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  storageMethod === option.value && styles.optionButtonActive,
                ]}
                onPress={() => setStorageMethod(option.value as Pumping['storageMethod'])}
              >
                <Ionicons
                  name={option.icon as any}
                  size={20}
                  color={storageMethod === option.value ? '#007AFF' : '#8E8E93'}
                />
                <Text
                  style={[
                    styles.optionButtonText,
                    storageMethod === option.value && styles.optionButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* 备注 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>备注（可选）</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="如：堵奶、有疼痛感等"
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
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  amountContainer: {
    flex: 1,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  amountInput: {
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    minWidth: 100,
  },
  amountUnit: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
  },
  totalLabel: {
    fontSize: 18,
    color: '#000000',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  optionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    margin: 4,
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  optionButtonTextActive: {
    color: '#007AFF',
    fontWeight: '600',
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

