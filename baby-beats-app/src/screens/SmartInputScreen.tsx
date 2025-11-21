import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';
import { TextParserService, ParsedRecord } from '../services/textParserService';
import { FeedingService } from '../services/feedingService';
import { SleepService } from '../services/sleepService';
import { DiaperService } from '../services/diaperService';
import { PumpingService } from '../services/pumpingService';
import { useBabyStore } from '../store/babyStore';

interface SmartInputScreenProps {
  navigation: any;
}

export const SmartInputScreen: React.FC<SmartInputScreenProps> = ({ navigation }) => {
  const [inputText, setInputText] = useState('');
  const [parsedRecords, setParsedRecords] = useState<ParsedRecord[]>([]);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const currentBaby = useBabyStore((state) => state.getCurrentBaby());

  const handleParse = () => {
    if (!inputText.trim()) {
      Alert.alert('提示', '请输入要解析的文本');
      return;
    }

    setParsing(true);
    
    // 模拟异步解析（实际上是同步的，但添加延迟让用户看到过程）
    setTimeout(() => {
      const records = TextParserService.parseText(inputText);
      setParsedRecords(records);
      setParsing(false);

      if (records.length === 0) {
        Alert.alert('提示', '未能识别出有效记录，请尝试更详细的描述');
      }
    }, 500);
  };

  const handleSaveAll = async () => {
    if (parsedRecords.length === 0) {
      return;
    }

    if (!currentBaby) {
      Alert.alert('提示', '请先添加宝宝信息');
      return;
    }

    Alert.alert(
      '确认保存',
      `确定要保存这 ${parsedRecords.length} 条记录吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '保存',
          onPress: async () => {
            setSaving(true);
            let successCount = 0;
            let failCount = 0;

            for (const record of parsedRecords) {
              try {
                await saveRecord(record);
                successCount++;
              } catch (error) {
                console.error('保存记录失败:', error);
                failCount++;
              }
            }

            setSaving(false);

            if (failCount === 0) {
              Alert.alert('成功', `已保存 ${successCount} 条记录`, [
                {
                  text: '确定',
                  onPress: () => {
                    setInputText('');
                    setParsedRecords([]);
                    navigation.goBack();
                  }
                }
              ]);
            } else {
              Alert.alert('完成', `成功保存 ${successCount} 条，失败 ${failCount} 条`);
            }
          }
        }
      ]
    );
  };

  const saveRecord = async (record: ParsedRecord) => {
    if (!currentBaby) return;

    switch (record.type) {
      case 'feeding': {
        // 转换喂养数据格式
        const feedingData: any = {
          babyId: currentBaby.id,
          time: record.data.startTime || record.time.getTime(),
        };

        // 转换喂养类型
        if (record.data.type === 'breast_left' || record.data.type === 'breast_right' || record.data.type === 'breast_both') {
          feedingData.type = 'breast';
          if (record.data.type === 'breast_left') {
            feedingData.leftDuration = record.data.duration || 0;
          } else if (record.data.type === 'breast_right') {
            feedingData.rightDuration = record.data.duration || 0;
          } else {
            feedingData.leftDuration = Math.floor((record.data.duration || 0) / 2);
            feedingData.rightDuration = Math.ceil((record.data.duration || 0) / 2);
          }
        } else if (record.data.type === 'bottle_breast') {
          feedingData.type = 'bottled_breast_milk';
          feedingData.milkAmount = record.data.amount || 0;
        } else {
          feedingData.type = 'formula';
          feedingData.milkAmount = record.data.amount || 0;
        }

        await FeedingService.create(feedingData);
        break;
      }
      case 'sleep': {
        const sleepData = {
          babyId: currentBaby.id,
          startTime: record.data.startTime,
          endTime: record.data.endTime,
          sleepType: record.data.type || 'nap',
        };
        await SleepService.create(sleepData);
        break;
      }
      case 'diaper': {
        const diaperData = {
          babyId: currentBaby.id,
          time: record.data.time || record.time.getTime(),
          type: record.data.type,
          hasAbnormality: false,
          notes: record.data.notes || '',
        };
        await DiaperService.create(diaperData);
        break;
      }
      case 'pumping': {
        const totalAmount = record.data.totalAmount || 0;
        const method = (record.data.method === 'electric_single' || record.data.method === 'electric_double') 
          ? 'electric' 
          : 'manual';
        const pumpingData = {
          babyId: currentBaby.id,
          time: record.data.time || record.time.getTime(),
          method: method as 'electric' | 'manual' | 'other',
          leftAmount: record.data.method === 'electric_double' ? Math.floor(totalAmount / 2) : 0,
          rightAmount: record.data.method === 'electric_double' ? Math.ceil(totalAmount / 2) : 0,
          totalAmount: totalAmount,
          storageMethod: 'refrigerate' as const,
        };
        await PumpingService.create(pumpingData);
        break;
      }
    }
  };

  const handleRemoveRecord = (index: number) => {
    const newRecords = [...parsedRecords];
    newRecords.splice(index, 1);
    setParsedRecords(newRecords);
  };

  const handleEditRecord = (index: number) => {
    Alert.alert('提示', '请直接修改原文本后重新解析，或保存后在相应页面编辑');
  };

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'feeding':
        return 'nutrition';
      case 'sleep':
        return 'moon';
      case 'diaper':
        return 'water';
      case 'pumping':
        return 'flask';
      default:
        return 'help-circle';
    }
  };

  const getRecordColor = (type: string) => {
    switch (type) {
      case 'feeding':
        return Colors.feeding;
      case 'sleep':
        return Colors.sleep;
      case 'diaper':
        return Colors.diaper;
      case 'pumping':
        return Colors.pumping;
      default:
        return '#8E8E93';
    }
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.9) return '高';
    if (confidence >= 0.7) return '中';
    return '低';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return '#34C759';
    if (confidence >= 0.7) return '#FF9500';
    return '#FF3B30';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>智能输入</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* 说明 */}
        <View style={styles.instructionCard}>
          <View style={styles.instructionHeader}>
            <Ionicons name="bulb" size={20} color="#FF9500" />
            <Text style={styles.instructionTitle}>使用说明</Text>
          </View>
          <Text style={styles.instructionText}>
            用自然语言描述宝宝的日常活动，系统会自动识别并生成记录。例如：
          </Text>
          <Text style={styles.exampleText}>
            "十点左右吃了60ml奶粉。12点吃了母乳20分钟。"
          </Text>
          <Text style={styles.exampleText}>
            "昨晚八点多拉一次，吃到九点。12点吃完母乳又拉一次。"
          </Text>
          <Text style={styles.exampleText}>
            "七点半吃了睡到九点半。十点吃左边母乳18分钟。"
          </Text>
        </View>

        {/* 输入框 */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>输入文本</Text>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="在这里输入要解析的文本..."
            placeholderTextColor="#C7C7CC"
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />
          
          <TouchableOpacity
            style={[styles.parseButton, (!inputText.trim() || parsing) && styles.parseButtonDisabled]}
            onPress={handleParse}
            disabled={!inputText.trim() || parsing}
          >
            {parsing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                <Text style={styles.parseButtonText}>智能解析</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* 解析结果 */}
        {parsedRecords.length > 0 && (
          <View style={styles.resultsSection}>
            <View style={styles.resultHeader}>
              <Text style={styles.sectionTitle}>识别结果 ({parsedRecords.length})</Text>
              <TouchableOpacity
                style={[styles.saveAllButton, saving && styles.saveAllButtonDisabled]}
                onPress={handleSaveAll}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                    <Text style={styles.saveAllButtonText}>全部保存</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {parsedRecords.map((record, index) => (
              <View key={record.id} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <View style={styles.recordType}>
                    <Ionicons
                      name={getRecordIcon(record.type)}
                      size={20}
                      color={getRecordColor(record.type)}
                    />
                    <Text style={styles.recordTypeText}>
                      {record.type === 'feeding' && '喂养'}
                      {record.type === 'sleep' && '睡眠'}
                      {record.type === 'diaper' && '尿布'}
                      {record.type === 'pumping' && '挤奶'}
                    </Text>
                    <View
                      style={[
                        styles.confidenceBadge,
                        { backgroundColor: getConfidenceColor(record.confidence) + '20' }
                      ]}
                    >
                      <Text
                        style={[
                          styles.confidenceText,
                          { color: getConfidenceColor(record.confidence) }
                        ]}
                      >
                        {getConfidenceText(record.confidence)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveRecord(index)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={22} color="#FF3B30" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.recordContent}>
                  {TextParserService.formatRecord(record)}
                </Text>

                <Text style={styles.originalText}>
                  原文：{record.originalText}
                </Text>
              </View>
            ))}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  content: {
    flex: 1,
  },
  instructionCard: {
    backgroundColor: '#FFF9E6',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE5A3',
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  instructionText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#8E8E93',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#5C5C5C',
    marginBottom: 4,
    paddingLeft: 8,
    fontStyle: 'italic',
  },
  inputSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#000000',
    minHeight: 160,
    marginBottom: 16,
  },
  parseButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  parseButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  parseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  resultsSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  saveAllButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveAllButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  saveAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  recordCard: {
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordType: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recordTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '600',
  },
  removeButton: {
    padding: 4,
  },
  recordContent: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 8,
    lineHeight: 20,
  },
  originalText: {
    fontSize: 11,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
});

