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
  ActivityIndicator,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { GrowthService } from '../services/growthService';
import { useBabyStore } from '../store/babyStore';
import { ModalHeader } from '../components/ModalHeader';
import { Colors } from '../constants';
import { format } from 'date-fns';

interface AddGrowthScreenProps {
  navigation: any;
  route?: {
    params?: {
      type?: 'weight' | 'height' | 'head';
    };
  };
}

export const AddGrowthScreen: React.FC<AddGrowthScreenProps> = ({ navigation, route }) => {
  const { getCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();

  const initialType = route?.params?.type || 'weight';
  
  const [measurementDate, setMeasurementDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [headCircumference, setHeadCircumference] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!currentBaby) {
      Alert.alert('错误', '请先创建宝宝档案');
      return;
    }

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const headNum = parseFloat(headCircumference);

    if (!weightNum && !heightNum && !headNum) {
      Alert.alert('错误', '请至少输入一项测量数据');
      return;
    }

    setSaving(true);
    try {
      await GrowthService.create({
        babyId: currentBaby.id,
        date: measurementDate.getTime(),
        weight: weightNum || undefined,
        height: heightNum || undefined,
        headCirc: headNum || undefined,
        notes: notes || undefined,
      });

      // 关闭页面
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save growth record:', error);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (!currentBaby) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="person-add-outline" size={64} color="#C7C7CC" />
          <Text style={styles.emptyText}>请先创建宝宝档案</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ModalHeader
        title="添加成长记录"
        onCancel={() => navigation.goBack()}
        onSave={handleSave}
        saving={saving}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 测量日期 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>测量日期</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
            <Text style={styles.dateButtonText}>
              {format(measurementDate, 'yyyy年MM月dd日')}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={measurementDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setMeasurementDate(selectedDate);
                }
              }}
            />
          )}
        </View>

        {/* 体重 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>体重（kg）</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder="输入体重"
              placeholderTextColor="#8E8E93"
            />
            <Text style={styles.unit}>kg</Text>
          </View>
        </View>

        {/* 身高 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>身高（cm）</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              keyboardType="decimal-pad"
              placeholder="输入身高"
              placeholderTextColor="#8E8E93"
            />
            <Text style={styles.unit}>cm</Text>
          </View>
        </View>

        {/* 头围 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>头围（cm）</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={headCircumference}
              onChangeText={setHeadCircumference}
              keyboardType="decimal-pad"
              placeholder="输入头围"
              placeholderTextColor="#8E8E93"
            />
            <Text style={styles.unit}>cm</Text>
          </View>
        </View>

        {/* 备注 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>备注（可选）</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="添加备注..."
            placeholderTextColor="#8E8E93"
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingRight: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#000',
  },
  unit: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#8E8E93',
    marginTop: 16,
  },
});

