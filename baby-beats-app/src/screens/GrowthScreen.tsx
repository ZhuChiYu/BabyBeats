import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useBabyStore } from '../store/babyStore';
import { GrowthService } from '../services/growthService';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Colors } from '../constants';
import { calculateAge, formatAge } from '../utils/dateUtils';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

type GrowthType = 'weight' | 'height' | 'head';

interface GrowthScreenProps {
  navigation: any;
}

export const GrowthScreen: React.FC<GrowthScreenProps> = ({ navigation }) => {
  const { getCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();
  const insets = useSafeAreaInsets();
  
  const [growthType, setGrowthType] = useState<GrowthType>('weight');
  const [records, setRecords] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (currentBaby) {
      loadGrowthData();
    }
  }, [currentBaby?.id, growthType]);

  // 监听页面聚焦，自动刷新数据
  useFocusEffect(
    React.useCallback(() => {
      if (currentBaby) {
        loadGrowthData();
      }
    }, [currentBaby?.id, growthType])
  );
  
  const loadGrowthData = async () => {
    if (!currentBaby) return;
    
    setLoading(true);
    try {
      const data = await GrowthService.getByBabyId(currentBaby.id);
      setRecords(data);
      
      // 生成图表数据
      if (data.length > 0) {
        const labels: string[] = [];
        const values: number[] = [];
        
        data.slice(0, 12).reverse().forEach(record => {
          // 使用 date 字段而不是 measurementDate
          if (record.date) {
            labels.push(format(new Date(record.date), 'MM/dd'));
            
            switch (growthType) {
              case 'weight':
                values.push(record.weight || 0);
                break;
              case 'height':
                values.push(record.height || 0);
                break;
              case 'head':
                values.push(record.headCirc || 0);
                break;
            }
          }
        });
        
        setChartData({
          labels,
          datasets: [{ data: values.length > 0 ? values : [0] }],
        });
      } else {
        setChartData({
          labels: ['暂无数据'],
          datasets: [{ data: [0] }],
        });
      }
    } catch (error) {
      console.error('Failed to load growth data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getGrowthTypeInfo = () => {
    switch (growthType) {
      case 'weight':
        return { title: '体重曲线', unit: 'kg', icon: 'scale', color: Colors.primary };
      case 'height':
        return { title: '身高曲线', unit: 'cm', icon: 'resize', color: Colors.success };
      case 'head':
        return { title: '头围曲线', unit: 'cm', icon: 'ellipse', color: Colors.warning };
    }
  };
  
  const getCurrentValue = () => {
    if (records.length === 0) return null;
    const latest = records[0];
    
    switch (growthType) {
      case 'weight':
        return latest.weight;
      case 'height':
        return latest.height;
      case 'head':
        return latest.headCircumference;
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
      r: '5',
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
  
  const typeInfo = getGrowthTypeInfo();
  const currentValue = getCurrentValue();
  const babyAge = formatAge(currentBaby.birthday);
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 宝宝信息卡片 */}
        <View style={styles.babyInfoCard}>
          <View style={styles.babyInfoRow}>
            <View>
              <Text style={styles.babyName}>{currentBaby.name}</Text>
              <Text style={styles.babyAge}>{babyAge}</Text>
            </View>
            {currentValue && (
              <View style={styles.currentValueContainer}>
                <Text style={styles.currentValueLabel}>当前{typeInfo.title.replace('曲线', '')}</Text>
                <Text style={styles.currentValue}>
                  {currentValue} {typeInfo.unit}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* 类型选择器 */}
        <View style={styles.typeSelector}>
          {[
            { value: 'weight', label: '体重', icon: 'scale' },
            { value: 'height', label: '身高', icon: 'resize' },
            { value: 'head', label: '头围', icon: 'ellipse' },
          ].map(type => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeButton,
                growthType === type.value && styles.typeButtonActive,
              ]}
              onPress={() => setGrowthType(type.value as GrowthType)}
            >
              <Ionicons
                name={type.icon as any}
                size={20}
                color={growthType === type.value ? '#FFFFFF' : '#8E8E93'}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  growthType === type.value && styles.typeButtonTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* 成长曲线图 */}
        {chartData && (
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View style={styles.chartTitleRow}>
                <Ionicons name={typeInfo.icon as any} size={24} color={typeInfo.color} />
                <Text style={styles.chartTitle}>{typeInfo.title}</Text>
              </View>
              <Text style={styles.chartUnit}>{typeInfo.unit}</Text>
            </View>
            
            {records.length > 0 ? (
              <LineChart
                data={chartData}
                width={screenWidth - 64}
                height={260}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `${typeInfo.color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
                  propsForDots: {
                    r: '5',
                    strokeWidth: '2',
                    stroke: typeInfo.color,
                  },
                }}
                bezier
                style={styles.chart}
              />
            ) : (
              <View style={styles.emptyChartContainer}>
                <Ionicons name="analytics-outline" size={48} color="#C7C7CC" />
                <Text style={styles.emptyChartText}>暂无记录</Text>
                <Text style={styles.emptyChartHint}>添加成长记录后即可查看曲线</Text>
              </View>
            )}
          </View>
        )}
        
        {/* 记录列表 */}
        <View style={styles.recordsCard}>
          <View style={styles.recordsHeader}>
            <Text style={styles.recordsTitle}>历史记录</Text>
            {records.length > 0 && (
              <Text style={styles.recordsCount}>{records.length}条</Text>
            )}
          </View>
          
          {records.length > 0 ? (
            records.slice(0, 10).map((record, index) => (
              <View key={record.id} style={styles.recordItem}>
                <View style={styles.recordLeft}>
                  <View style={[styles.recordIndicator, { backgroundColor: typeInfo.color }]} />
                  <View>
                    <Text style={styles.recordDate}>
                      {format(new Date(record.date), 'yyyy年MM月dd日', { locale: zhCN })}
                    </Text>
                    <View style={styles.recordValues}>
                      <Text style={styles.recordValue}>体重 {record.weight}kg</Text>
                      <Text style={styles.recordValue}>身高 {record.height}cm</Text>
                      {record.headCircumference && (
                        <Text style={styles.recordValue}>头围 {record.headCircumference}cm</Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyRecordsContainer}>
              <Ionicons name="document-text-outline" size={48} color="#C7C7CC" />
              <Text style={styles.emptyRecordsText}>暂无记录</Text>
            </View>
          )}
        </View>
        
        <View style={styles.footer} />
      </ScrollView>
      
      {/* 添加按钮 */}
      <TouchableOpacity
        style={[styles.addButton, { bottom: 24 + insets.bottom }]}
        onPress={() => navigation.navigate('AddGrowth', { type: growthType })}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
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
  babyInfoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  babyInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  babyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  babyAge: {
    fontSize: 16,
    color: '#8E8E93',
  },
  currentValueContainer: {
    alignItems: 'flex-end',
  },
  currentValueLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  currentValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  typeSelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
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
  emptyChartContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyChartText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
  },
  emptyChartHint: {
    fontSize: 14,
    color: '#C7C7CC',
    marginTop: 8,
  },
  recordsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  recordsCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  recordItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F7',
  },
  recordLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  recordDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  recordValues: {
    flexDirection: 'row',
    gap: 12,
  },
  recordValue: {
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyRecordsContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyRecordsText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
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
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  footer: {
    height: 100,
  },
});
