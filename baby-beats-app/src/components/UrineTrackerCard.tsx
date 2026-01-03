import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DiaperService } from '../services/diaperService';
import { UrineStandardService } from '../utils/urineStandard';
import { Colors } from '../constants';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

interface UrineTrackerCardProps {
  babyId: string;
  babyAgeInMonths: number;
  babyWeightKg?: number;
}

export const UrineTrackerCard: React.FC<UrineTrackerCardProps> = ({
  babyId,
  babyAgeInMonths,
  babyWeightKg,
}) => {
  const [dailyRecords, setDailyRecords] = useState<Array<{ date: string; amount: number }>>([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    loadUrineData();
  }, [babyId]);

  const loadUrineData = async () => {
    try {
      const records = await DiaperService.getDailyUrineRecords(babyId, 7);
      setDailyRecords(records);
      
      // 今日尿量是最后一条
      if (records.length > 0) {
        setTodayTotal(records[records.length - 1].amount);
      }
    } catch (error) {
      console.error('Failed to load urine data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStandardRange = () => {
    if (!babyWeightKg) return null;
    return UrineStandardService.getRecommendedRange(babyWeightKg, babyAgeInMonths);
  };

  const getAssessment = () => {
    if (!babyWeightKg || todayTotal === 0) return null;
    return UrineStandardService.assessUrineAmount(todayTotal, babyWeightKg, babyAgeInMonths);
  };

  const standardRange = getStandardRange();
  const assessment = getAssessment();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }

  // 如果没有尿量数据，不显示这个卡片
  if (dailyRecords.every(r => r.amount === 0)) {
    return null;
  }

  const getStatusColor = () => {
    if (!assessment) return Colors.textSecondary;
    switch (assessment.status) {
      case 'low':
        return '#FF9500';
      case 'high':
        return '#5AC8FA';
      case 'normal':
        return Colors.success;
      default:
        return Colors.textSecondary;
    }
  };

  const getProgressPercentage = () => {
    if (!standardRange) return 0;
    const target = standardRange.min;
    return Math.min((todayTotal / target) * 100, 100);
  };

  return (
    <View style={styles.container}>
      {/* 标题栏 */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="water" size={24} color="#34C759" />
          <Text style={styles.title}>尿量追踪</Text>
        </View>
        <TouchableOpacity onPress={() => setShowChart(!showChart)}>
          <Ionicons
            name={showChart ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* 今日尿量 */}
      <View style={styles.todaySection}>
        <View style={styles.todayAmountRow}>
          <Text style={styles.todayLabel}>今日总尿量</Text>
          <View style={styles.amountContainer}>
            <Text style={[styles.todayAmount, { color: getStatusColor() }]}>
              {todayTotal}
            </Text>
            <Text style={styles.unit}>克</Text>
          </View>
        </View>

        {standardRange && (
          <View style={styles.standardRow}>
            <Text style={styles.standardLabel}>
              {standardRange.description}标准: {UrineStandardService.formatUrineRange(standardRange.min, standardRange.max)}
            </Text>
          </View>
        )}

        {/* 进度条 */}
        {standardRange && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${getProgressPercentage()}%`,
                    backgroundColor: getStatusColor(),
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{Math.round(getProgressPercentage())}%</Text>
          </View>
        )}

        {/* 评估结果 */}
        {assessment && (
          <View style={[styles.assessmentBox, { borderLeftColor: getStatusColor() }]}>
            <Text style={[styles.assessmentStatus, { color: getStatusColor() }]}>
              {assessment.message}
            </Text>
            {assessment.recommendation && (
              <Text style={styles.assessmentRecommendation}>
                {assessment.recommendation}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* 7天趋势图 */}
      {showChart && dailyRecords.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>近7天趋势</Text>
          <LineChart
            data={{
              labels: dailyRecords.map(r => r.date),
              datasets: [
                {
                  data: dailyRecords.map(r => r.amount),
                  color: () => '#34C759',
                  strokeWidth: 2,
                },
                // 标准线
                ...(standardRange
                  ? [
                      {
                        data: Array(dailyRecords.length).fill(standardRange.min),
                        color: () => '#007AFF',
                        strokeWidth: 1,
                        withDots: false,
                      },
                    ]
                  : []),
              ],
              legend: ['实际尿量', ...(standardRange ? ['标准最小值'] : [])],
            }}
            width={screenWidth - 64}
            height={200}
            chartConfig={{
              backgroundColor: '#FFFFFF',
              backgroundGradientFrom: '#FFFFFF',
              backgroundGradientTo: '#FFFFFF',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#34C759',
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      {/* 提示信息 */}
      <View style={styles.hintContainer}>
        <Ionicons name="information-circle-outline" size={16} color={Colors.textSecondary} />
        <Text style={styles.hintText}>
          在记录尿布时勾选"记录尿量"并称重即可追踪
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  todaySection: {
    paddingVertical: 12,
  },
  todayAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  todayLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  todayAmount: {
    fontSize: 32,
    fontWeight: '700',
  },
  unit: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  standardRow: {
    marginBottom: 12,
  },
  standardLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    width: 40,
    textAlign: 'right',
  },
  assessmentBox: {
    backgroundColor: '#F5F5F7',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  assessmentStatus: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  assessmentRecommendation: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  chartContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  hintText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 6,
    flex: 1,
  },
});

