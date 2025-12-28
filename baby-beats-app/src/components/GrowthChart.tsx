/**
 * 生长曲线图表组件（优化版 - 使用 react-native-svg）
 * 显示带有百分位区域填充的成长数据，参考专业儿保应用设计
 */

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
import Svg, { Polygon, Circle, Line, Text as SvgText } from 'react-native-svg';
import { GrowthRecord, Baby } from '../types';
import { GrowthMetric, Sex, getStandardDataset } from '../constants/growthStandards';
import { calculateAgeInMonths } from '../services/growthAssessment';
import { calculatePercentile } from '../utils/percentileCalculator';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

const screenWidth = Dimensions.get('window').width;

interface GrowthChartProps {
  baby: Baby;
  records: GrowthRecord[];
  metric: GrowthMetric;
}

type TimeRange = '6months' | '1year' | '3years';

export const GrowthChart: React.FC<GrowthChartProps> = ({
  baby,
  records,
  metric,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('1year');

  // 准备数据
  const chartData = useMemo(() => {
    const sex: Sex = baby.gender === 'male' ? 'male' : baby.gender === 'female' ? 'female' : 'male';
    const dataset = getStandardDataset(metric, sex);

    if (!dataset) return null;

    // 提取宝宝的实际数据点
    const babyPoints = records
      .filter(r => {
        if (metric === 'weight_for_age') return r.weight != null;
        if (metric === 'height_for_age') return r.height != null;
        if (metric === 'head_for_age') return r.headCirc != null;
        return false;
      })
      .map(r => {
        const ageMonths = calculateAgeInMonths(baby.birthday, r.date);
        let value = 0;
        if (metric === 'weight_for_age') value = r.weight!;
        if (metric === 'height_for_age') value = r.height!;
        if (metric === 'head_for_age') value = r.headCirc!;

        const result = calculatePercentile(dataset.points, ageMonths, value);

        return {
          x: ageMonths,
          y: value,
          date: r.date,
          record: r,
          percentile: result.percentile,
          status: result.status,
        };
      })
      .sort((a, b) => a.x - b.x);

    // 根据时间范围过滤
    let displayMaxAge = 12;
    if (timeRange === '6months') displayMaxAge = 6;
    if (timeRange === '1year') displayMaxAge = 12;
    if (timeRange === '3years') displayMaxAge = 36;

    // 过滤标准曲线数据
    const filteredStandardPoints = dataset.points.filter(p => p.x <= displayMaxAge);

    return {
      babyPoints,
      dataset,
      filteredStandardPoints,
      displayMaxAge,
    };
  }, [baby, records, metric, timeRange]);

  if (!chartData) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="analytics-outline" size={48} color="#C7C7CC" />
        <Text style={styles.emptyText}>暂无数据</Text>
      </View>
    );
  }

  const { babyPoints, dataset, filteredStandardPoints, displayMaxAge } = chartData;
  const latestPoint = babyPoints.length > 0 ? babyPoints[babyPoints.length - 1] : null;

  // 获取指标标题
  const getMetricTitle = () => {
    if (metric === 'weight_for_age') return '体重';
    if (metric === 'height_for_age') return '身高';
    if (metric === 'head_for_age') return '头围';
    return '';
  };

  const handleInfoPress = () => {
    Alert.alert(
      '生长曲线与百分位说明',
      '百分位是评估儿童生长发育的重要指标：\n\n' +
      '• P3：表示只有3%的同龄儿童低于此值\n' +
      '• P50：中位数，50%的儿童在此值以下\n' +
      '• P97：表示只有3%的同龄儿童高于此值\n\n' +
      '正常范围：P3-P97 之间为正常范围\n' +
      '需关注：低于P3或高于P97建议咨询医生\n\n' +
      '本功能基于国家卫健委 WS/T 423-2022《7岁以下儿童生长标准》',
      [{ text: '知道了', style: 'default' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* 标准选择器 */}
      <View style={styles.standardSelector}>
        <Ionicons name="shield-checkmark" size={18} color="#007AFF" />
        <Text style={styles.standardText}>WS/T 423-2022 儿童生长标准（0-7岁）</Text>
        <Ionicons name="chevron-down" size={16} color="#8E8E93" />
      </View>

      {/* 时间范围选择 */}
      <View style={styles.timeRangeSelector}>
        <Text style={styles.metricLabel}>{getMetricTitle()} ({dataset.yLabel.includes('kg') ? 'kg' : 'cm'})</Text>
        <View style={styles.timeButtons}>
          {[
            { key: '6months' as TimeRange, label: '半年' },
            { key: '1year' as TimeRange, label: '1年' },
            { key: '3years' as TimeRange, label: '3年' },
          ].map(item => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.timeButton,
                timeRange === item.key && styles.timeButtonActive,
              ]}
              onPress={() => setTimeRange(item.key)}
            >
              <Text
                style={[
                  styles.timeButtonText,
                  timeRange === item.key && styles.timeButtonTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 图表区域 */}
      <View style={styles.chartContainer}>
        {babyPoints.length > 0 ? (
          <PercentileChart
            standardPoints={filteredStandardPoints}
            babyPoints={babyPoints.filter(p => p.x <= displayMaxAge)}
            maxAge={displayMaxAge}
            yLabel={dataset.yLabel}
            latestPoint={latestPoint}
          />
        ) : (
          <View style={styles.emptyChart}>
            <Ionicons name="analytics-outline" size={48} color="#C7C7CC" />
            <Text style={styles.emptyChartText}>暂无记录数据</Text>
            <Text style={styles.emptyChartHint}>添加{getMetricTitle()}记录后即可查看曲线</Text>
          </View>
        )}
      </View>

      {/* 图例说明 */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: 'rgba(52, 199, 89, 0.3)' }]} />
          <Text style={styles.legendText}>P3-P97 正常范围</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#007AFF' }]} />
          <Text style={styles.legendText}>P50 中位数</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF3B30' }]} />
          <Text style={styles.legendText}>宝宝数据</Text>
        </View>
      </View>

      {/* 参考来源说明 */}
      <View style={styles.referenceContainer}>
        <Text style={styles.referenceTitle}>参考来源：</Text>
        <Text style={styles.referenceText}>
          依据国家卫健委 WS/T 423-2022《7岁以下儿童生长标准》的婴幼儿营养状况评价指标
        </Text>
      </View>

      {/* 了解更多按钮 */}
      <TouchableOpacity style={styles.infoButton} onPress={handleInfoPress}>
        <Ionicons name="information-circle-outline" size={20} color="#007AFF" />
        <Text style={styles.infoButtonText}>了解生长曲线与百分位</Text>
      </TouchableOpacity>
    </View>
  );
};

// 百分位曲线图组件
interface PercentileChartProps {
  standardPoints: any[];
  babyPoints: any[];
  maxAge: number;
  yLabel: string;
  latestPoint: any;
}

const PercentileChart: React.FC<PercentileChartProps> = ({
  standardPoints,
  babyPoints,
  maxAge,
  yLabel,
  latestPoint,
}) => {
  // 计算 Y 轴范围
  const allYValues = [
    ...standardPoints.map(p => p.P3),
    ...standardPoints.map(p => p.P97),
    ...babyPoints.map(p => p.y),
  ];
  const minY = Math.min(...allYValues) * 0.9;
  const maxY = Math.max(...allYValues) * 1.1;

  const chartWidth = screenWidth - 32;
  const chartHeight = 320;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 50;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  // 坐标转换函数
  const xToScreen = (x: number) => {
    return paddingLeft + (x / maxAge) * plotWidth;
  };

  const yToScreen = (y: number) => {
    return paddingTop + plotHeight - ((y - minY) / (maxY - minY)) * plotHeight;
  };

  // 生成百分位区域路径（P3-P97）
  const generateAreaPoints = () => {
    const topPoints = standardPoints.map(p => `${xToScreen(p.x)},${yToScreen(p.P97)}`);
    const bottomPoints = standardPoints
      .slice()
      .reverse()
      .map(p => `${xToScreen(p.x)},${yToScreen(p.P3)}`);
    return [...topPoints, ...bottomPoints].join(' ');
  };

  return (
    <View style={styles.svgContainer}>
      <Svg width={chartWidth} height={chartHeight}>
        {/* Y 轴标签 */}
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
          const y = paddingTop + plotHeight * ratio;
          const value = maxY - (maxY - minY) * ratio;
          return (
            <SvgText
              key={`y-label-${ratio}`}
              x={paddingLeft - 10}
              y={y + 4}
              fontSize="11"
              fill="#8E8E93"
              textAnchor="end"
            >
              {value.toFixed(0)}
            </SvgText>
          );
        })}

        {/* 背景网格线 */}
        {[0.25, 0.5, 0.75].map(ratio => {
          const y = paddingTop + plotHeight * ratio;
          return (
            <Line
              key={`grid-${ratio}`}
              x1={paddingLeft}
              y1={y}
              x2={chartWidth - paddingRight}
              y2={y}
              stroke="#F5F5F7"
              strokeWidth="1"
            />
          );
        })}

        {/* P3-P97 正常范围区域（绿色半透明填充） */}
        <Polygon
          points={generateAreaPoints()}
          fill="rgba(52, 199, 89, 0.15)"
          stroke="none"
        />

        {/* P97 边界线 */}
        {standardPoints.map((p, i) => {
          if (i === 0) return null;
          const prev = standardPoints[i - 1];
          return (
            <Line
              key={`p97-line-${i}`}
              x1={xToScreen(prev.x)}
              y1={yToScreen(prev.P97)}
              x2={xToScreen(p.x)}
              y2={yToScreen(p.P97)}
              stroke="rgba(52, 199, 89, 0.5)"
              strokeWidth="1.5"
              strokeDasharray="4,3"
            />
          );
        })}

        {/* P3 边界线 */}
        {standardPoints.map((p, i) => {
          if (i === 0) return null;
          const prev = standardPoints[i - 1];
          return (
            <Line
              key={`p3-line-${i}`}
              x1={xToScreen(prev.x)}
              y1={yToScreen(prev.P3)}
              x2={xToScreen(p.x)}
              y2={yToScreen(p.P3)}
              stroke="rgba(52, 199, 89, 0.5)"
              strokeWidth="1.5"
              strokeDasharray="4,3"
            />
          );
        })}

        {/* P50 中位数曲线 */}
        {standardPoints.map((p, i) => {
          if (i === 0) return null;
          const prev = standardPoints[i - 1];
          return (
            <Line
              key={`p50-line-${i}`}
              x1={xToScreen(prev.x)}
              y1={yToScreen(prev.P50)}
              x2={xToScreen(p.x)}
              y2={yToScreen(p.P50)}
              stroke="#007AFF"
              strokeWidth="2"
            />
          );
        })}

        {/* 宝宝数据连线 */}
        {babyPoints.map((p, i) => {
          if (i === 0) return null;
          const prev = babyPoints[i - 1];
          return (
            <Line
              key={`baby-line-${i}`}
              x1={xToScreen(prev.x)}
              y1={yToScreen(prev.y)}
              x2={xToScreen(p.x)}
              y2={yToScreen(p.y)}
              stroke="#FF3B30"
              strokeWidth="2.5"
            />
          );
        })}

        {/* 宝宝数据点 */}
        {babyPoints.map((p, i) => (
          <Circle
            key={`baby-point-${i}`}
            cx={xToScreen(p.x)}
            cy={yToScreen(p.y)}
            r="5"
            fill={p.status === 'normal' ? '#FF3B30' : '#FF9500'}
            stroke="#FFFFFF"
            strokeWidth="2"
          />
        ))}

        {/* 最新点特殊标注 */}
        {latestPoint && (
          <>
            <Circle
              cx={xToScreen(latestPoint.x)}
              cy={yToScreen(latestPoint.y)}
              r="9"
              fill="none"
              stroke="#FF3B30"
              strokeWidth="2"
            />
            <SvgText
              x={xToScreen(latestPoint.x)}
              y={yToScreen(latestPoint.y) - 20}
              fontSize="12"
              fill="#FF3B30"
              fontWeight="600"
              textAnchor="middle"
            >
              今天
            </SvgText>
          </>
        )}

        {/* X 轴标签（月龄） */}
        {[0, maxAge / 4, maxAge / 2, (maxAge * 3) / 4, maxAge].map(month => (
          <SvgText
            key={`x-label-${month}`}
            x={xToScreen(month)}
            y={chartHeight - paddingBottom + 20}
            fontSize="11"
            fill="#8E8E93"
            textAnchor="middle"
          >
            {Math.round(month)}月
          </SvgText>
        ))}

        {/* 百分位标注（右侧） */}
        {standardPoints.length > 0 && (
          <>
            <SvgText
              x={chartWidth - paddingRight + 5}
              y={yToScreen(standardPoints[standardPoints.length - 1].P97)}
              fontSize="11"
              fill="#34C759"
              textAnchor="start"
              fontWeight="600"
            >
              97%
            </SvgText>
            <SvgText
              x={chartWidth - paddingRight + 5}
              y={yToScreen(standardPoints[standardPoints.length - 1].P50)}
              fontSize="11"
              fill="#007AFF"
              textAnchor="start"
              fontWeight="600"
            >
              50%
            </SvgText>
            <SvgText
              x={chartWidth - paddingRight + 5}
              y={yToScreen(standardPoints[standardPoints.length - 1].P3)}
              fontSize="11"
              fill="#34C759"
              textAnchor="start"
              fontWeight="600"
            >
              3%
            </SvgText>
          </>
        )}
      </Svg>

      {/* 当前值显示卡片 */}
      {latestPoint && (
        <View style={styles.currentValueCard}>
          <Text style={styles.currentValueLabel}>当前值</Text>
          <Text style={styles.currentValue}>
            {latestPoint.y.toFixed(1)}
          </Text>
          <Text style={[styles.currentPercentile, getStatusColor(latestPoint.status)]}>
            P{Math.round(latestPoint.percentile)}
          </Text>
          <Text style={styles.currentDate}>
            {format(new Date(latestPoint.date), 'MM/dd')}
          </Text>
        </View>
      )}
    </View>
  );
};

function getStatusColor(status: string) {
  if (status === 'low' || status === 'high') {
    return { color: '#FF9500' };
  }
  return { color: '#34C759' };
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  standardSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  standardText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
    marginLeft: 8,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  timeButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  timeButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F5F5F7',
  },
  timeButtonActive: {
    backgroundColor: '#007AFF',
  },
  timeButtonText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  timeButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  chartContainer: {
    marginBottom: 16,
  },
  svgContainer: {
    position: 'relative',
  },
  currentValueCard: {
    position: 'absolute',
    top: 30,
    left: 65,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
  },
  currentValueLabel: {
    fontSize: 10,
    color: '#8E8E93',
    marginBottom: 3,
  },
  currentValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  currentPercentile: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 3,
  },
  currentDate: {
    fontSize: 10,
    color: '#8E8E93',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F5F5F7',
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendBox: {
    width: 14,
    height: 10,
    borderRadius: 2,
    marginRight: 5,
  },
  legendText: {
    fontSize: 11,
    color: '#8E8E93',
  },
  referenceContainer: {
    backgroundColor: '#F5F5F7',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  referenceTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  referenceText: {
    fontSize: 10,
    color: '#8E8E93',
    lineHeight: 14,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 5,
  },
  infoButtonText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 12,
  },
  emptyChart: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
  },
  emptyChartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 12,
  },
  emptyChartHint: {
    fontSize: 14,
    color: '#C7C7CC',
    marginTop: 8,
  },
});
