import React, { useState } from 'react';
import {View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBabyStore } from '../store/babyStore';
import { MedicalVisitService } from '../services/medicalVisitService';
import { ModalHeader } from '../components/ModalHeader';
import { CustomDateTimePicker } from '../components/CustomDateTimePicker';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface AddMedicalVisitScreenProps {
  navigation: any;
  route?: any;
}

export const AddMedicalVisitScreen: React.FC<AddMedicalVisitScreenProps> = ({ navigation, route }) => {
  const { getCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();
  
  const editingVisit = route?.params?.medicalVisit;
  const isEditing = !!editingVisit;

  const [visitTime, setVisitTime] = useState(editingVisit ? new Date(editingVisit.visitTime) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hospital, setHospital] = useState(editingVisit?.hospital || '');
  const [department, setDepartment] = useState(editingVisit?.department || '');
  const [showDepartmentPicker, setShowDepartmentPicker] = useState(false);
  const [doctorName, setDoctorName] = useState(editingVisit?.doctorName || '');
  const [symptoms, setSymptoms] = useState(editingVisit?.symptoms || '');
  const [showSymptomsPicker, setShowSymptomsPicker] = useState(false);
  const [diagnosis, setDiagnosis] = useState(editingVisit?.diagnosis || '');
  const [doctorAdvice, setDoctorAdvice] = useState(editingVisit?.doctorAdvice || '');
  const [notes, setNotes] = useState(editingVisit?.notes || '');
  const [saving, setSaving] = useState(false);

  const commonDepartments = MedicalVisitService.getCommonDepartments();
  const commonSymptoms = MedicalVisitService.getCommonSymptoms();

  const handleSave = async () => {
    if (!currentBaby) {
      Alert.alert('错误', '请先选择宝宝');
      return;
    }

    if (!hospital.trim() && !symptoms.trim()) {
      Alert.alert('错误', '请至少填写医院名称或症状');
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await MedicalVisitService.update(editingVisit.id, {
          visitTime: visitTime.getTime(),
          hospital: hospital.trim() || undefined,
          department: department.trim() || undefined,
          doctorName: doctorName.trim() || undefined,
          symptoms: symptoms.trim() || undefined,
          diagnosis: diagnosis.trim() || undefined,
          doctorAdvice: doctorAdvice.trim() || undefined,
          notes: notes.trim() || undefined,
        });
      } else {
        await MedicalVisitService.create({
          babyId: currentBaby.id,
          visitTime: visitTime.getTime(),
          hospital: hospital.trim() || undefined,
          department: department.trim() || undefined,
          doctorName: doctorName.trim() || undefined,
          symptoms: symptoms.trim() || undefined,
          diagnosis: diagnosis.trim() || undefined,
          doctorAdvice: doctorAdvice.trim() || undefined,
          notes: notes.trim() || undefined,
        });
      }

      Alert.alert('成功', isEditing ? '就诊记录已更新' : '就诊记录已保存', [
        {
          text: '确定',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Failed to save medical visit:', error);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      '确认删除',
      '确定要删除这条就诊记录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await MedicalVisitService.delete(editingVisit.id);
              Alert.alert('成功', '就诊记录已删除', [
                {
                  text: '确定',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              console.error('Failed to delete medical visit:', error);
              Alert.alert('错误', '删除失败，请重试');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ModalHeader
        title={isEditing ? "编辑就诊记录" : "记录就诊"}
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
        {/* 就诊时间 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>就诊时间 *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={20} color="#007AFF" />
            <Text style={styles.dateText}>
              {format(visitTime, 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* 医院 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>医院名称</Text>
          <TextInput
            style={styles.textInput}
            value={hospital}
            onChangeText={setHospital}
            placeholder="如：XX市人民医院"
            placeholderTextColor="#C7C7CC"
          />
        </View>

        {/* 科室 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>科室（选填）</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDepartmentPicker(!showDepartmentPicker)}
          >
            <Text style={[styles.inputText, !department && styles.placeholder]}>
              {department || '选择或输入科室'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#C7C7CC" />
          </TouchableOpacity>
          
          {showDepartmentPicker && (
            <View style={styles.picker}>
              <TextInput
                style={styles.searchInput}
                value={department}
                onChangeText={setDepartment}
                placeholder="搜索或输入科室"
                placeholderTextColor="#C7C7CC"
              />
              <ScrollView style={styles.pickerList}>
                {commonDepartments.map((dept, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.pickerItem}
                    onPress={() => {
                      setDepartment(dept);
                      setShowDepartmentPicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>{dept}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* 医生 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>医生姓名（选填）</Text>
          <TextInput
            style={styles.textInput}
            value={doctorName}
            onChangeText={setDoctorName}
            placeholder="医生姓名"
            placeholderTextColor="#C7C7CC"
          />
        </View>

        {/* 症状 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>主要症状 *</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowSymptomsPicker(!showSymptomsPicker)}
          >
            <Text style={[styles.inputText, !symptoms && styles.placeholder]}>
              {symptoms || '选择或输入症状'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#C7C7CC" />
          </TouchableOpacity>
          
          {showSymptomsPicker && (
            <View style={styles.picker}>
              <TextInput
                style={styles.searchInput}
                value={symptoms}
                onChangeText={setSymptoms}
                placeholder="搜索或输入症状"
                placeholderTextColor="#C7C7CC"
                multiline
              />
              <View style={styles.symptomGrid}>
                {commonSymptoms.map((symptom, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.symptomTag}
                    onPress={() => {
                      const newSymptoms = symptoms
                        ? `${symptoms}、${symptom}`
                        : symptom;
                      setSymptoms(newSymptoms);
                    }}
                  >
                    <Text style={styles.symptomTagText}>{symptom}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* 诊断结果 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>诊断结果（选填）</Text>
          <TextInput
            style={styles.notesInput}
            value={diagnosis}
            onChangeText={setDiagnosis}
            placeholder="医生的诊断结果..."
            placeholderTextColor="#C7C7CC"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* 医嘱建议 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>医嘱建议（选填）</Text>
          <TextInput
            style={styles.notesInput}
            value={doctorAdvice}
            onChangeText={setDoctorAdvice}
            placeholder="医生的建议和注意事项..."
            placeholderTextColor="#C7C7CC"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* 备注 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>备注（选填）</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="其他补充信息..."
            placeholderTextColor="#C7C7CC"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {isEditing && (
          <View style={styles.deleteButtonContainer}>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={styles.deleteButtonText}>删除此记录</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footer} />
      </ScrollView>


      </KeyboardAvoidingView>

      <CustomDateTimePicker
        visible={showDatePicker}
        mode="datetime"
          value={visitTime}
        onConfirm={(date) => {
          setVisitTime(date);
            setShowDatePicker(false);
          }}
        onCancel={() => setShowDatePicker(false)}
        maximumDate={new Date()}
        />
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
  textInput: {
    fontSize: 16,
    color: '#000',
    backgroundColor: '#F5F5F7',
    padding: 12,
    borderRadius: 8,
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
    maxHeight: 200,
  },
  pickerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#000',
  },
  symptomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 8,
  },
  symptomTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  symptomTagText: {
    fontSize: 14,
    color: '#007AFF',
  },
  notesInput: {
    fontSize: 16,
    color: '#000',
    backgroundColor: '#F5F5F7',
    padding: 12,
    borderRadius: 8,
    minHeight: 80,
  },
  footer: {
    height: 32,
  },
  deleteButtonContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 8,
  },
});

