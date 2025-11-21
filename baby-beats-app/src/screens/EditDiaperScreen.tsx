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
  Switch,,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DiaperService } from '../services/diaperService';
import { ModalHeader } from '../components/ModalHeader';
import { Diaper } from '../types';
import { Colors } from '../constants';

interface EditDiaperScreenProps {
  navigation: any;
  route: {
    params: {
      diaperId: string;
    };
  };
}

export const EditDiaperScreen: React.FC<EditDiaperScreenProps> = ({ navigation, route }) => {
  const { diaperId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [diaperType, setDiaperType] = useState<Diaper['type']>('both');
  const [poopConsistency, setPoopConsistency] = useState<Diaper['poopConsistency']>('normal');
  const [poopColor, setPoopColor] = useState<Diaper['poopColor']>('yellow');
  const [poopAmount, setPoopAmount] = useState<Diaper['poopAmount']>('medium');
  const [peeAmount, setPeeAmount] = useState<Diaper['peeAmount']>('medium');
  const [hasAbnormality, setHasAbnormality] = useState(false);
  const [notes, setNotes] = useState('');
  
  useEffect(() => {
    loadDiaper();
  }, [diaperId]);
  
  const loadDiaper = async () => {
    try {
      const diaper = await DiaperService.getById(diaperId);
      if (!diaper) {
        Alert.alert('错误', '记录不存在', [
          { text: '确定', onPress: () => navigation.goBack() },
        ]);
        return;
      }
      
      setDiaperType(diaper.type);
      if (diaper.poopConsistency) setPoopConsistency(diaper.poopConsistency);
      if (diaper.poopColor) setPoopColor(diaper.poopColor);
      if (diaper.poopAmount) setPoopAmount(diaper.poopAmount);
      if (diaper.peeAmount) setPeeAmount(diaper.peeAmount);
      setHasAbnormality(diaper.hasAbnormality || false);
      setNotes(diaper.notes || '');
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
      await DiaperService.update(diaperId, {
        type: diaperType,
        poopConsistency: diaperType !== 'pee' ? poopConsistency : undefined,
        poopColor: diaperType !== 'pee' ? poopColor : undefined,
        poopAmount: diaperType !== 'pee' ? poopAmount : undefined,
        peeAmount: diaperType !== 'poop' ? peeAmount : undefined,
        hasAbnormality,
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
        title="编辑尿布记录"
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
            {[
              { value: 'poop', label: '大便', icon: 'water' },
              { value: 'pee', label: '小便', icon: 'water-outline' },
              { value: 'both', label: '都有', icon: 'fitness' },
            ].map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeButton,
                  diaperType === type.value && styles.typeButtonActive,
                ]}
                onPress={() => setDiaperType(type.value as Diaper['type'])}
              >
                <Ionicons
                  name={type.icon as any}
                  size={24}
                  color={diaperType === type.value ? Colors.primary : '#8E8E93'}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    diaperType === type.value && styles.typeButtonTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* 大便详情 */}
        {diaperType !== 'pee' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>大便性质</Text>
              <View style={styles.optionButtons}>
                {[
                  { value: 'watery', label: '水样' },
                  { value: 'soft', label: '软便' },
                  { value: 'normal', label: '正常' },
                  { value: 'hard', label: '干硬' },
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
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>大便颜色</Text>
              <View style={styles.optionButtons}>
                {[
                  { value: 'yellow', label: '黄色' },
                  { value: 'green', label: '绿色' },
                  { value: 'brown', label: '棕色' },
                  { value: 'other', label: '其他' },
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
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
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
        
        {/* 小便量 */}
        {diaperType !== 'poop' && (
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
        
        {/* 异常标记 */}
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.sectionTitle}>是否有异常</Text>
              <Text style={styles.switchSubtitle}>如红疹、腹泻等</Text>
            </View>
            <Switch
              value={hasAbnormality}
              onValueChange={setHasAbnormality}
              trackColor={{ false: '#E5E5EA', true: Colors.primary }}
            />
          </View>
        </View>
        
        {/* 备注 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>备注（可选）</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
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
  optionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  optionButton: {
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
  },
  optionButtonTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
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

