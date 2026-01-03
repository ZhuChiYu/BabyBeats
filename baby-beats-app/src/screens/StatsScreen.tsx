import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Dimensions, TouchableOpacity, Alert, Platform, GestureResponderEvent } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { CustomDateTimePicker } from '../components/CustomDateTimePicker';
import { useBabyStore } from '../store/babyStore';
import { UrineStandardService } from '../utils/urineStandard';
import { FeedingService } from '../services/feedingService';
import { SleepService } from '../services/sleepService';
import { DiaperService } from '../services/diaperService';
import { PumpingService } from '../services/pumpingService';
import { GrowthService } from '../services/growthService';
import { format, subDays, startOfDay, endOfDay, differenceInDays, isToday } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Colors } from '../constants';
import { useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

type TimeRange = '7days' | '14days' | '30days' | 'custom';

interface StatsScreenProps {
  navigation: any;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({ navigation }) => {
  const { getCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();
  
  const [timeRange, setTimeRange] = useState<TimeRange>('7days');
  const [milkAmountData, setMilkAmountData] = useState<any>(null);
  const [sleepData, setSleepData] = useState<any>(null);
  const [urineData, setUrineData] = useState<any>(null);
  const [poopData, setPoopData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // 保存图表标签以便点击时使用
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  
  // 每个图表的数据点提示信息
  const [milkTooltip, setMilkTooltip] = useState<{visible: boolean; label: string; value: string; unit: string}>({
    visible: false, label: '', value: '', unit: '',
  });
  const [sleepTooltip, setSleepTooltip] = useState<{visible: boolean; label: string; value: string; unit: string}>({
    visible: false, label: '', value: '', unit: '',
  });
  const [urineTooltip, setUrineTooltip] = useState<{visible: boolean; label: string; value: string; unit: string}>({
    visible: false, label: '', value: '', unit: '',
  });
  const [poopTooltip, setPoopTooltip] = useState<{visible: boolean; label: string; value: string; unit: string}>({
    visible: false, label: '', value: '', unit: '',
  });
  
  // 宝宝最新体重
  const [latestWeight, setLatestWeight] = useState<number>(10);
  
  // 保存原始数据
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
      loadBabyWeight();
      loadStats();
    }
  }, [currentBaby?.id, timeRange, customStartDate, customEndDate]);

  useFocusEffect(
    React.useCallback(() => {
      if (currentBaby) {
        loadBabyWeight();
        loadStats();
      }
    }, [currentBaby?.id, timeRange, customStartDate, customEndDate])
  );
  
  const loadBabyWeight = async () => {
    if (!currentBaby) return;
    try {
      const growthRecords = await GrowthService.getByBabyId(currentBaby.id);
      if (growthRecords.length > 0) {
        // 获取最近的体重记录
        const latestRecord = growthRecords[0];
        if (latestRecord.weight) {
          setLatestWeight(latestRecord.weight);
        }
      }
    } catch (error) {
      console.error('Failed to load baby weight:', error);
    }
  };
  
  const loadStats = async () => {
    if (!currentBaby) return;
    
    setLoading(true);
    try {
      let startDate: Date;
      let endDate: Date;
      let days: number;
      
      if (timeRange === 'today') {
        startDate = startOfDay(new Date());
        endDate = endOfDay(new Date());
        days = 1;
      } else if (timeRange === 'custom') {
        startDate = customStartDate;
        endDate = customEndDate;
        days = differenceInDays(endDate, startDate) + 1;
      } else {
        days = timeRange === '7days' ? 7 : 
               timeRange === '14days' ? 14 : 30;
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
      
      // 趋势统计
      calculateTrendStats(feedings, sleeps, diapers, startDate, endDate, days);
      
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const calculateTrendStats = (
    feedings: any[], 
    sleeps: any[], 
    diapers: any[], 
    startDate: Date, 
    endDate: Date, 
    days: number
  ) => {
    const dateLabels: string[] = [];
    const milkAmounts: number[] = [];
    const sleepDurations: number[] = [];
    const urineAmounts: number[] = [];
    const poopCounts: number[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(endDate, i);
      const dateStart = startOfDay(date).getTime();
      const dateEnd = dateStart + 24 * 60 * 60 * 1000 - 1;
      
      dateLabels.push(format(date, 'MM/dd'));
      
      // 奶量（ml）- 只统计瓶喂和配方奶
      const dayFeedings = feedings.filter(f => f.time >= dateStart && f.time <= dateEnd);
      const dayMilk = dayFeedings.reduce((sum, f) => {
        if (f.type === 'breast') return sum;
        return sum + (f.milkAmount || 0);
      }, 0);
      milkAmounts.push(dayMilk);
      
      // 睡眠时长
      const daySleeps = sleeps.filter(s => s.startTime >= dateStart && s.startTime <= dateEnd);
      const totalSleepMinutes = daySleeps.reduce((sum, s) => sum + s.duration, 0);
      sleepDurations.push(Math.round(totalSleepMinutes / 60 * 10) / 10);
      
      // 尿量统计
      const dayDiapers = diapers.filter(d => d.time >= dateStart && d.time <= dateEnd);
      const dayUrineAmount = dayDiapers
        .filter(d => (d.type === 'pee' || d.type === 'both') && d.urineAmount)
        .reduce((sum, d) => sum + d.urineAmount, 0);
      urineAmounts.push(Math.round(dayUrineAmount));
      
      // 大便次数
      const dayPoopCount = dayDiapers.filter(d => d.type === 'poop' || d.type === 'both').length;
      poopCounts.push(dayPoopCount);
    }
    
    // 保存标签用于点击事件
    setChartLabels(dateLabels);
    
    setMilkAmountData({
      labels: dateLabels,
      datasets: [{ data: milkAmounts.length > 0 ? milkAmounts : [0] }],
    });
    
    setSleepData({
      labels: dateLabels,
      datasets: [{ data: sleepDurations.length > 0 ? sleepDurations : [0] }],
    });
    
    setUrineData({
      labels: dateLabels,
      datasets: [{ data: urineAmounts.length > 0 ? urineAmounts : [0] }],
    });
    
    setPoopData({
      labels: dateLabels,
      datasets: [{ data: poopCounts.length > 0 ? poopCounts : [0] }],
    });
  };
  
  const getDays = () => {
    if (timeRange === 'today') return 1;
    if (timeRange === 'custom') {
      return differenceInDays(customEndDate, customStartDate) + 1;
    }
    return timeRange === '7days' ? 7 : 
           timeRange === '14days' ? 14 : 30;
  };

  const getChartWidth = () => {
    if (timeRange === 'today') return screenWidth - 48;
    const days = getDays();
    const minWidth = screenWidth - 48;
    const dynamicWidth = days * 50;
    return Math.max(minWidth, dynamicWidth);
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

  const getUrineStatusColor = (status: string) => {
    switch (status) {
      case 'low':
        return '#FF6B6B';
      case 'high':
        return '#4ECDC4';
      case 'normal':
        return '#51CF66';
      default:
        return '#8E8E93';
    }
  };

  const getUrineStatusBgColor = (status: string) => {
    switch (status) {
      case 'low':
        return '#FFE5E5';
      case 'high':
        return '#E0F9F7';
      case 'normal':
        return '#E7F5E7';
      default:
        return '#F5F5F7';
    }
  };

  const getUrineStatusIcon = (status: string) => {
    switch (status) {
      case 'low':
        return 'warning';
      case 'high':
        return 'arrow-up-circle';
      case 'normal':
        return 'checkmark-circle';
      default:
        return 'help-circle';
    }
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
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#E5E5EA',
      strokeWidth: 1,
    },
  };

  // 处理图表数据点点击
  const handleDataPointClick = (data: any, chartType: string, unit: string) => {
    try {
      const { index, value } = data;
      const dateLabel = chartLabels && chartLabels[index] ? chartLabels[index] : '';
      
      const tooltipData = {
        visible: true,
        label: dateLabel || chartType,
        value: typeof value === 'number' ? value.toFixed(1) : String(value),
        unit: unit,
      };

      // 根据图表类型设置对应的提示
      if (chartType === '奶量') {
        setMilkTooltip(tooltipData);
        setTimeout(() => setMilkTooltip(prev => ({ ...prev, visible: false })), 3000);
      } else if (chartType === '睡眠') {
        setSleepTooltip(tooltipData);
        setTimeout(() => setSleepTooltip(prev => ({ ...prev, visible: false })), 3000);
      }
    } catch (error) {
      console.log('处理数据点点击出错:', error);
    }
  };
  
  // 处理柱状图点击（使用触摸事件计算位置）
  const handleBarChartPress = (event: GestureResponderEvent, data: any, chartType: string, unit: string) => {
    try {
      const { locationX } = event.nativeEvent;
      const chartWidth = getChartWidth();
      
      // react-native-chart-kit 的 BarChart 布局参数
      // 左侧有Y轴标签和一些padding
      const paddingLeft = 60;
      const paddingRight = 16;
      const availableWidth = chartWidth - paddingLeft - paddingRight;
      const barCount = data.labels.length;
      
      // 每个柱子区域的宽度（包括柱子和间距）
      const barSectionWidth = availableWidth / barCount;
      
      // 计算点击位置相对于图表区域的位置
      const relativeX = locationX - paddingLeft;
      
      // 计算点击的是哪个柱子
      // 使用 Math.round 来获取最接近的柱子
      let clickedIndex = Math.round((relativeX - barSectionWidth / 2) / barSectionWidth);
      
      // 限制在有效范围内
      clickedIndex = Math.max(0, Math.min(clickedIndex, barCount - 1));
      
      console.log('柱状图点击调试:', {
        chartType,
        locationX,
        relativeX,
        barSectionWidth,
        clickedIndex,
        dateLabel: data.labels[clickedIndex],
        allLabels: data.labels,
        allValues: data.datasets[0].data
      });
      
      if (clickedIndex >= 0 && clickedIndex < data.labels.length) {
        const value = data.datasets[0].data[clickedIndex];
        const dateLabel = data.labels[clickedIndex];
        
        const tooltipData = {
          visible: true,
          label: dateLabel,
          value: typeof value === 'number' ? value.toFixed(1) : String(value),
          unit: unit,
        };

        // 根据图表类型设置对应的提示
        if (chartType === '尿量') {
          setUrineTooltip(tooltipData);
          setTimeout(() => setUrineTooltip(prev => ({ ...prev, visible: false })), 3000);
        } else if (chartType === '大便次数') {
          setPoopTooltip(tooltipData);
          setTimeout(() => setPoopTooltip(prev => ({ ...prev, visible: false })), 3000);
        }
      }
    } catch (error) {
      console.log('处理柱状图点击出错:', error);
    }
  };

  if (!currentBaby) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>请先添加宝宝信息</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 时间范围选择 */}
      <View style={styles.header}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
          {[
            { value: '7days', label: '近7天' },
            { value: '14days', label: '近14天' },
            { value: '30days', label: '近30天' },
            { value: 'custom', label: '自定义' },
          ].map(range => (
            <TouchableOpacity
              key={range.value}
              style={[
                styles.filterButton,
                timeRange === range.value && styles.filterButtonActive,
              ]}
              onPress={() => setTimeRange(range.value as TimeRange)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  timeRange === range.value && styles.filterButtonTextActive,
                ]}
              >
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {timeRange === 'custom' && (
          <View style={styles.customDateRow}>
            <TouchableOpacity style={styles.dateButton} onPress={() => openDatePicker('start')}>
              <Text style={styles.dateButtonText}>{format(customStartDate, 'MM/dd')}</Text>
            </TouchableOpacity>
            <Text style={styles.dateSeparator}>至</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => openDatePicker('end')}>
              <Text style={styles.dateButtonText}>{format(customEndDate, 'MM/dd')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 趋势图表 */}
        <View>
            {/* 奶量趋势 */}
            {milkAmountData && (
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <View style={styles.chartTitleRow}>
                    <Ionicons name="nutrition" size={24} color={Colors.feeding} />
                    <Text style={styles.chartTitle}>奶量趋势</Text>
                  </View>
                  <Text style={styles.chartUnit}>ml/天</Text>
                </View>
                <View style={styles.chartWrapper}>
                  {milkTooltip.visible && (
                    <View style={styles.chartTooltip}>
                      <View style={styles.tooltipContent}>
                        <Text style={styles.tooltipLabel}>{milkTooltip.label}</Text>
                        <Text style={styles.tooltipValue}>
                          {milkTooltip.value} {milkTooltip.unit}
                        </Text>
                      </View>
                    </View>
                  )}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <LineChart
                      data={milkAmountData}
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
                      onDataPointClick={(data) => handleDataPointClick(data, '奶量', 'ml')}
                    />
                  </ScrollView>
                </View>
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
                <View style={styles.chartWrapper}>
                  {sleepTooltip.visible && (
                    <View style={styles.chartTooltip}>
                      <View style={styles.tooltipContent}>
                        <Text style={styles.tooltipLabel}>{sleepTooltip.label}</Text>
                        <Text style={styles.tooltipValue}>
                          {sleepTooltip.value} {sleepTooltip.unit}
                        </Text>
                      </View>
                    </View>
                  )}
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
                      onDataPointClick={(data) => handleDataPointClick(data, '睡眠', '小时')}
                    />
                  </ScrollView>
                </View>
              </View>
            )}
            
            {/* 尿量统计 */}
            {urineData && (
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <View style={styles.chartTitleRow}>
                    <Ionicons name="water-outline" size={24} color="#34C759" />
                    <Text style={styles.chartTitle}>尿量统计</Text>
                  </View>
                  <Text style={styles.chartUnit}>g/天</Text>
                </View>
                <View style={styles.chartWrapper}>
                  {urineTooltip.visible && (
                    <View style={styles.chartTooltip}>
                      <View style={styles.tooltipContent}>
                        <Text style={styles.tooltipLabel}>{urineTooltip.label}</Text>
                        <Text style={styles.tooltipValue}>
                          {urineTooltip.value} {urineTooltip.unit}
                        </Text>
                      </View>
                    </View>
                  )}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity 
                      activeOpacity={1}
                      onPress={(e) => handleBarChartPress(e, urineData, '尿量', 'g')}
                    >
                      <BarChart
                        data={urineData}
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
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </View>
            )}
            
            {/* 大便次数 */}
            {poopData && (
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <View style={styles.chartTitleRow}>
                    <Ionicons name="medical" size={24} color="#FF9500" />
                    <Text style={styles.chartTitle}>大便次数</Text>
                  </View>
                  <Text style={styles.chartUnit}>次/天</Text>
                </View>
                <View style={styles.chartWrapper}>
                  {poopTooltip.visible && (
                    <View style={styles.chartTooltip}>
                      <View style={styles.tooltipContent}>
                        <Text style={styles.tooltipLabel}>{poopTooltip.label}</Text>
                        <Text style={styles.tooltipValue}>
                          {poopTooltip.value} {poopTooltip.unit}
                        </Text>
                      </View>
                    </View>
                  )}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity 
                      activeOpacity={1}
                      onPress={(e) => handleBarChartPress(e, poopData, '大便次数', '次')}
                    >
                      <BarChart
                        data={poopData}
                        width={getChartWidth()}
                        height={220}
                        chartConfig={{
                          ...chartConfig,
                          color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`,
                        }}
                        style={styles.chart}
                        yAxisLabel=""
                        yAxisSuffix=""
                        fromZero
                      />
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </View>
            )}
          </View>

        <View style={styles.footer} />
      </ScrollView>

      {/* 自定义日期选择器 */}
      <CustomDateTimePicker
        visible={showDatePicker}
        mode="date"
        value={tempDate}
        onConfirm={confirmDateSelection}
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
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingBottom: 8,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F5F5F7',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  customDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  dateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
  },
  dateButtonText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  dateSeparator: {
    marginHorizontal: 8,
    fontSize: 14,
    color: '#8E8E93',
  },
  content: {
    flex: 1,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chartTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  chartUnit: {
    fontSize: 13,
    color: '#8E8E93',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartWrapper: {
    position: 'relative',
  },
  chartTooltip: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    pointerEvents: 'none',
  },
  tooltipContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    minWidth: 100,
  },
  tooltipLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 2,
    textAlign: 'center',
    fontWeight: '500',
  },
  tooltipValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    marginTop: 32,
    fontSize: 16,
  },
  footer: {
    height: 32,
  },
});

export default StatsScreen;
