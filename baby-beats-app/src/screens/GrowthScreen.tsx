import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBabyStore } from '../store/babyStore';
import { GrowthService } from '../services/growthService';
import { assessGrowthRecord } from '../services/growthAssessment';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Colors } from '../constants';
import { formatAge } from '../utils/dateUtils';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GrowthChart } from '../components/GrowthChart';
import { AssessmentCard } from '../components/AssessmentCard';
import { GrowthMetric } from '../constants/growthStandards';

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
  const [loading, setLoading] = useState(true);
  const [showAssessment, setShowAssessment] = useState(true);
  
  useEffect(() => {
    if (currentBaby) {
      loadGrowthData();
    }
  }, [currentBaby?.id]);

  // 监听页面聚焦，自动刷新数据
  useFocusEffect(
    React.useCallback(() => {
      if (currentBaby) {
        loadGrowthData();
      }
    }, [currentBaby?.id])
  );
  
  const loadGrowthData = async () => {
    if (!currentBaby) return;
    
    setLoading(true);
    try {
      const data = await GrowthService.getByBabyId(currentBaby.id);
      setRecords(data);
    } catch (error) {
      console.error('Failed to load growth data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getGrowthTypeInfo = () => {
    switch (growthType) {
      case 'weight':
        return { 
          title: '体重评估', 
          unit: 'kg', 
          icon: 'scale', 
          color: Colors.primary,
          metric: 'weight_for_age' as GrowthMetric,
        };
      case 'height':
        return { 
          title: '身高评估', 
          unit: 'cm', 
          icon: 'resize', 
          color: Colors.success,
          metric: 'height_for_age' as GrowthMetric,
        };
      case 'head':
        return { 
          title: '头围评估', 
          unit: 'cm', 
          icon: 'ellipse', 
          color: Colors.warning,
          metric: 'head_for_age' as GrowthMetric,
        };
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
        return latest.headCirc;
    }
  };
  
  // 获取最新记录的评估结果
  const getLatestAssessment = () => {
    if (!currentBaby || records.length === 0) return null;

    const latestRecord = records[0];
    const previousRecords = records.slice(1);
    const assessment = assessGrowthRecord(currentBaby, latestRecord, previousRecords);

    switch (growthType) {
      case 'weight':
        return assessment.weight;
      case 'height':
        return assessment.height;
      case 'head':
        return assessment.head;
    }
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
  const latestAssessment = getLatestAssessment();
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 里程碑入口 */}
        <TouchableOpacity
          style={styles.milestoneButton}
          onPress={() => navigation.navigate('MilestoneTimeline')}
        >
          <View style={styles.milestoneButtonLeft}>
            <View style={styles.milestoneIcon}>
              <Ionicons name="star" size={24} color="#FFD60A" />
            </View>
            <View>
              <Text style={styles.milestoneButtonTitle}>成长里程碑</Text>
              <Text style={styles.milestoneButtonSubtitle}>记录宝宝的珍贵瞬间</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#C7C7CC" />
        </TouchableOpacity>

        {/* 宝宝信息卡片 */}
        <View style={styles.babyInfoCard}>
          <View style={styles.babyInfoRow}>
            <View>
              <Text style={styles.babyName}>{currentBaby.name}</Text>
              <Text style={styles.babyAge}>{babyAge}</Text>
            </View>
            {currentValue && (
              <View style={styles.currentValueContainer}>
                <Text style={styles.currentValueLabel}>当前{typeInfo.title.replace('评估', '')}</Text>
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
        
        {/* 生长曲线图表 */}
        {records.length > 0 && (
          <View style={styles.chartCard}>
            <GrowthChart
              baby={currentBaby}
              records={records}
              metric={typeInfo.metric}
            />
              </View>
        )}

        {/* 最新评估结果 */}
        {latestAssessment && showAssessment && (
          <View style={styles.assessmentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📊 最新评估</Text>
              <TouchableOpacity onPress={() => setShowAssessment(false)}>
                <Ionicons name="close-circle" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            <AssessmentCard
              assessment={latestAssessment}
              title={typeInfo.title}
              icon={typeInfo.icon as any}
            />
          </View>
        )}

        {!showAssessment && records.length > 0 && (
          <TouchableOpacity
            style={styles.showAssessmentButton}
            onPress={() => setShowAssessment(true)}
          >
            <Ionicons name="analytics" size={20} color="#007AFF" />
            <Text style={styles.showAssessmentText}>显示评估结果</Text>
          </TouchableOpacity>
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
              <TouchableOpacity 
                key={record.id} 
                style={styles.recordItem}
                onPress={() => navigation.navigate('AddGrowth', { editingRecord: record })}
              >
                <View style={styles.recordLeft}>
                  <View style={[styles.recordIndicator, { backgroundColor: typeInfo.color }]} />
                  <View style={styles.recordInfo}>
                    <Text style={styles.recordDate}>
                      {format(new Date(record.date), 'yyyy年MM月dd日', { locale: zhCN })}
                    </Text>
                    <View style={styles.recordValues}>
                      {record.weight && <Text style={styles.recordValue}>体重 {record.weight}kg</Text>}
                      {record.height && <Text style={styles.recordValue}>身高 {record.height}cm</Text>}
                      {record.headCirc && (
                        <Text style={styles.recordValue}>头围 {record.headCirc}cm</Text>
                      )}
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyRecordsContainer}>
              <Ionicons name="document-text-outline" size={48} color="#C7C7CC" />
              <Text style={styles.emptyRecordsText}>暂无记录</Text>
              <Text style={styles.emptyRecordsHint}>添加成长记录后即可查看生长曲线和评估</Text>
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
    marginHorizontal: 16,
    marginBottom: 16,
  },
  assessmentSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  showAssessmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  showAssessmentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F7',
  },
  recordLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recordInfo: {
    flex: 1,
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
  emptyRecordsHint: {
    fontSize: 14,
    color: '#C7C7CC',
    marginTop: 8,
    textAlign: 'center',
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
  milestoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  milestoneButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  milestoneIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFD60A15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  milestoneButtonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  milestoneButtonSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
});
