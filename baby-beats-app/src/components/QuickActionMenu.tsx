import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { TextParserService, ParsedRecord } from '../services/textParserService';
import { FeedingService } from '../services/feedingService';
import { SleepService } from '../services/sleepService';
import { DiaperService } from '../services/diaperService';
import { PumpingService } from '../services/pumpingService';
import { useBabyStore } from '../store/babyStore';

const { width, height } = Dimensions.get('window');

export const QuickActionMenu: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [showSmartInput, setShowSmartInput] = useState(false);
  const [inputText, setInputText] = useState('');
  const [parsedRecords, setParsedRecords] = useState<ParsedRecord[]>([]);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigation = useNavigation<any>();
  const currentBaby = useBabyStore((state) => state.getCurrentBaby());
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  const showMenu = () => {
    setVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };
  
  const hideMenu = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setShowSmartInput(false);
      setInputText('');
      setParsedRecords([]);
    });
  };
  
  const handleAction = (screen: string) => {
    hideMenu();
    setTimeout(() => {
      navigation.navigate(screen);
    }, 100);
  };

  const handleSmartInput = () => {
    setShowSmartInput(true);
  };

  const handleParse = () => {
    if (!inputText.trim()) {
      Alert.alert('提示', '请输入要解析的文本');
      return;
    }

    setParsing(true);
    
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
    if (!currentBaby) {
      Alert.alert('错误', '请先选择宝宝');
      return;
    }

    if (parsedRecords.length === 0) {
      Alert.alert('提示', '没有可保存的记录');
      return;
    }

    setSaving(true);

    try {
      let successCount = 0;

      for (const record of parsedRecords) {
        try {
          switch (record.type) {
            case 'feeding':
              await FeedingService.create({
                babyId: currentBaby.id,
                time: record.time,
                type: record.data.feedingType || 'breast',
                leftDuration: record.data.leftDuration,
                rightDuration: record.data.rightDuration,
                milkAmount: record.data.milkAmount,
              });
              successCount++;
              break;
            
            case 'sleep':
              await SleepService.create({
                babyId: currentBaby.id,
                startTime: record.time,
                endTime: record.data.endTime,
                duration: record.data.duration,
                sleepType: record.data.sleepType || 'nap',
              });
              successCount++;
              break;
            
            case 'diaper':
              await DiaperService.create({
                babyId: currentBaby.id,
                time: record.time,
                type: record.data.diaperType || 'both',
              });
              successCount++;
              break;
            
            case 'pumping':
              await PumpingService.create({
                babyId: currentBaby.id,
                time: record.time,
                leftAmount: record.data.leftAmount || 0,
                rightAmount: record.data.rightAmount || 0,
                totalAmount: record.data.totalAmount,
              });
              successCount++;
              break;
          }
        } catch (error) {
          console.error(`Failed to save ${record.type} record:`, error);
        }
      }

      if (successCount > 0) {
        Alert.alert('成功', `已保存 ${successCount} 条记录`, [
          {
            text: '确定',
            onPress: () => {
              hideMenu();
            },
          },
        ]);
      } else {
        Alert.alert('错误', '保存失败，请重试');
      }
    } catch (error) {
      console.error('Failed to save records:', error);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };
  
  const actions = [
    {
      id: 'feeding',
      screen: 'AddFeeding',
      icon: 'nutrition',
      label: '喂养',
      color: '#FF9500',
    },
    {
      id: 'sleep',
      screen: 'AddSleep',
      icon: 'moon',
      label: '睡眠',
      color: '#5856D6',
    },
    {
      id: 'diaper',
      screen: 'AddDiaper',
      icon: 'water',
      label: '尿布',
      color: '#34C759',
    },
    {
      id: 'pumping',
      screen: 'AddPumping',
      icon: 'flask',
      label: '挤奶',
      color: '#AF52DE',
    },
    {
      id: 'temperature',
      screen: 'AddTemperature',
      icon: 'thermometer',
      label: '体温',
      color: '#FF6B6B',
    },
    {
      id: 'medication',
      screen: 'AddMedication',
      icon: 'medkit',
      label: '用药',
      color: '#9B59B6',
    },
    {
      id: 'milestone',
      screen: 'AddMilestone',
      icon: 'star',
      label: '里程碑',
      color: '#FFD60A',
    },
    {
      id: 'visit',
      screen: 'AddMedicalVisit',
      icon: 'medical',
      label: '就诊',
      color: '#3498DB',
    },
  ];
  
  return (
    <>
      <TouchableOpacity style={styles.mainButton} onPress={showMenu}>
        <Ionicons name="add-circle" size={32} color="#007AFF" />
      </TouchableOpacity>
      
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={hideMenu}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={hideMenu}
          >
            <Animated.View
              style={[
                styles.menuContainer,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      scale: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.menu} onStartShouldSetResponder={() => true}>
                {!showSmartInput ? (
                  <>
                    <Text style={styles.menuTitle}>快速记录</Text>
                    
                    {/* 智能输入入口 */}
                    <TouchableOpacity
                      style={styles.smartInputEntry}
                      onPress={handleSmartInput}
                    >
                      <View style={styles.smartInputLeft}>
                        <View style={styles.smartInputIconSmall}>
                          <Ionicons name="sparkles" size={20} color="#FF9500" />
                        </View>
                        <View>
                          <Text style={styles.smartInputEntryTitle}>智能输入</Text>
                          <Text style={styles.smartInputEntryDesc}>用文字描述，AI智能识别</Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                    </TouchableOpacity>
                    
                    <View style={styles.divider} />
                    
                    <View style={styles.actionsGrid}>
                      {actions.map((action) => (
                        <TouchableOpacity
                          key={action.id}
                          style={styles.actionButton}
                          onPress={() => handleAction(action.screen)}
                        >
                          <View
                            style={[
                              styles.iconContainer,
                              { backgroundColor: `${action.color}15` },
                            ]}
                          >
                            <Ionicons
                              name={action.icon as any}
                              size={28}
                              color={action.color}
                            />
                          </View>
                          <Text style={styles.actionLabel}>{action.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={hideMenu}
                    >
                      <Text style={styles.cancelText}>取消</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <ScrollView style={styles.smartInputContainer} showsVerticalScrollIndicator={false}>
                    <View style={styles.smartInputHeader}>
                      <TouchableOpacity onPress={() => setShowSmartInput(false)}>
                        <Ionicons name="arrow-back" size={24} color="#007AFF" />
                      </TouchableOpacity>
                      <Text style={styles.smartInputTitle}>智能输入</Text>
                      <View style={{ width: 24 }} />
                    </View>

                    <View style={styles.exampleBox}>
                      <Text style={styles.exampleTitle}>💡 示例：</Text>
                      <Text style={styles.exampleText}>
                        今天8点喂了左边10分钟右边5分钟{'\n'}
                        10点拉了一次大便{'\n'}
                        下午2点睡了2小时
                      </Text>
                    </View>

                    <TextInput
                      style={styles.textInput}
                      value={inputText}
                      onChangeText={setInputText}
                      placeholder="在这里输入要解析的文本..."
                      placeholderTextColor="#C7C7CC"
                      multiline
                      numberOfLines={6}
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

                    {parsedRecords.length > 0 && (
                      <View style={styles.resultsSection}>
                        <Text style={styles.resultsTitle}>识别结果 ({parsedRecords.length}条)</Text>
                        
                        {parsedRecords.map((record, index) => (
                          <View key={index} style={styles.resultCard}>
                            <View style={styles.resultHeader}>
                              <View style={styles.resultTypeContainer}>
                                <Ionicons
                                  name={
                                    record.type === 'feeding' ? 'nutrition' :
                                    record.type === 'sleep' ? 'moon' :
                                    record.type === 'diaper' ? 'water' :
                                    'flask'
                                  }
                                  size={16}
                                  color="#007AFF"
                                />
                                <Text style={styles.resultType}>
                                  {
                                    record.type === 'feeding' ? '喂养' :
                                    record.type === 'sleep' ? '睡眠' :
                                    record.type === 'diaper' ? '尿布' :
                                    '挤奶'
                                  }
                                </Text>
                              </View>
                              <Text style={styles.resultTime}>{record.timeStr}</Text>
                            </View>
                            <Text style={styles.resultDetail}>{record.detail}</Text>
                          </View>
                        ))}

                        <TouchableOpacity
                          style={[styles.saveAllButton, saving && styles.saveAllButtonDisabled]}
                          onPress={handleSaveAll}
                          disabled={saving}
                        >
                          {saving ? (
                            <ActivityIndicator color="#FFFFFF" />
                          ) : (
                            <Text style={styles.saveAllButtonText}>保存全部记录</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  </ScrollView>
                )}
              </View>
            </Animated.View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  mainButton: {
    padding: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: width * 0.9,
    maxWidth: 420,
    maxHeight: height * 0.8,
  },
  menu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
  },
  smartInputEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBF0',
    borderWidth: 1,
    borderColor: '#FFE5A3',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  smartInputLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  smartInputIconSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF9E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  smartInputEntryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  smartInputEntryDesc: {
    fontSize: 11,
    color: '#8E8E93',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 12,
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F5F5F7',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  smartInputContainer: {
    maxHeight: height * 0.7,
  },
  smartInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  smartInputTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  exampleBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  exampleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 6,
  },
  exampleText: {
    fontSize: 12,
    color: '#1565C0',
    lineHeight: 18,
  },
  textInput: {
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#000',
    minHeight: 120,
    marginBottom: 12,
  },
  parseButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  parseButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  parseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  resultsSection: {
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  resultCard: {
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  resultTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 6,
  },
  resultTime: {
    fontSize: 13,
    color: '#8E8E93',
  },
  resultDetail: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
  },
  saveAllButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveAllButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  saveAllButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

