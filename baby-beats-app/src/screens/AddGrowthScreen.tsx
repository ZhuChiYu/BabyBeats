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
  Platform,,
  KeyboardAvoidingView
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
      editingRecord?: any;
    };
  };
}

export const AddGrowthScreen: React.FC<AddGrowthScreenProps> = ({ navigation, route }) => {
  const { getCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();

  const editingRecord = route?.params?.editingRecord;
  const initialType = route?.params?.type || 'weight';
  
  const [measurementDate, setMeasurementDate] = useState(
    editingRecord ? new Date(editingRecord.date) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [weight, setWeight] = useState(editingRecord?.weight?.toString() || '');
  const [height, setHeight] = useState(editingRecord?.height?.toString() || '');
  const [headCircumference, setHeadCircumference] = useState(editingRecord?.headCirc?.toString() || '');
  const [notes, setNotes] = useState(editingRecord?.notes || '');
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
      if (editingRecord) {
        // 更新记录
        await GrowthService.update(editingRecord.id, {
          date: measurementDate.getTime(),
          weight: weightNum || undefined,
          height: heightNum || undefined,
          headCirc: headNum || undefined,
          notes: notes || undefined,
        });
      } else {
        // 创建新记录
        await GrowthService.create({
          babyId: currentBaby.id,
          date: measurementDate.getTime(),
          weight: weightNum || undefined,
          height: heightNum || undefined,
          headCirc: headNum || undefined,
          notes: notes || undefined,
        });
      }

      // 关闭页面
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save growth record:', error);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingRecord) return;

    Alert.alert(
      '确认删除',
      '确定要删除这条成长记录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await GrowthService.delete(editingRecord.id);
              navigation.goBack();
            } catch (error) {
              console.error('Failed to delete growth record:', error);
              Alert.alert('错误', '删除失败，请重试');
            }
          },
        },
      ]
    );
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
        title={editingRecord ? "编辑成长记录" : "添加成长记录"}
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

        {/* 删除按钮 (仅在编辑模式显示) */}
        {editingRecord && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={styles.deleteButtonText}>删除成长记录</Text>
            </TouchableOpacity>
          </View>
        )}

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
    color: '#000000',
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
    color: '#000000',
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
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE5E5',
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
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

