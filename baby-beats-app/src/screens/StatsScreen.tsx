import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Dimensions, TouchableOpacity, Alert, Modal, Platform } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useBabyStore } from '../store/babyStore';
import { FeedingService } from '../services/feedingService';
import { SleepService } from '../services/sleepService';
import { DiaperService } from '../services/diaperService';
import { PumpingService } from '../services/pumpingService';
import { format, subDays, startOfDay, endOfDay, differenceInDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Colors } from '../constants';

const screenWidth = Dimensions.get('window').width;

type TimeRange = '7days' | '14days' | '30days' | '3months' | 'custom';

interface StatsScreenProps {
  navigation: any;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({ navigation }) => {
  const { getCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();
  
  const [timeRange, setTimeRange] = useState<TimeRange>('7days');
  const [feedingData, setFeedingData] = useState<any>(null);
  const [sleepData, setSleepData] = useState<any>(null);
  const [diaperData, setDiaperData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // 保存原始数据用于报告生成
  const [rawFeedings, setRawFeedings] = useState<any[]>([]);
  const [rawSleeps, setRawSleeps] = useState<any[]>([]);
  const [rawDiapers, setRawDiapers] = useState<any[]>([]);
  
  // 自定义日期范围
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'start' | 'end'>('start');
  const [customStartDate, setCustomStartDate] = useState(startOfDay(subDays(new Date(), 6)));
  const [customEndDate, setCustomEndDate] = useState(endOfDay(new Date()));
  const [tempDate, setTempDate] = useState(new Date());
  
  useEffect(() => {
    if (currentBaby) {
      loadStats();
    }
  }, [currentBaby?.id, timeRange, customStartDate, customEndDate]);
  
  const loadStats = async () => {
    if (!currentBaby) return;
    
    setLoading(true);
    try {
      let startDate: Date;
      let endDate: Date;
      let days: number;
      
      if (timeRange === 'custom') {
        startDate = customStartDate;
        endDate = customEndDate;
        days = differenceInDays(endDate, startDate) + 1;
      } else {
        days = timeRange === '7days' ? 7 : 
               timeRange === '14days' ? 14 : 
               timeRange === '3months' ? 90 : 30;
        const today = startOfDay(new Date());
        startDate = subDays(today, days - 1);
        endDate = endOfDay(new Date());
      }
      
      // 获取数据
      const feedings = await FeedingService.getByDateRange(
        currentBaby.id,
        startDate.getTime(),
        endDate.getTime()
      );
      
      const sleeps = await SleepService.getByDateRange(
        currentBaby.id,
        startDate.getTime(),
        endDate.getTime()
      );
      
      const diapers = await DiaperService.getByDateRange(
        currentBaby.id,
        startDate.getTime(),
        endDate.getTime()
      );
      
      // 保存原始数据
      setRawFeedings(feedings);
      setRawSleeps(sleeps);
      setRawDiapers(diapers);
      
      // 按日期分组统计
      const dateLabels: string[] = [];
      const feedingCounts: number[] = [];
      const sleepDurations: number[] = [];
      const diaperCounts: number[] = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(endDate, i);
        const dateStart = startOfDay(date).getTime();
        const dateEnd = dateStart + 24 * 60 * 60 * 1000 - 1;
        
        dateLabels.push(format(date, 'MM/dd'));
        
        // 喂养次数
        const dayFeedings = feedings.filter(f => f.time >= dateStart && f.time <= dateEnd);
        feedingCounts.push(dayFeedings.length);
        
        // 睡眠时长
        const daySleeps = sleeps.filter(s => s.startTime >= dateStart && s.startTime <= dateEnd);
        const totalSleepMinutes = daySleeps.reduce((sum, s) => sum + s.duration, 0);
        sleepDurations.push(Math.round(totalSleepMinutes / 60 * 10) / 10); // 转换为小时
        
        // 尿布次数
        const dayDiapers = diapers.filter(d => d.time >= dateStart && d.time <= dateEnd);
        diaperCounts.push(dayDiapers.length);
      }
      
      setFeedingData({
        labels: dateLabels,
        datasets: [{ data: feedingCounts }],
      });
      
      setSleepData({
        labels: dateLabels,
        datasets: [{ data: sleepDurations.length > 0 ? sleepDurations : [0] }],
      });
      
      setDiaperData({
        labels: dateLabels,
        datasets: [{ data: diaperCounts }],
      });
      
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getDays = () => {
    if (timeRange === 'custom') {
      return differenceInDays(customEndDate, customStartDate) + 1;
    }
    return timeRange === '7days' ? 7 : 
           timeRange === '14days' ? 14 : 
           timeRange === '3months' ? 90 : 30;
  };

  // 计算图表宽度：每天至少50像素，最小为屏幕宽度
  const getChartWidth = () => {
    const days = getDays();
    const minWidth = screenWidth - 48;
    const dynamicWidth = days * 50;
    return Math.max(minWidth, dynamicWidth);
  };

  // 处理日期选择
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setTempDate(selectedDate);
      if (Platform.OS === 'ios') {
        // iOS 不自动关闭，需要在确认按钮中处理
        return;
      }
      confirmDateSelection(selectedDate);
    }
  };

  const confirmDateSelection = (date: Date) => {
    if (datePickerMode === 'start') {
      const newStartDate = startOfDay(date);
      if (newStartDate > customEndDate) {
        Alert.alert('提示', '开始日期不能晚于结束日期');
        return;
      }
      setCustomStartDate(newStartDate);
    } else {
      const newEndDate = endOfDay(date);
      if (newEndDate < customStartDate) {
        Alert.alert('提示', '结束日期不能早于开始日期');
        return;
      }
      setCustomEndDate(newEndDate);
    }
    setShowDatePicker(false);
  };

  const openDatePicker = (mode: 'start' | 'end') => {
    setDatePickerMode(mode);
    setTempDate(mode === 'start' ? customStartDate : customEndDate);
    setShowDatePicker(true);
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
  };

  const getDateRangeText = () => {
    if (timeRange === 'custom') {
      return `${format(customStartDate, 'MM/dd')} - ${format(customEndDate, 'MM/dd')}`;
    }
    return null;
  };

  const generateReport = () => {
    if (!currentBaby) {
      Alert.alert('提示', '请先选择宝宝');
      return;
    }

    // 计算统计数据
    const days = getDays();
    
    // 喂养统计
    const feedingStats = {
      totalCount: rawFeedings.length,
      avgPerDay: rawFeedings.length / days,
      totalAmount: rawFeedings.reduce((sum, f) => sum + (f.amount || 0), 0),
      totalDuration: rawFeedings.reduce((sum, f) => sum + (f.duration || 0) + (f.leftDuration || 0) + (f.rightDuration || 0), 0),
    };

    // 睡眠统计
    const sleepDurations = rawSleeps.map(s => s.duration || 0);
    const sleepStats = {
      totalDuration: sleepDurations.reduce((sum, d) => sum, 0),
      avgPerDay: sleepDurations.reduce((sum, d) => sum + d, 0) / 60 / days,
      longestSleep: Math.max(...sleepDurations, 0),
    };

    // 尿布统计
    const diaperStats = {
      totalCount: rawDiapers.length,
      avgPerDay: rawDiapers.length / days,
      peeCount: rawDiapers.filter(d => d.type === 'pee' || d.type === 'both').length,
      poopCount: rawDiapers.filter(d => d.type === 'poop' || d.type === 'both').length,
    };

    // 获取日期范围
    let startDate: Date;
    let endDate: Date;
    
    if (timeRange === 'custom') {
      startDate = customStartDate;
      endDate = customEndDate;
    } else {
      const today = startOfDay(new Date());
      const daysCount = timeRange === '7days' ? 7 : 
                       timeRange === '14days' ? 14 : 
                       timeRange === '3months' ? 90 : 30;
      startDate = subDays(today, daysCount - 1);
      endDate = endOfDay(new Date());
    }

    // 导航到报告页面
    (navigation as any).navigate('StatsReport', {
      babyName: currentBaby.name,
      startDate,
      endDate,
      feedingData,
      sleepData,
      diaperData,
      feedingStats,
      sleepStats,
      diaperStats,
    });
  };

  const chartConfig = {
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#007AFF',
    },
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
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>数据统计</Text>
          <TouchableOpacity 
            style={styles.reportButton}
            onPress={generateReport}
          >
            <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
            <Text style={styles.reportButtonText}>生成报告</Text>
          </TouchableOpacity>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.timeRangeSelector}
          contentContainerStyle={styles.timeRangeSelectorContent}
        >
          {[
            { value: '7days', label: '7天' },
            { value: '14days', label: '14天' },
            { value: '30days', label: '30天' },
            { value: '3months', label: '3个月' },
            { value: 'custom', label: '自定义' },
          ].map(range => (
            <TouchableOpacity
              key={range.value}
              style={[
                styles.rangeButton,
                timeRange === range.value && styles.rangeButtonActive,
              ]}
              onPress={() => handleTimeRangeChange(range.value as TimeRange)}
            >
              <Text
                style={[
                  styles.rangeButtonText,
                  timeRange === range.value && styles.rangeButtonTextActive,
                ]}
              >
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* 自定义日期范围 */}
        {timeRange === 'custom' && (
          <View style={styles.customDateContainer}>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => openDatePicker('start')}
            >
              <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
              <Text style={styles.dateButtonLabel}>开始</Text>
              <Text style={styles.dateButtonText}>
                {format(customStartDate, 'yyyy/MM/dd', { locale: zhCN })}
              </Text>
            </TouchableOpacity>
            
            <Ionicons name="arrow-forward" size={16} color="#8E8E93" />
            
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => openDatePicker('end')}
            >
              <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
              <Text style={styles.dateButtonLabel}>结束</Text>
              <Text style={styles.dateButtonText}>
                {format(customEndDate, 'yyyy/MM/dd', { locale: zhCN })}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 喂养趋势 */}
        {feedingData && (
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View style={styles.chartTitleRow}>
                <Ionicons name="nutrition" size={24} color={Colors.feeding} />
                <Text style={styles.chartTitle}>喂养趋势</Text>
              </View>
              <Text style={styles.chartUnit}>次/天</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={feedingData}
                width={getChartWidth()}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`,
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: Colors.feeding,
                  },
                }}
                bezier
                style={styles.chart}
              />
            </ScrollView>
          </View>
        )}
        
        {/* 睡眠趋势 */}
        {sleepData && (
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View style={styles.chartTitleRow}>
                <Ionicons name="moon" size={24} color={Colors.sleep} />
                <Text style={styles.chartTitle}>睡眠趋势</Text>
              </View>
              <Text style={styles.chartUnit}>小时/天</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={sleepData}
                width={getChartWidth()}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(88, 86, 214, ${opacity})`,
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: Colors.sleep,
                  },
                }}
                bezier
                style={styles.chart}
              />
            </ScrollView>
          </View>
        )}
        
        {/* 尿布统计 */}
        {diaperData && (
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View style={styles.chartTitleRow}>
                <Ionicons name="water" size={24} color={Colors.diaper} />
                <Text style={styles.chartTitle}>尿布统计</Text>
              </View>
              <Text style={styles.chartUnit}>次/天</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart
                data={diaperData}
                width={getChartWidth()}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
                }}
                style={styles.chart}
                yAxisLabel=""
                yAxisSuffix=""
                fromZero
              />
            </ScrollView>
          </View>
        )}
        
        <View style={styles.footer} />
      </ScrollView>
      
      {/* 日期选择器 */}
      {Platform.OS === 'ios' ? (
        <Modal
          visible={showDatePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.datePickerButton}>取消</Text>
                </TouchableOpacity>
                <Text style={styles.datePickerTitle}>
                  {datePickerMode === 'start' ? '选择开始日期' : '选择结束日期'}
                </Text>
                <TouchableOpacity onPress={() => confirmDateSelection(tempDate)}>
                  <Text style={[styles.datePickerButton, styles.datePickerConfirm]}>确定</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                locale="zh-CN"
                maximumDate={new Date()}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: `${Colors.primary}10`,
  },
  reportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  timeRangeSelector: {
    marginBottom: 12,
  },
  timeRangeSelectorContent: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 0,
  },
  rangeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    minWidth: 70,
  },
  rangeButtonActive: {
    backgroundColor: '#007AFF',
  },
  rangeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  rangeButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  chartUnit: {
    fontSize: 14,
    color: '#8E8E93',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
  },
  footer: {
    height: 32,
  },
  customDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 12,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F7',
    gap: 6,
  },
  dateButtonLabel: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  dateButtonText: {
    fontSize: 13,
    color: '#000',
    fontWeight: '600',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  datePickerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  datePickerButton: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '400',
  },
  datePickerConfirm: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
