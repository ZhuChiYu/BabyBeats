import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Share,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';
import { format, differenceInDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

interface StatsReportScreenProps {
  navigation: any;
  route: {
    params: {
      babyName: string;
      startDate: Date;
      endDate: Date;
      feedingData: any;
      sleepData: any;
      diaperData: any;
      feedingStats?: {
        totalCount: number;
        avgPerDay: number;
        totalAmount: number;
        totalDuration: number;
      };
      sleepStats?: {
        totalDuration: number;
        avgPerDay: number;
        longestSleep: number;
      };
      diaperStats?: {
        totalCount: number;
        avgPerDay: number;
        poopCount: number;
        peeCount: number;
      };
    };
  };
}

export const StatsReportScreen: React.FC<StatsReportScreenProps> = ({ navigation, route }) => {
  const {
    babyName,
    startDate,
    endDate,
    feedingData,
    sleepData,
    diaperData,
    feedingStats,
    sleepStats,
    diaperStats,
  } = route.params;

  const days = differenceInDays(new Date(endDate), new Date(startDate)) + 1;

  const handleShare = async () => {
    const reportText = generateReportText();
    try {
      await Share.share({
        message: reportText,
        title: `${babyName}的成长报告`,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const generateReportText = () => {
    return `
📊 ${babyName}的成长报告
📅 统计时间：${format(new Date(startDate), 'yyyy年MM月dd日', { locale: zhCN })} - ${format(new Date(endDate), 'yyyy年MM月dd日', { locale: zhCN })}
⏱ 统计天数：${days}天

🍼 喂养情况
• 总次数：${feedingStats?.totalCount || 0}次
• 日均次数：${feedingStats?.avgPerDay.toFixed(1) || 0}次/天
${feedingStats?.totalAmount ? `• 总奶量：${feedingStats.totalAmount}ml\n` : ''}${feedingStats?.totalDuration ? `• 总时长：${Math.floor(feedingStats.totalDuration / 60)}小时${feedingStats.totalDuration % 60}分钟\n` : ''}
😴 睡眠情况
• 总时长：${Math.floor((sleepStats?.totalDuration || 0) / 60)}小时${(sleepStats?.totalDuration || 0) % 60}分钟
• 日均时长：${sleepStats?.avgPerDay.toFixed(1) || 0}小时/天
• 最长睡眠：${Math.floor((sleepStats?.longestSleep || 0) / 60)}小时${(sleepStats?.longestSleep || 0) % 60}分钟

🧷 尿布情况
• 总次数：${diaperStats?.totalCount || 0}次
• 日均次数：${diaperStats?.avgPerDay.toFixed(1) || 0}次/天
• 尿尿：${diaperStats?.peeCount || 0}次
• 便便：${diaperStats?.poopCount || 0}次

生成时间：${format(new Date(), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
来自：BabyBeats 宝宝成长记录
    `.trim();
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


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>统计报告</Text>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 报告标题 */}
        <View style={styles.reportHeader}>
          <Text style={styles.reportTitle}>{babyName}的成长报告</Text>
          <Text style={styles.reportDate}>
            {format(new Date(startDate), 'yyyy年MM月dd日', { locale: zhCN })} - {format(new Date(endDate), 'MM月dd日', { locale: zhCN })}
          </Text>
          <Text style={styles.reportDays}>共{days}天</Text>
        </View>

        {/* 总览卡片 */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>📊 数据总览</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{feedingStats?.totalCount || 0}</Text>
              <Text style={styles.summaryLabel}>喂养次数</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {Math.floor((sleepStats?.totalDuration || 0) / 60)}h
              </Text>
              <Text style={styles.summaryLabel}>睡眠时长</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{diaperStats?.totalCount || 0}</Text>
              <Text style={styles.summaryLabel}>尿布次数</Text>
            </View>
          </View>
        </View>

        {/* 喂养统计 */}
        <View style={styles.detailCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="nutrition" size={24} color={Colors.feeding} />
            <Text style={styles.cardTitle}>喂养情况</Text>
          </View>
          
          {feedingData && feedingData.labels.length > 0 && (
            <View style={styles.chartContainer}>
              <LineChart
                data={feedingData}
                width={screenWidth - 64}
                height={200}
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

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>总次数</Text>
              <Text style={styles.statValue}>{feedingStats?.totalCount || 0}次</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>日均次数</Text>
              <Text style={styles.statValue}>{feedingStats?.avgPerDay.toFixed(1) || 0}次</Text>
            </View>
            {feedingStats?.totalAmount ? (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>总奶量</Text>
                <Text style={styles.statValue}>{feedingStats.totalAmount}ml</Text>
              </View>
            ) : null}
            {feedingStats?.totalDuration ? (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>总时长</Text>
                <Text style={styles.statValue}>
                  {Math.floor(feedingStats.totalDuration / 60)}h{feedingStats.totalDuration % 60}m
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* 睡眠统计 */}
        <View style={styles.detailCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="moon" size={24} color={Colors.sleep} />
            <Text style={styles.cardTitle}>睡眠情况</Text>
          </View>
          
          {sleepData && sleepData.labels.length > 0 && (
            <View style={styles.chartContainer}>
              <LineChart
                data={sleepData}
                width={screenWidth - 64}
                height={200}
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

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>总时长</Text>
              <Text style={styles.statValue}>
                {Math.floor((sleepStats?.totalDuration || 0) / 60)}h{(sleepStats?.totalDuration || 0) % 60}m
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>日均时长</Text>
              <Text style={styles.statValue}>{sleepStats?.avgPerDay.toFixed(1) || 0}h</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>最长睡眠</Text>
              <Text style={styles.statValue}>
                {Math.floor((sleepStats?.longestSleep || 0) / 60)}h{(sleepStats?.longestSleep || 0) % 60}m
              </Text>
            </View>
          </View>
        </View>

        {/* 尿布统计 */}
        <View style={styles.detailCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="water" size={24} color={Colors.diaper} />
            <Text style={styles.cardTitle}>尿布情况</Text>
          </View>

          {diaperData && diaperData.labels.length > 0 && (
            <View style={styles.chartContainer}>
              <LineChart
                data={diaperData}
                width={screenWidth - 64}
                height={200}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: Colors.diaper,
                  },
                }}
                bezier
                style={styles.chart}
              />
            </View>
          )}

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>总次数</Text>
              <Text style={styles.statValue}>{diaperStats?.totalCount || 0}次</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>日均次数</Text>
              <Text style={styles.statValue}>{diaperStats?.avgPerDay.toFixed(1) || 0}次</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>尿尿</Text>
              <Text style={styles.statValue}>{diaperStats?.peeCount || 0}次</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>便便</Text>
              <Text style={styles.statValue}>{diaperStats?.poopCount || 0}次</Text>
            </View>
          </View>
        </View>

        {/* 报告尾部 */}
        <View style={styles.reportFooter}>
          <Text style={styles.footerText}>
            生成时间：{format(new Date(), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
          </Text>
          <Text style={styles.footerBrand}>BabyBeats 宝宝成长记录</Text>
        </View>

        <View style={{ height: 40 }} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  shareButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  reportHeader: {
    backgroundColor: Colors.primary,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  reportTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  reportDate: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  reportDays: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  statItem: {
    width: '50%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  reportFooter: {
    marginTop: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  footerBrand: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});

