import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useBabyStore } from '../store/babyStore';
import { FeedingService } from '../services/feedingService';
import { SleepService } from '../services/sleepService';
import { DiaperService } from '../services/diaperService';
import { PumpingService } from '../services/pumpingService';
import { format, subDays, startOfDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Colors } from '../constants';

const screenWidth = Dimensions.get('window').width;

type TimeRange = '7days' | '14days' | '30days';

export const StatsScreen: React.FC = () => {
  const { getCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();
  
  const [timeRange, setTimeRange] = useState<TimeRange>('7days');
  const [feedingData, setFeedingData] = useState<any>(null);
  const [sleepData, setSleepData] = useState<any>(null);
  const [diaperData, setDiaperData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (currentBaby) {
      loadStats();
    }
  }, [currentBaby?.id, timeRange]);
  
  const loadStats = async () => {
    if (!currentBaby) return;
    
    setLoading(true);
    try {
      const days = timeRange === '7days' ? 7 : timeRange === '14days' ? 14 : 30;
      const today = startOfDay(new Date());
      const startDate = subDays(today, days - 1);
      
      // 获取数据
      const feedings = await FeedingService.getByDateRange(
        currentBaby.id,
        startDate.getTime(),
        Date.now()
      );
      
      const sleeps = await SleepService.getByDateRange(
        currentBaby.id,
        startDate.getTime(),
        Date.now()
      );
      
      const diapers = await DiaperService.getByDateRange(
        currentBaby.id,
        startDate.getTime(),
        Date.now()
      );
      
      // 按日期分组统计
      const dateLabels: string[] = [];
      const feedingCounts: number[] = [];
      const sleepDurations: number[] = [];
      const diaperCounts: number[] = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(today, i);
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
            onPress={() => Alert.alert('提示', '周/月报告功能已开发，详见设置页面')}
          >
            <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
            <Text style={styles.reportButtonText}>报告</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.timeRangeSelector}>
          {[
            { value: '7days', label: '7天' },
            { value: '14days', label: '14天' },
            { value: '30days', label: '30天' },
          ].map(range => (
            <TouchableOpacity
              key={range.value}
              style={[
                styles.rangeButton,
                timeRange === range.value && styles.rangeButtonActive,
              ]}
              onPress={() => setTimeRange(range.value as TimeRange)}
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
        </View>
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
            <LineChart
              data={feedingData}
              width={screenWidth - 48}
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
            <LineChart
              data={sleepData}
              width={screenWidth - 48}
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
            <BarChart
              data={diaperData}
              width={screenWidth - 48}
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
          </View>
        )}
        
        <View style={styles.footer} />
      </ScrollView>
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
    flexDirection: 'row',
    gap: 8,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
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
});
