import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';
import { useBabyStore } from '../store/babyStore';
import { FeedingService } from '../services/feedingService';
import { SleepService } from '../services/sleepService';
import { DiaperService } from '../services/diaperService';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, subWeeks, subMonths } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Colors } from '../constants';
import { useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

type ReportType = 'week' | 'month';

interface ReportData {
  period: string;
  feeding: {
    totalCount: number;
    avgPerDay: number;
    breastCount: number;
    bottleCount: number;
    formulaCount: number;
  };
  sleep: {
    totalHours: number;
    avgPerDay: number;
    longestSession: number;
  };
  diaper: {
    totalCount: number;
    avgPerDay: number;
    poopCount: number;
    peeCount: number;
  };
}

export const ReportsScreen: React.FC = () => {
  const { getCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();
  
  const [reportType, setReportType] = useState<ReportType>('week');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (currentBaby) {
      loadReport();
    }
  }, [currentBaby?.id, reportType]);

  // 监听页面聚焦，自动刷新数据
  useFocusEffect(
    React.useCallback(() => {
      if (currentBaby) {
        loadReport();
      }
    }, [currentBaby?.id, reportType])
  );
  
  const loadReport = async () => {
    if (!currentBaby) return;
    
    setLoading(true);
    try {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;
      let period: string;
      
      if (reportType === 'week') {
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        period = `${format(startDate, 'MM月dd日')} - ${format(endDate, 'MM月dd日')}`;
      } else {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        period = format(now, 'yyyy年MM月', { locale: zhCN });
      }
      
      const days = eachDayOfInterval({ start: startDate, end: endDate }).length;
      
      // 获取数据
      const [feedings, sleeps, diapers] = await Promise.all([
        FeedingService.getByDateRange(currentBaby.id, startDate.getTime(), endDate.getTime()),
        SleepService.getByDateRange(currentBaby.id, startDate.getTime(), endDate.getTime()),
        DiaperService.getByDateRange(currentBaby.id, startDate.getTime(), endDate.getTime()),
      ]);
      
      // 统计喂养
      const breastCount = feedings.filter(f => f.type === 'breast').length;
      const bottleCount = feedings.filter(f => f.type === 'bottled_breast_milk').length;
      const formulaCount = feedings.filter(f => f.type === 'formula').length;
      
      // 统计睡眠
      const totalSleepMinutes = sleeps.reduce((sum, s) => sum + s.duration, 0);
      const longestSession = Math.max(...sleeps.map(s => s.duration), 0);
      
      // 统计尿布
      const poopCount = diapers.filter(d => d.type === 'poop' || d.type === 'both').length;
      const peeCount = diapers.filter(d => d.type === 'pee' || d.type === 'both').length;
      
      setReportData({
        period,
        feeding: {
          totalCount: feedings.length,
          avgPerDay: Number((feedings.length / days).toFixed(1)),
          breastCount,
          bottleCount,
          formulaCount,
        },
        sleep: {
          totalHours: Number((totalSleepMinutes / 60).toFixed(1)),
          avgPerDay: Number((totalSleepMinutes / 60 / days).toFixed(1)),
          longestSession: Math.round(longestSession),
        },
        diaper: {
          totalCount: diapers.length,
          avgPerDay: Number((diapers.length / days).toFixed(1)),
          poopCount,
          peeCount,
        },
      });
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const renderStatCard = (
    icon: string,
    title: string,
    color: string,
    stats: { label: string; value: string | number }[]
  ) => {

    return (
      <View style={styles.statCard}>
        <View style={styles.statHeader}>
          <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
            <Ionicons name={icon as any} size={24} color={color} />
          </View>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <View style={styles.statContent}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>
      </View>
    );
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
        <Text style={styles.headerTitle}>统计报告</Text>
        <View style={styles.reportTypeSelector}>
          {[
            { value: 'week', label: '本周' },
            { value: 'month', label: '本月' },
          ].map(type => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.reportTypeButton,
                reportType === type.value && styles.reportTypeButtonActive,
              ]}
              onPress={() => setReportType(type.value as ReportType)}
            >
              <Text
                style={[
                  styles.reportTypeButtonText,
                  reportType === type.value && styles.reportTypeButtonTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : reportData ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 时间范围 */}
          <View style={styles.periodCard}>
            <Ionicons name="calendar-outline" size={24} color={Colors.primary} />
            <Text style={styles.periodText}>{reportData.period}</Text>
          </View>
          
          {/* 喂养统计 */}
          {renderStatCard('nutrition', '喂养统计', Colors.feeding, [
            { label: '总次数', value: `${reportData.feeding.totalCount}次` },
            { label: '日均', value: `${reportData.feeding.avgPerDay}次/天` },
            { label: '亲喂', value: `${reportData.feeding.breastCount}次` },
            { label: '瓶喂', value: `${reportData.feeding.bottleCount}次` },
            { label: '配方奶', value: `${reportData.feeding.formulaCount}次` },
          ])}
          
          {/* 睡眠统计 */}
          {renderStatCard('moon', '睡眠统计', Colors.sleep, [
            { label: '总时长', value: `${reportData.sleep.totalHours}小时` },
            { label: '日均', value: `${reportData.sleep.avgPerDay}小时/天` },
            { label: '最长单次', value: `${Math.floor(reportData.sleep.longestSession / 60)}h${reportData.sleep.longestSession % 60}m` },
          ])}
          
          {/* 尿布统计 */}
          {renderStatCard('water', '尿布统计', Colors.diaper, [
            { label: '总次数', value: `${reportData.diaper.totalCount}次` },
            { label: '日均', value: `${reportData.diaper.avgPerDay}次/天` },
            { label: '大便', value: `${reportData.diaper.poopCount}次` },
            { label: '小便', value: `${reportData.diaper.peeCount}次` },
          ])}
          
          {/* 图表可视化 */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>每日对比</Text>
            <BarChart
              data={{
                labels: ['喂养', '睡眠', '尿布'],
                datasets: [{
                  data: [
                    reportData.feeding.avgPerDay,
                    reportData.sleep.avgPerDay,
                    reportData.diaper.avgPerDay,
                  ],
                }],
              }}
              width={screenWidth - 64}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: '#FFFFFF',
                backgroundGradientFrom: '#FFFFFF',
                backgroundGradientTo: '#FFFFFF',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              style={styles.chart}
              fromZero
            />
          </View>
          
          <View style={styles.footer} />
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#C7C7CC" />
          <Text style={styles.emptyText}>暂无数据</Text>
        </View>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  reportTypeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  reportTypeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
  },
  reportTypeButtonActive: {
    backgroundColor: Colors.primary,
  },
  reportTypeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  reportTypeButtonTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  periodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  periodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  statCard: {
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
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  statContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    minWidth: '30%',
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
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
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
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

