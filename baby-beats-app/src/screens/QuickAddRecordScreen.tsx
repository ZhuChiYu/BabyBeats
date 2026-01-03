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
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBabyStore } from '../store/babyStore';
import { FeedingService } from '../services/feedingService';
import { SleepService } from '../services/sleepService';
import { DiaperService } from '../services/diaperService';
import { PumpingService } from '../services/pumpingService';
import { DiaperWeightSettingsService } from '../services/diaperWeightSettingsService';
import { ModalHeader } from '../components/ModalHeader';
import { CustomDateTimePicker } from '../components/CustomDateTimePicker';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface QuickAddRecordScreenProps {
  navigation: any;
  route: {
    params: {
      initialDate: number;
    };
  };
}

export const QuickAddRecordScreen: React.FC<QuickAddRecordScreenProps> = ({
  navigation,
  route,
}) => {
  const { getCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();

  const [recordDate, setRecordDate] = useState(new Date(route.params.initialDate));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // 喂养数据
  const [addFeeding, setAddFeeding] = useState(false);
  const [feedingType, setFeedingType] = useState<'breast' | 'bottled_breast_milk' | 'formula'>('breast');
  const [feedingTime, setFeedingTime] = useState(new Date(route.params.initialDate));
  const [leftDuration, setLeftDuration] = useState('');
  const [rightDuration, setRightDuration] = useState('');
  const [milkAmount, setMilkAmount] = useState('');
  const [showFeedingTimePicker, setShowFeedingTimePicker] = useState(false);

  // 睡眠数据
  const [addSleep, setAddSleep] = useState(false);
  const [sleepStartTime, setSleepStartTime] = useState(new Date(route.params.initialDate));
  const [sleepEndTime, setSleepEndTime] = useState(new Date(route.params.initialDate + 3600000)); // +1小时
  const [sleepType, setSleepType] = useState<'nap' | 'night'>('nap');
  const [showSleepStartPicker, setShowSleepStartPicker] = useState(false);
  const [showSleepEndPicker, setShowSleepEndPicker] = useState(false);

  // 尿布数据
  const [addDiaper, setAddDiaper] = useState(false);
  const [diaperTime, setDiaperTime] = useState(new Date(route.params.initialDate));
  const [diaperType, setDiaperType] = useState<'poop' | 'pee' | 'both'>('both');
  const [dryDiaperWeight, setDryDiaperWeight] = useState('');
  const [wetWeight, setWetWeight] = useState('');
  const [poopColor, setPoopColor] = useState<'yellow' | 'green' | 'brown' | 'black' | 'dark' | 'red' | 'white' | 'orange' | 'other'>('yellow');
  const [poopConsistency, setPoopConsistency] = useState<'loose' | 'normal' | 'hard' | 'other'>('normal');
  const [peeAmount, setPeeAmount] = useState<'small' | 'medium' | 'large'>('medium');
  const [poopAmount, setPoopAmount] = useState<'small' | 'medium' | 'large'>('medium');
  const [hasAbnormality, setHasAbnormality] = useState(false);
  const [diaperNotes, setDiaperNotes] = useState('');
  const [showDiaperTimePicker, setShowDiaperTimePicker] = useState(false);

  // 加载上次使用的干尿布重量
  React.useEffect(() => {
    const loadDiaperWeight = async () => {
      const weight = await DiaperWeightSettingsService.getDryWeight();
      if (weight) {
        setDryDiaperWeight(weight.toString());
      }
    };
    loadDiaperWeight();
  }, []);

  // 挤奶数据
  const [addPumping, setAddPumping] = useState(false);
  const [pumpingTime, setPumpingTime] = useState(new Date(route.params.initialDate));
  const [leftAmount, setLeftAmount] = useState('');
  const [rightAmount, setRightAmount] = useState('');
  const [showPumpingTimePicker, setShowPumpingTimePicker] = useState(false);

  const handleSave = async () => {
    if (!currentBaby) {
      Alert.alert('错误', '请先选择宝宝');
      return;
    }

    if (!addFeeding && !addSleep && !addDiaper && !addPumping) {
      Alert.alert('提示', '请至少选择一种记录类型');
      return;
    }

    setSaving(true);
    try {
      let successCount = 0;
      const skippedRecords: string[] = [];

      // 添加喂养记录
      if (addFeeding) {
        if (feedingType === 'breast') {
          const left = parseInt(leftDuration) || 0;
          const right = parseInt(rightDuration) || 0;
          if (left + right > 0) {
            await FeedingService.create({
              babyId: currentBaby.id,
              type: 'breast',
              time: feedingTime.getTime(),
              leftDuration: left,
              rightDuration: right,
            });
            successCount++;
          } else {
            skippedRecords.push('喂养（未填写时长）');
          }
        } else {
          const amount = parseInt(milkAmount);
          if (amount > 0) {
            await FeedingService.create({
              babyId: currentBaby.id,
              type: feedingType,
              time: feedingTime.getTime(),
              milkAmount: amount,
            });
            successCount++;
          } else {
            skippedRecords.push('喂养（未填写奶量）');
          }
        }
      }

      // 添加睡眠记录
      if (addSleep) {
        const duration = Math.floor((sleepEndTime.getTime() - sleepStartTime.getTime()) / 60000);
        if (duration > 0) {
          await SleepService.create({
            babyId: currentBaby.id,
            startTime: sleepStartTime.getTime(),
            endTime: sleepEndTime.getTime(),
            duration,
            sleepType,
          });
          successCount++;
        } else {
          skippedRecords.push('睡眠（结束时间早于开始时间）');
        }
      }

      // 添加尿布记录
      if (addDiaper) {
        const dryWeight = parseFloat(dryDiaperWeight) || 0;
        const wet = parseFloat(wetWeight) || 0;

        // 保存干尿布重量设置
        if (dryWeight > 0) {
          await DiaperWeightSettingsService.setDryWeight(dryWeight);
        }

        await DiaperService.create({
          babyId: currentBaby.id,
          time: diaperTime.getTime(),
          type: diaperType,
          poopColor: diaperType !== 'pee' ? poopColor : undefined,
          poopConsistency: diaperType !== 'pee' ? poopConsistency : undefined,
          poopAmount: diaperType !== 'pee' ? poopAmount : undefined,
          peeAmount: diaperType !== 'poop' ? peeAmount : undefined,
          hasAbnormality,
          notes: diaperNotes || undefined,
          wetWeight: wet > 0 ? wet : undefined,
          dryWeight: dryWeight > 0 ? dryWeight : undefined,
        });
        successCount++;
      }

      // 添加挤奶记录
      if (addPumping) {
        const left = parseInt(leftAmount) || 0;
        const right = parseInt(rightAmount) || 0;
        if (left + right > 0) {
          await PumpingService.create({
            babyId: currentBaby.id,
            time: pumpingTime.getTime(),
            leftAmount: left,
            rightAmount: right,
            totalAmount: left + right,
          });
          successCount++;
        } else {
          skippedRecords.push('挤奶（未填写奶量）');
        }
      }

      if (successCount > 0) {
        let message = `已成功添加 ${successCount} 条记录`;
        if (skippedRecords.length > 0) {
          message += `\n\n已跳过 ${skippedRecords.length} 条：\n${skippedRecords.join('\n')}`;
        }
        Alert.alert('保存完成', message);
        navigation.goBack();
      } else {
        let message = '没有有效的记录数据';
        if (skippedRecords.length > 0) {
          message += '\n\n已跳过：\n' + skippedRecords.join('\n');
        }
        Alert.alert('提示', message);
      }
    } catch (error) {
      console.error('Failed to save records:', error);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ModalHeader
        title="快速添加记录"
        onCancel={() => navigation.goBack()}
        onSave={handleSave}
        saving={saving}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 日期选择 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>记录日期</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateButtonText}>
                {format(recordDate, 'yyyy年MM月dd日', { locale: zhCN })}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {/* 喂养记录 */}
          <View style={styles.recordSection}>
            <TouchableOpacity
              style={styles.recordHeader}
              onPress={() => setAddFeeding(!addFeeding)}
            >
              <View style={styles.recordHeaderLeft}>
                <View style={[styles.recordIcon, { backgroundColor: '#FF950015' }]}>
                  <Ionicons name="nutrition" size={24} color="#FF9500" />
                </View>
                <Text style={styles.recordHeaderTitle}>喂养记录</Text>
              </View>
              <Ionicons
                name={addFeeding ? 'checkbox' : 'square-outline'}
                size={24}
                color={addFeeding ? '#007AFF' : '#8E8E93'}
              />
            </TouchableOpacity>

            {addFeeding && (
              <View style={styles.recordContent}>
                {/* 喂养时间 */}
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowFeedingTimePicker(true)}
                >
                  <Text style={styles.timeLabel}>时间</Text>
                  <Text style={styles.timeText}>{format(feedingTime, 'HH:mm')}</Text>
                </TouchableOpacity>

                {/* 喂养类型 */}
                <View style={styles.typeButtons}>
                  {[
                    { value: 'breast', label: '亲喂' },
                    { value: 'bottled_breast_milk', label: '瓶喂母乳' },
                    { value: 'formula', label: '配方奶' },
                  ].map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.typeButton,
                        feedingType === type.value && styles.typeButtonActive,
                      ]}
                      onPress={() => setFeedingType(type.value as any)}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          feedingType === type.value && styles.typeButtonTextActive,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {feedingType === 'breast' ? (
                  <View style={styles.durationRow}>
                    <View style={styles.durationItem}>
                      <Text style={styles.inputLabel}>左侧（分钟）</Text>
                      <TextInput
                        style={styles.input}
                        value={leftDuration}
                        onChangeText={setLeftDuration}
                        keyboardType="numeric"
                        placeholder="0"
                      />
                    </View>
                    <View style={styles.durationItem}>
                      <Text style={styles.inputLabel}>右侧（分钟）</Text>
                      <TextInput
                        style={styles.input}
                        value={rightDuration}
                        onChangeText={setRightDuration}
                        keyboardType="numeric"
                        placeholder="0"
                      />
                    </View>
                  </View>
                ) : (
                  <View>
                    <Text style={styles.inputLabel}>奶量（ml）</Text>
                    <TextInput
                      style={styles.input}
                      value={milkAmount}
                      onChangeText={setMilkAmount}
                      keyboardType="numeric"
                      placeholder="0"
                    />
                  </View>
                )}
              </View>
            )}
          </View>

          {/* 睡眠记录 */}
          <View style={styles.recordSection}>
            <TouchableOpacity
              style={styles.recordHeader}
              onPress={() => setAddSleep(!addSleep)}
            >
              <View style={styles.recordHeaderLeft}>
                <View style={[styles.recordIcon, { backgroundColor: '#5856D615' }]}>
                  <Ionicons name="moon" size={24} color="#5856D6" />
                </View>
                <Text style={styles.recordHeaderTitle}>睡眠记录</Text>
              </View>
              <Ionicons
                name={addSleep ? 'checkbox' : 'square-outline'}
                size={24}
                color={addSleep ? '#007AFF' : '#8E8E93'}
              />
            </TouchableOpacity>

            {addSleep && (
              <View style={styles.recordContent}>
                {/* 睡眠类型 */}
                <View style={styles.typeButtons}>
                  <TouchableOpacity
                    style={[styles.typeButton, sleepType === 'nap' && styles.typeButtonActive]}
                    onPress={() => setSleepType('nap')}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        sleepType === 'nap' && styles.typeButtonTextActive,
                      ]}
                    >
                      小睡
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.typeButton, sleepType === 'night' && styles.typeButtonActive]}
                    onPress={() => setSleepType('night')}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        sleepType === 'night' && styles.typeButtonTextActive,
                      ]}
                    >
                      夜间睡眠
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 开始时间 */}
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowSleepStartPicker(true)}
                >
                  <Text style={styles.timeLabel}>开始时间</Text>
                  <Text style={styles.timeText}>{format(sleepStartTime, 'HH:mm')}</Text>
                </TouchableOpacity>

                {/* 结束时间 */}
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowSleepEndPicker(true)}
                >
                  <Text style={styles.timeLabel}>结束时间</Text>
                  <Text style={styles.timeText}>{format(sleepEndTime, 'HH:mm')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* 尿布记录 */}
          <View style={styles.recordSection}>
            <TouchableOpacity
              style={styles.recordHeader}
              onPress={() => setAddDiaper(!addDiaper)}
            >
              <View style={styles.recordHeaderLeft}>
                <View style={[styles.recordIcon, { backgroundColor: '#34C75915' }]}>
                  <Ionicons name="water" size={24} color="#34C759" />
                </View>
                <Text style={styles.recordHeaderTitle}>尿布记录</Text>
              </View>
              <Ionicons
                name={addDiaper ? 'checkbox' : 'square-outline'}
                size={24}
                color={addDiaper ? '#007AFF' : '#8E8E93'}
              />
            </TouchableOpacity>

            {addDiaper && (
              <View style={styles.recordContent}>
                {/* 尿布时间 */}
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowDiaperTimePicker(true)}
                >
                  <Text style={styles.timeLabel}>时间</Text>
                  <Text style={styles.timeText}>{format(diaperTime, 'HH:mm')}</Text>
                </TouchableOpacity>

                {/* 尿布类型 */}
                <View style={styles.typeButtons}>
                  {[
                    { value: 'poop', label: '大便' },
                    { value: 'pee', label: '小便' },
                    { value: 'both', label: '都有' },
                  ].map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.typeButton,
                        diaperType === type.value && styles.typeButtonActive,
                      ]}
                      onPress={() => setDiaperType(type.value as any)}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          diaperType === type.value && styles.typeButtonTextActive,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 重量信息 */}
                {(diaperType === 'pee' || diaperType === 'both') && (
                  <>
                    <View style={styles.durationRow}>
                      <View style={styles.durationItem}>
                        <Text style={styles.inputLabel}>干尿布重量（g）</Text>
                        <TextInput
                          style={styles.input}
                          value={dryDiaperWeight}
                          onChangeText={setDryDiaperWeight}
                          keyboardType="decimal-pad"
                          placeholder="例如: 25"
                        />
                      </View>
                      <View style={styles.durationItem}>
                        <Text style={styles.inputLabel}>湿尿布重量（g）</Text>
                        <TextInput
                          style={styles.input}
                          value={wetWeight}
                          onChangeText={setWetWeight}
                          keyboardType="decimal-pad"
                          placeholder="例如: 65"
                        />
                      </View>
                    </View>

                    {/* 尿量显示 */}
                    {wetWeight && dryDiaperWeight && parseFloat(wetWeight) > parseFloat(dryDiaperWeight) && (
                      <View style={styles.urineOutputDisplay}>
                        <Text style={styles.urineOutputLabel}>尿量:</Text>
                        <Text style={styles.urineOutputValue}>
                          {(parseFloat(wetWeight) - parseFloat(dryDiaperWeight)).toFixed(1)} g
                        </Text>
                      </View>
                    )}
                  </>
                )}

                {/* 大便详情 */}
                {(diaperType === 'poop' || diaperType === 'both') && (
                  <>
                    <Text style={styles.inputLabel}>大便颜色</Text>
                    <View style={styles.typeButtons}>
                      {[
                        { value: 'yellow', label: '黄色' },
                        { value: 'brown', label: '褐色' },
                        { value: 'green', label: '绿色' },
                        { value: 'dark', label: '深色' },
                      ].map((color) => (
                        <TouchableOpacity
                          key={color.value}
                          style={[
                            styles.typeButton,
                            poopColor === color.value && styles.typeButtonActive,
                          ]}
                          onPress={() => setPoopColor(color.value as any)}
                        >
                          <Text
                            style={[
                              styles.typeButtonText,
                              poopColor === color.value && styles.typeButtonTextActive,
                            ]}
                          >
                            {color.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={styles.inputLabel}>大便性质</Text>
                    <View style={styles.typeButtons}>
                      {[
                        { value: 'loose', label: '稀' },
                        { value: 'normal', label: '正常' },
                        { value: 'hard', label: '硬' },
                      ].map((consistency) => (
                        <TouchableOpacity
                          key={consistency.value}
                          style={[
                            styles.typeButton,
                            poopConsistency === consistency.value && styles.typeButtonActive,
                          ]}
                          onPress={() => setPoopConsistency(consistency.value as any)}
                        >
                          <Text
                            style={[
                              styles.typeButtonText,
                              poopConsistency === consistency.value && styles.typeButtonTextActive,
                            ]}
                          >
                            {consistency.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={styles.inputLabel}>大便量</Text>
                    <View style={styles.typeButtons}>
                      {[
                        { value: 'small', label: '少' },
                        { value: 'medium', label: '中' },
                        { value: 'large', label: '多' },
                      ].map((amount) => (
                        <TouchableOpacity
                          key={amount.value}
                          style={[
                            styles.typeButton,
                            poopAmount === amount.value && styles.typeButtonActive,
                          ]}
                          onPress={() => setPoopAmount(amount.value as any)}
                        >
                          <Text
                            style={[
                              styles.typeButtonText,
                              poopAmount === amount.value && styles.typeButtonTextActive,
                            ]}
                          >
                            {amount.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                {/* 小便量 */}
                {(diaperType === 'pee' || diaperType === 'both') && (
                  <>
                    <Text style={styles.inputLabel}>小便量</Text>
                    <View style={styles.typeButtons}>
                      {[
                        { value: 'small', label: '少' },
                        { value: 'medium', label: '中' },
                        { value: 'large', label: '多' },
                      ].map((amount) => (
                        <TouchableOpacity
                          key={amount.value}
                          style={[
                            styles.typeButton,
                            peeAmount === amount.value && styles.typeButtonActive,
                          ]}
                          onPress={() => setPeeAmount(amount.value as any)}
                        >
                          <Text
                            style={[
                              styles.typeButtonText,
                              peeAmount === amount.value && styles.typeButtonTextActive,
                            ]}
                          >
                            {amount.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                {/* 是否异常 */}
                <TouchableOpacity
                  style={styles.abnormalityButton}
                  onPress={() => setHasAbnormality(!hasAbnormality)}
                >
                  <Ionicons
                    name={hasAbnormality ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={hasAbnormality ? '#FF3B30' : '#8E8E93'}
                  />
                  <Text style={[styles.abnormalityText, hasAbnormality && styles.abnormalityTextActive]}>
                    标记为异常
                  </Text>
                </TouchableOpacity>

                {/* 备注 */}
                <Text style={styles.inputLabel}>备注（可选）</Text>
                <TextInput
                  style={[styles.input, styles.notesInput]}
                  value={diaperNotes}
                  onChangeText={setDiaperNotes}
                  placeholder="添加备注..."
                  multiline
                  numberOfLines={2}
                />
              </View>
            )}
          </View>

          {/* 挤奶记录 */}
          <View style={styles.recordSection}>
            <TouchableOpacity
              style={styles.recordHeader}
              onPress={() => setAddPumping(!addPumping)}
            >
              <View style={styles.recordHeaderLeft}>
                <View style={[styles.recordIcon, { backgroundColor: '#AF52DE15' }]}>
                  <Ionicons name="flask" size={24} color="#AF52DE" />
                </View>
                <Text style={styles.recordHeaderTitle}>挤奶记录</Text>
              </View>
              <Ionicons
                name={addPumping ? 'checkbox' : 'square-outline'}
                size={24}
                color={addPumping ? '#007AFF' : '#8E8E93'}
              />
            </TouchableOpacity>

            {addPumping && (
              <View style={styles.recordContent}>
                {/* 挤奶时间 */}
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowPumpingTimePicker(true)}
                >
                  <Text style={styles.timeLabel}>时间</Text>
                  <Text style={styles.timeText}>{format(pumpingTime, 'HH:mm')}</Text>
                </TouchableOpacity>

                {/* 挤奶量 */}
                <View style={styles.durationRow}>
                  <View style={styles.durationItem}>
                    <Text style={styles.inputLabel}>左侧（ml）</Text>
                    <TextInput
                      style={styles.input}
                      value={leftAmount}
                      onChangeText={setLeftAmount}
                      keyboardType="numeric"
                      placeholder="0"
                    />
                  </View>
                  <View style={styles.durationItem}>
                    <Text style={styles.inputLabel}>右侧（ml）</Text>
                    <TextInput
                      style={styles.input}
                      value={rightAmount}
                      onChangeText={setRightAmount}
                      keyboardType="numeric"
                      placeholder="0"
                    />
                  </View>
                </View>
              </View>
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 日期选择器 */}
      <CustomDateTimePicker
        visible={showDatePicker}
        mode="date"
        value={recordDate}
        onConfirm={(date) => {
          setRecordDate(date);
          setFeedingTime(date);
          setSleepStartTime(date);
          setSleepEndTime(new Date(date.getTime() + 3600000));
          setDiaperTime(date);
          setPumpingTime(date);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
        maximumDate={new Date()}
      />

      {/* 喂养时间选择器 */}
      <CustomDateTimePicker
        visible={showFeedingTimePicker}
        mode="time"
        value={feedingTime}
        onConfirm={(date) => {
          setFeedingTime(date);
          setShowFeedingTimePicker(false);
        }}
        onCancel={() => setShowFeedingTimePicker(false)}
      />

      {/* 睡眠开始时间选择器 */}
      <CustomDateTimePicker
        visible={showSleepStartPicker}
        mode="time"
        value={sleepStartTime}
        onConfirm={(date) => {
          setSleepStartTime(date);
          setShowSleepStartPicker(false);
        }}
        onCancel={() => setShowSleepStartPicker(false)}
      />

      {/* 睡眠结束时间选择器 */}
      <CustomDateTimePicker
        visible={showSleepEndPicker}
        mode="time"
        value={sleepEndTime}
        onConfirm={(date) => {
          setSleepEndTime(date);
          setShowSleepEndPicker(false);
        }}
        onCancel={() => setShowSleepEndPicker(false)}
      />

      {/* 尿布时间选择器 */}
      <CustomDateTimePicker
        visible={showDiaperTimePicker}
        mode="time"
        value={diaperTime}
        onConfirm={(date) => {
          setDiaperTime(date);
          setShowDiaperTimePicker(false);
        }}
        onCancel={() => setShowDiaperTimePicker(false)}
      />

      {/* 挤奶时间选择器 */}
      <CustomDateTimePicker
        visible={showPumpingTimePicker}
        mode="time"
        value={pumpingTime}
        onConfirm={(date) => {
          setPumpingTime(date);
          setShowPumpingTimePicker(false);
        }}
        onCancel={() => setShowPumpingTimePicker(false)}
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
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    padding: 12,
    borderRadius: 8,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#000000',
  },
  recordSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  recordHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  recordContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F7',
  },
  timeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  timeLabel: {
    fontSize: 15,
    color: '#8E8E93',
  },
  timeText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  typeButtons: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  typeButtonTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  durationRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  durationItem: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  urineOutputDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  urineOutputLabel: {
    fontSize: 15,
    color: '#007AFF',
    marginRight: 8,
  },
  urineOutputValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  abnormalityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 12,
  },
  abnormalityText: {
    fontSize: 15,
    color: '#8E8E93',
    marginLeft: 8,
  },
  abnormalityTextActive: {
    color: '#FF3B30',
    fontWeight: '500',
  },
});

