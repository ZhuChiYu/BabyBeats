import React, { useState } from 'react';
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
import { TemperatureService } from '../services/temperatureService';
import { ModalHeader } from '../components/ModalHeader';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface AddTemperatureScreenProps {
  navigation: any;
}

export const AddTemperatureScreen: React.FC<AddTemperatureScreenProps> = ({ navigation }) => {
  const { getCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [temperature, setTemperature] = useState('');
  const [method, setMethod] = useState<string>('forehead');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const methods = [
    { value: 'forehead', label: '额温', icon: 'scan' },
    { value: 'ear', label: '耳温', icon: 'ear' },
    { value: 'armpit', label: '腋温', icon: 'body' },
    { value: 'oral', label: '口温', icon: 'happy' },
    { value: 'rectal', label: '肛温', icon: 'medical' },
  ];

  const handleSave = async () => {
    if (!currentBaby) {
      Alert.alert('错误', '请先选择宝宝');
      return;
    }

    if (!temperature || isNaN(parseFloat(temperature))) {
      Alert.alert('错误', '请输入有效的体温值');
      return;
    }

    const tempValue = parseFloat(temperature);
    if (tempValue < 34 || tempValue > 43) {
      Alert.alert('错误', '体温范围应在34-43°C之间');
      return;
    }

    setSaving(true);
    try {
      await TemperatureService.create({
        babyId: currentBaby.id,
        date: date.getTime(),
        temperature: tempValue,
        measurementMethod: method,
        notes: notes.trim() || undefined,
      });

      Alert.alert('成功', '体温记录已保存', [
        {
          text: '确定',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Failed to save temperature:', error);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const tempStatus = temperature ? TemperatureService.getTemperatureStatus(parseFloat(temperature)) : null;

  return (
    <SafeAreaView style={styles.container}>
      <ModalHeader
        title="记录体温"
        onCancel={() => navigation.goBack()}
        onSave={handleSave}
        saving={saving}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 体温输入 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>体温值 (°C)</Text>
          <View style={styles.temperatureInputContainer}>
            <TextInput
              style={styles.temperatureInput}
              value={temperature}
              onChangeText={setTemperature}
              placeholder="36.5"
              placeholderTextColor="#C7C7CC"
              keyboardType="decimal-pad"
              maxLength={4}
            />
            <Text style={styles.temperatureUnit}>°C</Text>
          </View>
          {tempStatus && (
            <View style={[styles.statusBadge, { backgroundColor: `${tempStatus.color}15` }]}>
              <Ionicons name="information-circle" size={16} color={tempStatus.color} />
              <Text style={[styles.statusText, { color: tempStatus.color }]}>
                {tempStatus.label}
              </Text>
            </View>
          )}
        </View>

        {/* 测量方式 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>测量方式</Text>
          <View style={styles.methodGrid}>
            {methods.map((m) => (
              <TouchableOpacity
                key={m.value}
                style={[
                  styles.methodButton,
                  method === m.value && styles.methodButtonActive,
                ]}
                onPress={() => setMethod(m.value)}
              >
                <Ionicons
                  name={m.icon as any}
                  size={24}
                  color={method === m.value ? '#FFFFFF' : '#8E8E93'}
                />
                <Text
                  style={[
                    styles.methodText,
                    method === m.value && styles.methodTextActive,
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 测量时间 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>测量时间</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={20} color="#007AFF" />
            <Text style={styles.dateText}>
              {format(date, 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* 备注 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>备注（选填）</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="记录相关症状或情况..."
            placeholderTextColor="#C7C7CC"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.footer} />
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          display="spinner"
          locale="zh-Hans-CN"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDate(selectedDate);
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
  temperatureInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  temperatureInput: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#007AFF',
    minWidth: 150,
    textAlign: 'center',
  },
  temperatureUnit: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8E8E93',
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  methodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  methodButton: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
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

