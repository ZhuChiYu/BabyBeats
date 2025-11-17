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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PumpingService } from '../services/pumpingService';
import { ModalHeader } from '../components/ModalHeader';
import { Pumping } from '../types';
import { Colors } from '../constants';

interface EditPumpingScreenProps {
  navigation: any;
  route: {
    params: {
      pumpingId: string;
    };
  };
}

export const EditPumpingScreen: React.FC<EditPumpingScreenProps> = ({ navigation, route }) => {
  const { pumpingId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [method, setMethod] = useState<Pumping['method']>('electric');
  const [leftAmount, setLeftAmount] = useState('');
  const [rightAmount, setRightAmount] = useState('');
  const [storageMethod, setStorageMethod] = useState<Pumping['storageMethod']>('refrigerate');
  const [notes, setNotes] = useState('');
  
  const totalAmount = (parseFloat(leftAmount) || 0) + (parseFloat(rightAmount) || 0);
  
  useEffect(() => {
    loadPumping();
  }, [pumpingId]);
  
  const loadPumping = async () => {
    try {
      const pumping = await PumpingService.getById(pumpingId);
      if (!pumping) {
        Alert.alert('错误', '记录不存在', [
          { text: '确定', onPress: () => navigation.goBack() },
        ]);
        return;
      }
      
      setMethod(pumping.method);
      setLeftAmount(String(pumping.leftAmount || 0));
      setRightAmount(String(pumping.rightAmount || 0));
      setStorageMethod(pumping.storageMethod);
      setNotes(pumping.notes || '');
    } catch (error) {
      Alert.alert('错误', '加载失败', [
        { text: '确定', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async () => {
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
      await PumpingService.update(pumpingId, {
        method,
        leftAmount: parseFloat(leftAmount) || 0,
        rightAmount: parseFloat(rightAmount) || 0,
        totalAmount,
        storageMethod,
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
        title="编辑挤奶记录"
        onCancel={() => navigation.goBack()}
        onSave={handleSave}
        saving={saving}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 挤奶方式 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>挤奶方式</Text>
          <View style={styles.typeButtons}>
            {[
              { value: 'electric', label: '电动', icon: 'flash' },
              { value: 'manual', label: '手动', icon: 'hand-left' },
              { value: 'other', label: '其他', icon: 'ellipsis-horizontal' },
            ].map((m) => (
              <TouchableOpacity
                key={m.value}
                style={[
                  styles.typeButton,
                  method === m.value && styles.typeButtonActive,
                ]}
                onPress={() => setMethod(m.value as Pumping['method'])}
              >
                <Ionicons
                  name={m.icon as any}
                  size={24}
                  color={method === m.value ? Colors.primary : '#8E8E93'}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    method === m.value && styles.typeButtonTextActive,
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
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
                  color={storageMethod === option.value ? Colors.primary : '#8E8E93'}
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
    color: Colors.primary,
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
    color: Colors.primary,
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
    borderColor: Colors.primary,
  },
  optionButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  optionButtonTextActive: {
    color: Colors.primary,
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
});

