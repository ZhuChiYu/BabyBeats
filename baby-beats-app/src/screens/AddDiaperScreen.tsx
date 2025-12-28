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
import { DiaperService } from '../services/diaperService';
import { ModalHeader } from '../components/ModalHeader';
import { Diaper } from '../types';

interface AddDiaperScreenProps {
  navigation: any;
}

export const AddDiaperScreen: React.FC<AddDiaperScreenProps> = ({ navigation }) => {
  const { getCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();
  
  const [diaperType, setDiaperType] = useState<Diaper['type']>('both');
  const [poopConsistency, setPoopConsistency] = useState<Diaper['poopConsistency']>('normal');
  const [poopColor, setPoopColor] = useState<Diaper['poopColor']>('yellow');
  const [poopAmount, setPoopAmount] = useState<Diaper['poopAmount']>('medium');
  const [peeAmount, setPeeAmount] = useState<Diaper['peeAmount']>('medium');
  const [hasAbnormality, setHasAbnormality] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  
  const handleSave = async () => {
    if (!currentBaby) {
      Alert.alert('错误', '请先选择宝宝');
      return;
    }
    
    setSaving(true);
    try {
      await DiaperService.create({
        babyId: currentBaby.id,
        time: Date.now(),
        type: diaperType,
        poopConsistency: diaperType !== 'pee' ? poopConsistency : undefined,
        poopColor: diaperType !== 'pee' ? poopColor : undefined,
        poopAmount: diaperType !== 'pee' ? poopAmount : undefined,
        peeAmount: diaperType !== 'poop' ? peeAmount : undefined,
        hasAbnormality,
        notes: notes || undefined,
      });
      
      // 重置表单
      setDiaperType('both');
      setPoopConsistency('normal');
      setPoopColor('yellow');
      setPoopAmount('medium');
      setPeeAmount('medium');
      setHasAbnormality(false);
      setNotes('');
      
      // 关闭页面
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save diaper:', error);
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
        title="记录尿布"
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
        {/* 类型选择 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>尿布类型</Text>
          <View style={styles.typeButtons}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                diaperType === 'poop' && styles.typeButtonActive,
              ]}
              onPress={() => setDiaperType('poop')}
            >
              <Ionicons
                name="water"
                size={24}
                color={diaperType === 'poop' ? '#FF9500' : '#8E8E93'}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  diaperType === 'poop' && styles.typeButtonTextActive,
                ]}
              >
                大便
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.typeButton,
                diaperType === 'pee' && styles.typeButtonActive,
              ]}
              onPress={() => setDiaperType('pee')}
            >
              <Ionicons
                name="water-outline"
                size={24}
                color={diaperType === 'pee' ? '#34C759' : '#8E8E93'}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  diaperType === 'pee' && styles.typeButtonTextActive,
                ]}
              >
                小便
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.typeButton,
                diaperType === 'both' && styles.typeButtonActive,
              ]}
              onPress={() => setDiaperType('both')}
            >
              <Ionicons
                name="water"
                size={24}
                color={diaperType === 'both' ? '#007AFF' : '#8E8E93'}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  diaperType === 'both' && styles.typeButtonTextActive,
                ]}
              >
                都有
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* 大便详情 */}
        {(diaperType === 'poop' || diaperType === 'both') && (
          <>
            {/* 性质 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>大便性质</Text>
              <View style={styles.optionButtons}>
                {[
                  { value: 'loose', label: '稀' },
                  { value: 'normal', label: '正常' },
                  { value: 'hard', label: '干硬' },
                  { value: 'other', label: '其他' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      poopConsistency === option.value && styles.optionButtonActive,
                    ]}
                    onPress={() => setPoopConsistency(option.value as Diaper['poopConsistency'])}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        poopConsistency === option.value && styles.optionButtonTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* 颜色 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>大便颜色</Text>
              <View style={styles.optionButtons}>
                {[
                  { value: 'yellow', label: '黄色', emoji: '🟡' },
                  { value: 'green', label: '绿色', emoji: '🟢' },
                  { value: 'brown', label: '褐色', emoji: '🟤' },
                  { value: 'black', label: '黑色', emoji: '⚫' },
                  { value: 'dark', label: '深色', emoji: '🔵' },
                  { value: 'red', label: '红色', emoji: '🔴' },
                  { value: 'white', label: '白色', emoji: '⚪' },
                  { value: 'orange', label: '橙色', emoji: '🟠' },
                  { value: 'other', label: '其他', emoji: '' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      poopColor === option.value && styles.optionButtonActive,
                    ]}
                    onPress={() => setPoopColor(option.value as Diaper['poopColor'])}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        poopColor === option.value && styles.optionButtonTextActive,
                      ]}
                    >
                      {option.emoji && `${option.emoji} `}{option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* 量级 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>大便量</Text>
              <View style={styles.optionButtons}>
                {[
                  { value: 'small', label: '少' },
                  { value: 'medium', label: '中' },
                  { value: 'large', label: '多' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      poopAmount === option.value && styles.optionButtonActive,
                    ]}
                    onPress={() => setPoopAmount(option.value as Diaper['poopAmount'])}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        poopAmount === option.value && styles.optionButtonTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
        
        {/* 小便详情 */}
        {(diaperType === 'pee' || diaperType === 'both') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>小便量</Text>
            <View style={styles.optionButtons}>
              {[
                { value: 'small', label: '少' },
                { value: 'medium', label: '中' },
                { value: 'large', label: '多' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    peeAmount === option.value && styles.optionButtonActive,
                  ]}
                  onPress={() => setPeeAmount(option.value as Diaper['peeAmount'])}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      peeAmount === option.value && styles.optionButtonTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        {/* 异常情况 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setHasAbnormality(!hasAbnormality)}
          >
            <Ionicons
              name={hasAbnormality ? 'checkbox' : 'square-outline'}
              size={24}
              color={hasAbnormality ? '#007AFF' : '#8E8E93'}
            />
            <Text style={styles.checkboxText}>有异常（如血丝、黏液等）</Text>
          </TouchableOpacity>
        </View>
        
        {/* 备注 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>备注（可选）</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="记录异常情况或其他信息"
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
  optionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
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
  },
  optionButtonTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxText: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 12,
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

