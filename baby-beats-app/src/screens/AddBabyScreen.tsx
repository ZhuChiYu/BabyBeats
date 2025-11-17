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
import { Ionicons } from '@expo/vector-icons';
import { BabyService } from '../services/babyService';
import { useBabyStore } from '../store/babyStore';
import { ModalHeader } from '../components/ModalHeader';
import { Colors } from '../constants';
import { format } from 'date-fns';

interface AddBabyScreenProps {
  navigation: any;
}

export const AddBabyScreen: React.FC<AddBabyScreenProps> = ({ navigation }) => {
  const { addBaby, setCurrentBaby } = useBabyStore();

  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'unknown'>('unknown');
  const [birthday, setBirthday] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [birthWeight, setBirthWeight] = useState('');
  const [birthHeight, setBirthHeight] = useState('');
  const [birthHeadCirc, setBirthHeadCirc] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('错误', '请输入宝宝姓名');
      return;
    }

    setSaving(true);
    try {
      const baby = await BabyService.create({
        userId: 'temp-user-id', // TODO: 用真实用户ID
        name: name.trim(),
        gender,
        birthday: birthday.getTime(),
        birthWeight: birthWeight ? parseFloat(birthWeight) : undefined,
        birthHeight: birthHeight ? parseFloat(birthHeight) : undefined,
        birthHeadCirc: birthHeadCirc ? parseFloat(birthHeadCirc) : undefined,
        bloodType: bloodType || undefined,
        isArchived: false,
      });

      // 添加到 store 并设为当前宝宝
      addBaby(baby);
      setCurrentBaby(baby.id);

      // 关闭页面
      navigation.goBack();
    } catch (error) {
      console.error('Failed to add baby:', error);
      Alert.alert('错误', '添加失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ModalHeader
        title="添加宝宝"
        onCancel={() => navigation.goBack()}
        onSave={handleSave}
        saving={saving}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 宝宝姓名 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>宝宝姓名 *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="请输入宝宝姓名"
            placeholderTextColor="#C7C7CC"
          />
        </View>

        {/* 性别 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>性别</Text>
          <View style={styles.genderButtons}>
            {[
              { value: 'male', label: '男孩', icon: 'male' },
              { value: 'female', label: '女孩', icon: 'female' },
              { value: 'unknown', label: '保密', icon: 'help' },
            ].map((g) => (
              <TouchableOpacity
                key={g.value}
                style={[
                  styles.genderButton,
                  gender === g.value && styles.genderButtonActive,
                ]}
                onPress={() => setGender(g.value as any)}
              >
                <Ionicons
                  name={g.icon as any}
                  size={24}
                  color={gender === g.value ? Colors.primary : '#8E8E93'}
                />
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === g.value && styles.genderButtonTextActive,
                  ]}
                >
                  {g.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 出生日期 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>出生日期 *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {format(birthday, 'yyyy年MM月dd日')}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={birthday}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setBirthday(selectedDate);
                }
              }}
              maximumDate={new Date()}
              locale="zh-Hans-CN"
            />
          )}
        </View>

        {/* 出生体重 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>出生体重 (kg)</Text>
          <TextInput
            style={styles.input}
            value={birthWeight}
            onChangeText={setBirthWeight}
            placeholder="如：3.5"
            placeholderTextColor="#C7C7CC"
            keyboardType="decimal-pad"
          />
        </View>

        {/* 出生身高 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>出生身高 (cm)</Text>
          <TextInput
            style={styles.input}
            value={birthHeight}
            onChangeText={setBirthHeight}
            placeholder="如：50"
            placeholderTextColor="#C7C7CC"
            keyboardType="decimal-pad"
          />
        </View>

        {/* 出生头围 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>出生头围 (cm)</Text>
          <TextInput
            style={styles.input}
            value={birthHeadCirc}
            onChangeText={setBirthHeadCirc}
            placeholder="如：34"
            placeholderTextColor="#C7C7CC"
            keyboardType="decimal-pad"
          />
        </View>

        {/* 血型 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>血型</Text>
          <View style={styles.bloodTypeButtons}>
            {['A', 'B', 'AB', 'O'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.bloodTypeButton,
                  bloodType === type && styles.bloodTypeButtonActive,
                ]}
                onPress={() => setBloodType(bloodType === type ? '' : type)}
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
  input: {
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000000',
  },
  genderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
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
  genderButtonActive: {
    backgroundColor: '#E3F2FD',
    borderColor: Colors.primary,
  },
  genderButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  genderButtonTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    padding: 16,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#000000',
  },
  bloodTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bloodTypeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bloodTypeButtonActive: {
    backgroundColor: '#E3F2FD',
    borderColor: Colors.primary,
  },
  bloodTypeText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  bloodTypeTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});

