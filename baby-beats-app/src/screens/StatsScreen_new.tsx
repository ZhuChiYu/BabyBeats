import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Dimensions, TouchableOpacity, Alert, Platform } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { CustomDateTimePicker } from '../components/CustomDateTimePicker';
import { UrineTrackerCard } from '../components/UrineTrackerCard';
import { useBabyStore } from '../store/babyStore';
import { FeedingService } from '../services/feedingService';
import { SleepService } from '../services/sleepService';
import { DiaperService } from '../services/diaperService';
import { PumpingService } from '../services/pumpingService';
import { format, subDays, startOfDay, endOfDay, differenceInDays, isToday } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Colors } from '../constants';
import { useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

type TimeRange = 'today' | '7days' | '14days' | '30days' | 'custom';

interface StatsScreenProps {
  navigation: any;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({ navigation }) => {
  const { getCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();
  
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [milkAmountData, setMilkAmountData] = useState<any>(null);
  const [sleepData, setSleepData] = useState<any>(null);
  const [urineData, setUrineData] = useState<any>(null);
  const [poopData, setPoopData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // 今日统计数据
  const [todayStats, setTodayStats] = useState<any>(null);
  
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
      loadStats();
    }
  }, [currentBaby?.id, timeRange, customStartDate, customEndDate]);

  useFocusEffect(
    React.useCallback(() => {
      if (currentBaby) {
        loadStats();
      }
    }, [currentBaby?.id, timeRange, customStartDate, customEndDate])
  );
  
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
      
      if (timeRange === 'today') {
        // 今日统计
        calculateTodayStats(feedings, sleeps, diapers);
      } else {
        // 趋势统计
        calculateTrendStats(feedings, sleeps, diapers, startDate, endDate, days);
      }
      
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const calculateTodayStats = (feedings: any[], sleeps: any[], diapers: any[]) => {
    // 喂养统计
    const totalMilk = feedings.reduce((sum, f) => {
      if (f.type === 'breast') {
        return sum; // 母乳亲喂不计入ml数
      }
      return sum + (f.milkAmount || 0);
    }, 0);
    
    const breastFeedings = feedings.filter(f => f.type === 'breast');
    const breastDuration = breastFeedings.reduce((sum, f) => 
      sum + (f.leftDuration || 0) + (f.rightDuration || 0), 0
    );
    
    // 睡眠统计
    const totalSleepMinutes = sleeps.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalSleepHours = (totalSleepMinutes / 60).toFixed(1);
    
    // 尿布统计
    const peeCount = diapers.filter(d => d.type === 'pee' || d.type === 'both').length;
    const poopCount = diapers.filter(d => d.type === 'poop' || d.type === 'both').length;
    const totalUrineAmount = diapers
      .filter(d => (d.type === 'pee' || d.type === 'both') && d.urineAmount)
      .reduce((sum, d) => sum + d.urineAmount, 0);
    
    setTodayStats({
      feedingCount: feedings.length,
      totalMilk,
      breastFeedings: breastFeedings.length,
      breastDuration,
      sleepCount: sleeps.length,
      totalSleepHours,
      peeCount,
      poopCount,
      totalUrineAmount: totalUrineAmount.toFixed(1),
    });
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
            { value: 'today', label: '今日' },
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
        {timeRange === 'today' && todayStats ? (
          /* 今日统计 */
          <View>
            {/* 喂养卡片 */}
            <View style={styles.todayCard}>
              <View style={styles.todayCardHeader}>
                <Ionicons name="nutrition" size={24} color={Colors.feeding} />
                <Text style={styles.todayCardTitle}>今日喂养</Text>
              </View>
              <View style={styles.todayStatsRow}>
                <View style={styles.todayStat}>
                  <Text style={styles.todayStatValue}>{todayStats.feedingCount}</Text>
                  <Text style={styles.todayStatLabel}>总次数</Text>
                </View>
                <View style={styles.todayStat}>
                  <Text style={styles.todayStatValue}>{todayStats.totalMilk}</Text>
                  <Text style={styles.todayStatLabel}>奶量(ml)</Text>
                </View>
                <View style={styles.todayStat}>
                  <Text style={styles.todayStatValue}>{todayStats.breastFeedings}</Text>
                  <Text style={styles.todayStatLabel}>亲喂次数</Text>
                </View>
                <View style={styles.todayStat}>
                  <Text style={styles.todayStatValue}>{todayStats.breastDuration}</Text>
                  <Text style={styles.todayStatLabel}>亲喂(分钟)</Text>
                </View>
              </View>
            </View>

            {/* 睡眠卡片 */}
            <View style={styles.todayCard}>
              <View style={styles.todayCardHeader}>
                <Ionicons name="moon" size={24} color={Colors.sleep} />
                <Text style={styles.todayCardTitle}>今日睡眠</Text>
              </View>
              <View style={styles.todayStatsRow}>
                <View style={styles.todayStat}>
                  <Text style={styles.todayStatValue}>{todayStats.sleepCount}</Text>
                  <Text style={styles.todayStatLabel}>睡眠次数</Text>
                </View>
                <View style={styles.todayStat}>
                  <Text style={styles.todayStatValue}>{todayStats.totalSleepHours}</Text>
                  <Text style={styles.todayStatLabel}>总时长(小时)</Text>
                </View>
              </View>
            </View>

            {/* 尿布卡片 */}
            <View style={styles.todayCard}>
              <View style={styles.todayCardHeader}>
                <Ionicons name="water" size={24} color={Colors.diaper} />
                <Text style={styles.todayCardTitle}>今日尿布</Text>
              </View>
              <View style={styles.todayStatsRow}>
                <View style={styles.todayStat}>
                  <Text style={styles.todayStatValue}>{todayStats.peeCount}</Text>
                  <Text style={styles.todayStatLabel}>小便次数</Text>
                </View>
                <View style={styles.todayStat}>
                  <Text style={styles.todayStatValue}>{todayStats.poopCount}</Text>
                  <Text style={styles.todayStatLabel}>大便次数</Text>
                </View>
                <View style={styles.todayStat}>
                  <Text style={styles.todayStatValue}>{todayStats.totalUrineAmount}</Text>
                  <Text style={styles.todayStatLabel}>尿量(g)</Text>
                </View>
              </View>
            </View>

            {/* 尿量追踪卡片 */}
            {currentBaby && (
              <UrineTrackerCard
                babyId={currentBaby.id}
                babyAgeInMonths={Math.floor((Date.now() - currentBaby.birthDate) / (30 * 24 * 60 * 60 * 1000))}
                babyWeightKg={10} // 可以从最近的成长记录获取
              />
            )}
          </View>
        ) : (
          /* 趋势图表 */
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
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                </ScrollView>
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
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                </ScrollView>
              </View>
            )}
          </View>
        )}
        
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* 日期选择器 */}
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
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#F5F5F7',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  customDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  dateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
  },
  dateButtonText: {
    fontSize: 14,
    color: '#000000',
  },
  dateSeparator: {
    fontSize: 14,
    color: '#8E8E93',
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
  },
  todayCard: {
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
  todayCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  todayCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  todayStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  todayStat: {
    alignItems: 'center',
  },
  todayStatValue: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  todayStatLabel: {
    fontSize: 12,
    color: '#8E8E93',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  chartUnit: {
    fontSize: 12,
    color: '#8E8E93',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: '#8E8E93',
  },
});


