import React, { useState } from 'react';
import {View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBabyStore } from '../store/babyStore';
import { VaccineService } from '../services/vaccineService';
import { ModalHeader } from '../components/ModalHeader';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface AddVaccineScreenProps {
  navigation: any;
}

export const AddVaccineScreen: React.FC<AddVaccineScreenProps> = ({ navigation }) => {
  const { getCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();

  const [vaccineName, setVaccineName] = useState('');
  const [showNamePicker, setShowNamePicker] = useState(false);
  const [vaccinationDate, setVaccinationDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [doseNumber, setDoseNumber] = useState('');
  const [location, setLocation] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [nextDate, setNextDate] = useState<Date | null>(null);
  const [showNextDatePicker, setShowNextDatePicker] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const commonVaccines = VaccineService.getCommonVaccines();

  const handleSave = async () => {
    if (!currentBaby) {
      Alert.alert('错误', '请先选择宝宝');
      return;
    }

    if (!vaccineName.trim()) {
      Alert.alert('错误', '请输入疫苗名称');
      return;
    }

    setSaving(true);
    try {
      await VaccineService.create({
        babyId: currentBaby.id,
        vaccineName: vaccineName.trim(),
        vaccinationDate: vaccinationDate.getTime(),
        doseNumber: doseNumber ? parseInt(doseNumber) : undefined,
        location: location.trim() || undefined,
        batchNumber: batchNumber.trim() || undefined,
        nextDate: nextDate?.getTime(),
        reminderEnabled,
        notes: notes.trim() || undefined,
      });

      Alert.alert('成功', '疫苗记录已保存', [
        {
          text: '确定',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Failed to save vaccine:', error);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ModalHeader
        title="记录疫苗"
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
        {/* 疫苗名称 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>疫苗名称 *</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowNamePicker(!showNamePicker)}
          >
            <Text style={[styles.inputText, !vaccineName && styles.placeholder]}>
              {vaccineName || '选择或输入疫苗名称'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#C7C7CC" />
          </TouchableOpacity>
          
          {showNamePicker && (
            <View style={styles.picker}>
              <TextInput
                style={styles.searchInput}
                value={vaccineName}
                onChangeText={setVaccineName}
                placeholder="搜索或输入疫苗名称"
                placeholderTextColor="#C7C7CC"
              />
              <ScrollView style={styles.pickerList}>
                {commonVaccines.map((vaccine, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.pickerItem}
                    onPress={() => {
                      setVaccineName(vaccine.name);
                      setShowNamePicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemName}>{vaccine.name}</Text>
                    <Text style={styles.pickerItemDesc}>{vaccine.description}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* 接种日期 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>接种日期 *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={20} color="#007AFF" />
            <Text style={styles.dateText}>
              {format(vaccinationDate, 'yyyy年MM月dd日', { locale: zhCN })}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* 剂次 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>剂次（选填）</Text>
          <TextInput
            style={styles.textInput}
            value={doseNumber}
            onChangeText={setDoseNumber}
            placeholder="第几针（如：1, 2, 3）"
            placeholderTextColor="#C7C7CC"
            keyboardType="number-pad"
          />
        </View>

        {/* 接种地点 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>接种地点（选填）</Text>
          <TextInput
            style={styles.textInput}
            value={location}
            onChangeText={setLocation}
            placeholder="医院或接种点名称"
            placeholderTextColor="#C7C7CC"
          />
        </View>

        {/* 批次号 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>批次号（选填）</Text>
          <TextInput
            style={styles.textInput}
            value={batchNumber}
            onChangeText={setBatchNumber}
            placeholder="疫苗批次号"
            placeholderTextColor="#C7C7CC"
          />
        </View>

        {/* 下次接种日期 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>下次接种日期（选填）</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowNextDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#007AFF" />
            <Text style={[styles.dateText, !nextDate && styles.placeholder]}>
              {nextDate
                ? format(nextDate, 'yyyy年MM月dd日', { locale: zhCN })
                : '设置下次接种提醒'}
            </Text>
            {nextDate && (
              <TouchableOpacity onPress={() => setNextDate(null)}>
                <Ionicons name="close-circle" size={20} color="#C7C7CC" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>

        {/* 提醒开关 */}
        {nextDate && (
          <View style={styles.section}>
            <View style={styles.switchRow}>
              <View style={styles.switchLeft}>
                <Ionicons name="notifications" size={20} color="#FF9500" />
                <Text style={styles.switchLabel}>到期提醒</Text>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
              />
            </View>
            <Text style={styles.switchHint}>
              在下次接种日期前7天提醒您
            </Text>
          </View>
        )}

        {/* 备注 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>备注（选填）</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="记录接种后反应或其他信息..."
            placeholderTextColor="#C7C7CC"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.footer} />
      </ScrollView>


      </KeyboardAvoidingView>

      {showDatePicker && (
        <DateTimePicker
          value={vaccinationDate}
          mode="date"
          display="spinner"
          locale="zh-Hans-CN"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setVaccinationDate(selectedDate);
            }
          }}
        />
      )}

      {showNextDatePicker && (
        <DateTimePicker
          value={nextDate || new Date()}
          mode="date"
          display="spinner"
          locale="zh-Hans-CN"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowNextDatePicker(false);
            if (selectedDate) {
              setNextDate(selectedDate);
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
  textInput: {
    fontSize: 16,
    color: '#000',
    backgroundColor: '#F5F5F7',
    padding: 12,
    borderRadius: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  switchHint: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 8,
  },
  notesInput: {
    fontSize: 16,
    color: '#000',
    backgroundColor: '#F5F5F7',
    padding: 12,
    borderRadius: 8,
    minHeight: 100,
  },
  footer: {
    height: 32,
  },
});

