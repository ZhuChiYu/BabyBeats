import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBabyStore } from '../store/babyStore';
import { MedicationService } from '../services/medicationService';
import { ModalHeader } from '../components/ModalHeader';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Medication } from '../types';

interface AddMedicationScreenProps {
  navigation: any;
  route?: any;
}

export const AddMedicationScreen: React.FC<AddMedicationScreenProps> = ({ navigation, route }) => {
  const { getCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();
  const visitId = route?.params?.visitId;
  const editingMedication: Medication | undefined = route?.params?.medication;

  const [medicationTime, setMedicationTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [medicationName, setMedicationName] = useState('');
  const [showNamePicker, setShowNamePicker] = useState(false);
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [administrationMethod, setAdministrationMethod] = useState('oral');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // 初始化编辑数据
  useEffect(() => {
    if (editingMedication) {
      setMedicationTime(new Date(editingMedication.medicationTime));
      setMedicationName(editingMedication.medicationName);
      setDosage(editingMedication.dosage);
      setFrequency(editingMedication.frequency || '');
      setAdministrationMethod(editingMedication.administrationMethod || 'oral');
      if (editingMedication.startDate) setStartDate(new Date(editingMedication.startDate));
      if (editingMedication.endDate) setEndDate(new Date(editingMedication.endDate));
      setNotes(editingMedication.notes || '');
    }
  }, [editingMedication]);

  const methods = [
    { value: 'oral', label: '口服', icon: 'water' },
    { value: 'topical', label: '外用', icon: 'hand-left' },
    { value: 'injection', label: '注射', icon: 'medical' },
    { value: 'other', label: '其他', icon: 'ellipsis-horizontal' },
  ];

  const commonMedications = MedicationService.getCommonMedications();

  const handleDelete = async () => {
    if (!editingMedication) return;

    Alert.alert(
      '确认删除',
      '确定要删除这条用药记录吗？此操作无法撤销。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await MedicationService.delete(editingMedication.id);
              Alert.alert('成功', '用药记录已删除', [
                {
                  text: '确定',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              console.error('Failed to delete medication:', error);
              Alert.alert('错误', '删除失败，请重试');
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!currentBaby) {
      Alert.alert('错误', '请先选择宝宝');
      return;
    }

    if (!medicationName.trim()) {
      Alert.alert('错误', '请输入药品名称');
      return;
    }

    if (!dosage.trim()) {
      Alert.alert('错误', '请输入用药剂量');
      return;
    }

    setSaving(true);
    try {
      if (editingMedication) {
        // 更新现有记录
        await MedicationService.update(editingMedication.id, {
          medicationTime: medicationTime.getTime(),
          medicationName: medicationName.trim(),
          dosage: dosage.trim(),
          frequency: frequency.trim() || undefined,
          startDate: startDate.getTime(),
          endDate: endDate?.getTime(),
          administrationMethod,
          notes: notes.trim() || undefined,
        });
        Alert.alert('成功', '用药记录已更新！', [
          {
            text: '确定',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        // 创建新记录
        await MedicationService.create({
          babyId: currentBaby.id,
          medicationTime: medicationTime.getTime(),
          medicationName: medicationName.trim(),
          dosage: dosage.trim(),
          frequency: frequency.trim() || undefined,
          startDate: startDate.getTime(),
          endDate: endDate?.getTime(),
          administrationMethod,
          visitId,
          notes: notes.trim() || undefined,
        });
        Alert.alert('成功', '用药记录已保存', [
          {
            text: '确定',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to save medication:', error);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ModalHeader
        title={editingMedication ? "编辑用药" : "记录用药"}
        onCancel={() => navigation.goBack()}
        onSave={handleSave}
        saving={saving}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 药品名称 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>药品名称 *</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowNamePicker(!showNamePicker)}
          >
            <Text style={[styles.inputText, !medicationName && styles.placeholder]}>
              {medicationName || '选择或输入药品名称'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#C7C7CC" />
          </TouchableOpacity>
          
          {showNamePicker && (
            <View style={styles.picker}>
              <TextInput
                style={styles.searchInput}
                value={medicationName}
                onChangeText={setMedicationName}
                placeholder="搜索或输入药品名称"
                placeholderTextColor="#C7C7CC"
              />
              <ScrollView style={styles.pickerList}>
                {commonMedications.map((med, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.pickerItem}
                    onPress={() => {
                      setMedicationName(med.name);
                      setDosage(med.commonDosage);
                      setShowNamePicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemName}>{med.name}</Text>
                    <Text style={styles.pickerItemDesc}>{med.category} • {med.commonDosage}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* 用药剂量 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>用药剂量 *</Text>
          <TextInput
            style={styles.textInput}
            value={dosage}
            onChangeText={setDosage}
            placeholder="如：5ml、1片、半包"
            placeholderTextColor="#C7C7CC"
          />
        </View>

        {/* 用药频次 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>用药频次（选填）</Text>
          <TextInput
            style={styles.textInput}
            value={frequency}
            onChangeText={setFrequency}
            placeholder="如：每日3次、每8小时1次"
            placeholderTextColor="#C7C7CC"
          />
        </View>

        {/* 给药方式 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>给药方式</Text>
          <View style={styles.methodGrid}>
            {methods.map((m) => (
              <TouchableOpacity
                key={m.value}
                style={[
                  styles.methodButton,
                  administrationMethod === m.value && styles.methodButtonActive,
                ]}
                onPress={() => setAdministrationMethod(m.value)}
              >
                <Ionicons
                  name={m.icon as any}
                  size={24}
                  color={administrationMethod === m.value ? '#FFFFFF' : '#8E8E93'}
                />
                <Text
                  style={[
                    styles.methodText,
                    administrationMethod === m.value && styles.methodTextActive,
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 用药时间 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>用药时间 *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="time" size={20} color="#007AFF" />
            <Text style={styles.dateText}>
              {format(medicationTime, 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* 疗程 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>疗程</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={styles.halfDateButton}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text style={styles.dateLabel}>开始</Text>
              <Text style={styles.dateValue}>
                {format(startDate, 'MM-dd', { locale: zhCN })}
              </Text>
            </TouchableOpacity>
            <View style={styles.dateSeparator} />
            <TouchableOpacity
              style={styles.halfDateButton}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Text style={styles.dateLabel}>结束</Text>
              <Text style={[styles.dateValue, !endDate && styles.placeholder]}>
                {endDate ? format(endDate, 'MM-dd', { locale: zhCN }) : '未设置'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 备注 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>备注（选填）</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="记录用药说明或注意事项..."
            placeholderTextColor="#C7C7CC"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* 删除按钮（仅编辑模式） */}
        {editingMedication && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            <Text style={styles.deleteButtonText}>删除用药记录</Text>
          </TouchableOpacity>
        )}

        <View style={styles.footer} />
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={medicationTime}
          mode="datetime"
          display="spinner"
          locale="zh-Hans-CN"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setMedicationTime(selectedDate);
            }
          }}
        />
      )}

      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="spinner"
          locale="zh-Hans-CN"
          onChange={(event, selectedDate) => {
            setShowStartDatePicker(false);
            if (selectedDate) {
              setStartDate(selectedDate);
            }
          }}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="spinner"
          locale="zh-Hans-CN"
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(false);
            if (selectedDate) {
              setEndDate(selectedDate);
            }
          }}
        />
      )}
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
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
  },
  inputText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  placeholder: {
    color: '#C7C7CC',
  },
  picker: {
    marginTop: 12,
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    maxHeight: 300,
  },
  searchInput: {
    fontSize: 16,
    color: '#000',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  pickerList: {
    maxHeight: 250,
  },
  pickerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  pickerItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  pickerItemDesc: {
    fontSize: 13,
    color: '#8E8E93',
  },
  textInput: {
    fontSize: 16,
    color: '#000',
    backgroundColor: '#F5F5F7',
    padding: 12,
    borderRadius: 8,
  },
  methodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  methodButton: {
    flex: 1,
    minWidth: '22%',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
  },
  methodButtonActive: {
    backgroundColor: '#007AFF',
  },
  methodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 6,
  },
  methodTextActive: {
    color: '#FFFFFF',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfDateButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    alignItems: 'center',
  },
  dateSeparator: {
    width: 2,
    backgroundColor: '#E5E5EA',
    alignSelf: 'stretch',
  },
  dateLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  notesInput: {
    fontSize: 16,
    color: '#000',
    backgroundColor: '#F5F5F7',
    padding: 12,
    borderRadius: 8,
    minHeight: 100,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 8,
  },
  footer: {
    height: 32,
  },
});

