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
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { CustomDateTimePicker } from '../components/CustomDateTimePicker';
import { Ionicons } from '@expo/vector-icons';
import { BabyService } from '../services/babyService';
import { useBabyStore } from '../store/babyStore';
import { ModalHeader } from '../components/ModalHeader';
import { Colors } from '../constants';
import { format } from 'date-fns';

interface EditBabyScreenProps {
  navigation: any;
}

export const EditBabyScreen: React.FC<EditBabyScreenProps> = ({ navigation }) => {
  const { getCurrentBaby, updateBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();

  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'unknown'>('unknown');
  const [birthday, setBirthday] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [birthWeight, setBirthWeight] = useState('');
  const [birthHeight, setBirthHeight] = useState('');
  const [birthHeadCirc, setBirthHeadCirc] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentBaby) {
      setName(currentBaby.name);
      setGender(currentBaby.gender);
      setBirthday(new Date(currentBaby.birthday));
      setBirthWeight(currentBaby.birthWeight?.toString() || '');
      setBirthHeight(currentBaby.birthHeight?.toString() || '');
      setBirthHeadCirc(currentBaby.birthHeadCirc?.toString() || '');
      setBloodType(currentBaby.bloodType || '');
    }
  }, [currentBaby]);

  const handleSave = async () => {
    if (!currentBaby) return;

    if (!name.trim()) {
      Alert.alert('错误', '请输入宝宝姓名');
      return;
    }

    setSaving(true);
    try {
      const updates = {
        name: name.trim(),
        gender,
        birthday: birthday.getTime(),
        birthWeight: birthWeight ? parseFloat(birthWeight) : undefined,
        birthHeight: birthHeight ? parseFloat(birthHeight) : undefined,
        birthHeadCirc: birthHeadCirc ? parseFloat(birthHeadCirc) : undefined,
        bloodType: bloodType || undefined,
      };

      // 更新数据库
      await BabyService.update(currentBaby.id, updates);

      // 更新 Store 中的状态
      updateBaby(currentBaby.id, updates);

      // 显示成功提示并关闭页面
      Alert.alert('成功', '宝宝信息已更新', [
        {
          text: '确定',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Failed to update baby:', error);
      Alert.alert('错误', '更新失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (!currentBaby) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>未找到宝宝信息</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ModalHeader
        title="编辑宝宝信息"
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
        {/* 宝宝姓名 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>宝宝姓名 *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="输入宝宝姓名"
            placeholderTextColor="#8E8E93"
          />
        </View>

        {/* 性别 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>性别</Text>
          <View style={styles.genderSelector}>
            {[
              { value: 'male', label: '男孩', icon: 'male' },
              { value: 'female', label: '女孩', icon: 'female' },
              { value: 'unknown', label: '保密', icon: 'help' },
            ].map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.genderButton,
                  gender === option.value && styles.genderButtonActive,
                ]}
                onPress={() => setGender(option.value as any)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={gender === option.value ? '#FFFFFF' : '#8E8E93'}
                />
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === option.value && styles.genderButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 出生日期 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>出生日期</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
            <Text style={styles.dateButtonText}>
              {format(birthday, 'yyyy年MM月dd日')}
            </Text>
          </TouchableOpacity>

          <CustomDateTimePicker
            visible={showDatePicker}
            mode="date"
              value={birthday}
            onConfirm={(date) => {
              setBirthday(date);
                setShowDatePicker(false);
              }}
            onCancel={() => setShowDatePicker(false)}
              maximumDate={new Date()}
            />
        </View>

        {/* 出生体重 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>出生体重（kg）</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={birthWeight}
              onChangeText={setBirthWeight}
              keyboardType="decimal-pad"
              placeholder="输入出生体重"
              placeholderTextColor="#8E8E93"
            />
            <Text style={styles.unit}>kg</Text>
          </View>
        </View>

        {/* 出生身高 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>出生身高（cm）</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={birthHeight}
              onChangeText={setBirthHeight}
              keyboardType="decimal-pad"
              placeholder="输入出生身高"
              placeholderTextColor="#8E8E93"
            />
            <Text style={styles.unit}>cm</Text>
          </View>
        </View>

        {/* 出生头围 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>出生头围（cm）</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={birthHeadCirc}
              onChangeText={setBirthHeadCirc}
              keyboardType="decimal-pad"
              placeholder="输入出生头围"
              placeholderTextColor="#8E8E93"
            />
            <Text style={styles.unit}>cm</Text>
          </View>
        </View>

        {/* 血型 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>血型（可选）</Text>
          <View style={styles.bloodTypeSelector}>
            {['A', 'B', 'AB', 'O'].map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.bloodTypeButton,
                  bloodType === type && styles.bloodTypeButtonActive,
                ]}
                onPress={() => setBloodType(type)}
              >
                <Text
                  style={[
                    styles.bloodTypeText,
                    bloodType === type && styles.bloodTypeTextActive,
                  ]}
                >
                  {type}型
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
    color: '#000',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingRight: 16,
  },
  unit: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  genderSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  genderButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    marginTop: 8,
  },
  genderButtonTextActive: {
    color: '#FFFFFF',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#000',
  },
  bloodTypeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  bloodTypeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  bloodTypeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  bloodTypeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
  },
  bloodTypeTextActive: {
    color: '#FFFFFF',
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

