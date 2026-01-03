import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, RefreshControl, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBabyStore } from '../store/babyStore';
import { FeedingService } from '../services/feedingService';
import { SleepService } from '../services/sleepService';
import { DiaperService } from '../services/diaperService';
import { PumpingService } from '../services/pumpingService';
import { TemperatureService } from '../services/temperatureService';
import { VaccineService } from '../services/vaccineService';
import { MedicationService } from '../services/medicationService';
import { MedicalVisitService } from '../services/medicalVisitService';
import { GrowthService } from '../services/growthService';
import { Card } from '../components/Card';
import { QuickActionMenu } from '../components/QuickActionMenu';
import { LiveTimerCard } from '../components/LiveTimerCard';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useFocusEffect } from '@react-navigation/native';
import { syncManager } from '../services/syncManager';
import { UrineStandardService } from '../utils/urineStandard';
import { Colors } from '../constants';

interface TodayScreenProps {
  navigation: any;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({ navigation }) => {
  const { getCurrentBaby, babies, setCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();
  
  const [showBabySelector, setShowBabySelector] = useState(false);
  
  // 今日统计数据（使用新的UI）
  const [todayStats, setTodayStats] = useState<any>(null);
  const [latestWeight, setLatestWeight] = useState<number>(10);
  
  const [pumpingStats, setPumpingStats] = useState({
    totalCount: 0,
    totalAmount: 0,
  });

  const [latestTemp, setLatestTemp] = useState<any>(null);
  const [recentVaccines, setRecentVaccines] = useState<any[]>([]);
  const [todayMedications, setTodayMedications] = useState<any[]>([]);
  const [todayVisits, setTodayVisits] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    if (currentBaby) {
      loadTodayData();
    }
  }, [currentBaby?.id]);

  // 监听页面聚焦，自动刷新数据
  useFocusEffect(
    React.useCallback(() => {
      if (currentBaby) {
        loadTodayData();
      }
    }, [currentBaby?.id])
  );
  
  const loadTodayData = async (isRefreshing = false) => {
    if (!currentBaby) return;
    
    if (!isRefreshing) {
      setLoading(true);
    }
    
    try {
      const [
        feedings,
        sleeps,
        diapers,
        pumpingData,
        tempData,
        vaccineData,
        medicationData,
        visitData,
        growthRecords,
      ] = await Promise.all([
        FeedingService.getByBabyId(currentBaby.id),
        SleepService.getByBabyId(currentBaby.id),
        DiaperService.getByBabyId(currentBaby.id),
        PumpingService.getTodayStats(currentBaby.id),
        TemperatureService.getLatest(currentBaby.id),
        VaccineService.getByBabyId(currentBaby.id),
        MedicationService.getByBabyId(currentBaby.id),
        MedicalVisitService.getByBabyId(currentBaby.id),
        GrowthService.getByBabyId(currentBaby.id),
      ]);
      
      // 获取最新体重
      if (growthRecords.length > 0 && growthRecords[0].weight) {
        setLatestWeight(growthRecords[0].weight);
      }
      
      // 筛选今日数据
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = today.getTime();
      
      const todayFeedings = feedings.filter((f: any) => f.time >= todayTimestamp);
      const todaySleeps = sleeps.filter((s: any) => s.startTime >= todayTimestamp);
      const todayDiapers = diapers.filter((d: any) => d.time >= todayTimestamp);
      
      // 计算今日统计
      calculateTodayStats(todayFeedings, todaySleeps, todayDiapers);
      
      setPumpingStats(pumpingData);
      setLatestTemp(tempData);
      setRecentVaccines(vaccineData.slice(0, 3)); // 最近3条疫苗记录
      
      setTodayMedications(
        medicationData.filter((m: any) => new Date(m.medicationTime).getTime() >= todayTimestamp)
      );
      setTodayVisits(
        visitData.filter((v: any) => new Date(v.visitTime).getTime() >= todayTimestamp)
      );
    } catch (error) {
      console.error('Failed to load today data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
    
    // 尿量评估
    let urineAssessment = null;
    let urinePercentage = 0;
    let urineStandardRange = null;
    
    if (currentBaby && latestWeight > 0 && totalUrineAmount > 0) {
      const babyAgeInMonths = Math.floor((Date.now() - currentBaby.birthDate) / (30 * 24 * 60 * 60 * 1000));
      urineStandardRange = UrineStandardService.getRecommendedRange(latestWeight, babyAgeInMonths);
      urineAssessment = UrineStandardService.assessUrineAmount(totalUrineAmount, latestWeight, babyAgeInMonths);
      
      if (urineStandardRange) {
        // 计算百分比：实际值相对于最小值的百分比
        urinePercentage = Math.min((totalUrineAmount / urineStandardRange.min) * 100, 100);
      }
    }
    
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
      urineAssessment,
      urinePercentage: urinePercentage.toFixed(0),
      urineStandardRange,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // 如果已登录，先同步数据（先推送后拉取）
      if (syncManager.isLoggedIn()) {
        console.log('下拉刷新：开始同步数据...');
        // 先推送本地数据到服务器
        await syncManager.pushToServer(currentBaby?.id);
        // 再从服务器拉取最新数据
        await syncManager.pullFromServer(currentBaby?.id);
        console.log('下拉刷新：同步完成');
      }
      // 然后加载本地数据
      await loadTodayData(true);
    } catch (error) {
      console.error('Refresh failed:', error);
      // 即使同步失败，也尝试加载本地数据
      await loadTodayData(true);
    }
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

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}小时${mins}分钟`;
    }
    return `${mins}分钟`;
  };

  // 计算并格式化宝宝年龄
  const formatBabyAge = (birthday: number): string => {
    const now = new Date();
    const birthDate = new Date(birthday);
    
    // 计算总天数
    const diffTime = now.getTime() - birthDate.getTime();
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (totalDays < 0) return '未出生';
    if (totalDays === 0) return '今天出生';
    
    // 计算年、月、天
    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();
    let days = now.getDate() - birthDate.getDate();
    
    // 调整月份和年份
    if (days < 0) {
      months--;
      const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += lastMonth.getDate();
    }
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    // 超过1年：显示年月天
    if (years >= 1) {
      if (months === 0 && days === 0) {
        return `${years}岁`;
      } else if (days === 0) {
        return `${years}岁${months}个月`;
      } else if (months === 0) {
        return `${years}岁${days}天`;
      } else {
        return `${years}岁${months}个月${days}天`;
      }
    }
    
    // 超过1个月但不到1年：显示月天
    if (months >= 1) {
      if (days === 0) {
        return `${months}个月`;
      } else {
        return `${months}个月${days}天`;
      }
    }
    
    // 不到1个月：只显示天数
    return `${totalDays}天`;
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
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.babyInfo}
            onPress={() => {
              const activeBabies = babies.filter(b => !b.isArchived);
              if (activeBabies.length > 1) {
                setShowBabySelector(true);
              } else {
                navigation.navigate('BabyManagement');
              }
            }}
          >
            <View style={styles.babyNameRow}>
              <Text style={styles.babyName}>{currentBaby.name}</Text>
              <Text style={styles.babyAge}>{formatBabyAge(currentBaby.birthday)}</Text>
              {babies.filter(b => !b.isArchived).length > 1 && (
                <Ionicons name="chevron-down" size={20} color="#000" />
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.date}>
            {format(new Date(), 'MM月dd日 EEEE', { locale: zhCN })}
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.sleepSoundButton}
            onPress={() => navigation.navigate('SleepSound')}
          >
            <Ionicons name="musical-notes" size={24} color="#5856D6" />
          </TouchableOpacity>
          <QuickActionMenu />
        </View>
      </View>
      
      {/* 宝宝选择器模态框 */}
      <Modal
        visible={showBabySelector}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBabySelector(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowBabySelector(false)}
        >
          <View style={styles.babySelectorContainer}>
            <View style={styles.babySelectorHeader}>
              <Text style={styles.babySelectorTitle}>切换宝宝</Text>
              <TouchableOpacity onPress={() => setShowBabySelector(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            {babies.filter(b => !b.isArchived).map((baby) => (
              <TouchableOpacity
                key={baby.id}
                style={[
                  styles.babyOption,
                  currentBaby?.id === baby.id && styles.babyOptionActive
                ]}
                onPress={() => {
                  setCurrentBaby(baby.id);
                  setShowBabySelector(false);
                }}
              >
                <View>
                  <Text style={styles.babyOptionName}>{baby.name}</Text>
                  <Text style={styles.babyOptionAge}>
                    {formatBabyAge(baby.birthday)}
                  </Text>
                </View>
                {currentBaby?.id === baby.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.manageBabiesButton}
              onPress={() => {
                setShowBabySelector(false);
                navigation.navigate('BabyManagement');
              }}
            >
              <Ionicons name="settings-outline" size={20} color="#007AFF" />
              <Text style={styles.manageBabiesText}>管理宝宝</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      >
        {/* 实时计时卡片 */}
        <LiveTimerCard />
        
        {/* 今日统计卡片 */}
        {todayStats ? (
          <View>
            {/* 今日喂养 */}
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

            {/* 今日睡眠 */}
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

            {/* 今日尿布 */}
            <View style={styles.todayCard}>
              <View style={styles.todayCardHeader}>
                <Ionicons name="water" size={24} color={Colors.diaper} />
                <Text style={styles.todayCardTitle}>今日尿布</Text>
              </View>

              {/* 基础统计 */}
              <View style={styles.diaperBasicStats}>
                <View style={styles.diaperStatItem}>
                  <View style={[styles.diaperStatIcon, { backgroundColor: '#E3F2FD' }]}>
                    <Ionicons name="water-outline" size={20} color="#2196F3" />
                  </View>
                  <Text style={styles.diaperStatValue}>{todayStats.peeCount}</Text>
                  <Text style={styles.diaperStatLabel}>小便次数</Text>
                </View>
                <View style={styles.diaperStatDivider} />
                <View style={styles.diaperStatItem}>
                  <View style={[styles.diaperStatIcon, { backgroundColor: '#FFF3E0' }]}>
                    <Ionicons name="alert-circle-outline" size={20} color="#FF9800" />
                  </View>
                  <Text style={styles.diaperStatValue}>{todayStats.poopCount}</Text>
                  <Text style={styles.diaperStatLabel}>大便次数</Text>
                </View>
                <View style={styles.diaperStatDivider} />
                <View style={styles.diaperStatItem}>
                  <View style={[styles.diaperStatIcon, { backgroundColor: '#E8F5E9' }]}>
                    <Ionicons name="analytics-outline" size={20} color="#4CAF50" />
                  </View>
                  <Text style={styles.diaperStatValue}>{todayStats.totalUrineAmount}</Text>
                  <Text style={styles.diaperStatLabel}>湿尿量(g)</Text>
                </View>
              </View>

              {/* 尿量评估 */}
              {todayStats.urineAssessment && todayStats.urineStandardRange ? (
                <View style={styles.urineAssessmentSection}>
                  <View style={styles.assessmentDivider} />
                  
                  <View style={styles.assessmentHeader}>
                    <Ionicons name="pulse" size={18} color="#007AFF" />
                    <Text style={styles.assessmentTitle}>尿量健康评估</Text>
                  </View>

                  <View style={styles.urineProgressContainer}>
                    <View style={styles.urineProgressBar}>
                      <View 
                        style={[
                          styles.urineProgressFill, 
                          { 
                            width: `${Math.min(parseFloat(todayStats.urinePercentage), 100)}%`,
                            backgroundColor: getUrineStatusColor(todayStats.urineAssessment.status),
                          }
                        ]} 
                      >
                        {parseFloat(todayStats.urinePercentage) >= 10 && (
                          <View style={styles.progressInnerCircle} />
                        )}
                      </View>
                    </View>
                    <Text style={[
                      styles.urineProgressPercent,
                      { color: getUrineStatusColor(todayStats.urineAssessment.status) }
                    ]}>
                      {todayStats.urinePercentage}%
                    </Text>
                  </View>

                  <View style={styles.statusRangeContainer}>
                    <View style={[
                      styles.statusBadgeLarge, 
                      { backgroundColor: getUrineStatusBgColor(todayStats.urineAssessment.status) }
                    ]}>
                      <Ionicons 
                        name={getUrineStatusIcon(todayStats.urineAssessment.status)} 
                        size={16} 
                        color={getUrineStatusColor(todayStats.urineAssessment.status)} 
                      />
                      <Text style={[
                        styles.statusTextLarge, 
                        { color: getUrineStatusColor(todayStats.urineAssessment.status) }
                      ]}>
                        {todayStats.urineAssessment.statusText}
                      </Text>
                    </View>
                    <View style={styles.rangeInfo}>
                      <Text style={styles.rangeLabel}>建议湿尿量范围</Text>
                      <Text style={styles.rangeValue}>
                        {todayStats.urineStandardRange.min}-{todayStats.urineStandardRange.max}g/天
                      </Text>
                    </View>
                  </View>

                  {todayStats.urineAssessment.suggestion && (
                    <View style={[
                      styles.suggestionCard,
                      { backgroundColor: getUrineStatusBgColor(todayStats.urineAssessment.status) }
                    ]}>
                      <View style={styles.suggestionHeader}>
                        <Ionicons 
                          name="bulb" 
                          size={16} 
                          color={getUrineStatusColor(todayStats.urineAssessment.status)} 
                        />
                        <Text style={[
                          styles.suggestionHeaderText,
                          { color: getUrineStatusColor(todayStats.urineAssessment.status) }
                        ]}>
                          健康建议
                        </Text>
                      </View>
                      <Text style={styles.suggestionContent}>
                        {todayStats.urineAssessment.suggestion}
                      </Text>
                    </View>
                  )}

                  <View style={styles.dataSourceContainer}>
                    <Ionicons name="information-circle-outline" size={14} color="#8E8E93" />
                    <Text style={styles.dataSourceText}>
                      数据来源：基于宝宝体重 {latestWeight}kg 计算的标准尿量范围。参考GOSH儿童医院、WHO新生儿指南及澳洲CAHS标准
                    </Text>
                  </View>
                </View>
              ) : todayStats.totalUrineAmount === '0.0' || !latestWeight ? (
                <View style={styles.noWeightTip}>
                  <Ionicons name="information-circle-outline" size={18} color="#8E8E93" />
                  <Text style={styles.noWeightText}>
                    {!latestWeight 
                      ? '请先记录宝宝的体重，以便进行尿量评估' 
                      : '暂无尿量记录'}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}
        
        {/* 挤奶卡片 */}
        {pumpingStats.totalCount > 0 && (
          <Card>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Ionicons name="flask" size={24} color="#AF52DE" />
                <Text style={styles.cardTitle}>挤奶记录</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{pumpingStats.totalCount}</Text>
                <Text style={styles.statLabel}>次数</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{pumpingStats.totalAmount}</Text>
                <Text style={styles.statLabel}>ml</Text>
              </View>
            </View>
          </Card>
        )}

        {/* 最新体温 */}
        {latestTemp && (
          <Card>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Ionicons name="thermometer" size={24} color="#FF6B6B" />
                <Text style={styles.cardTitle}>最新体温</Text>
              </View>
            </View>
            <View style={styles.tempRow}>
              <Text style={styles.tempValue}>{latestTemp.temperature}°C</Text>
              <Text style={styles.tempStatus}>
                {latestTemp.temperature >= 38 ? '🔥 发烧' : 
                 latestTemp.temperature >= 37.3 ? '⚠️ 低烧' : 
                 '✅ 正常'}
              </Text>
            </View>
            <Text style={styles.tempDate}>
              {format(new Date(latestTemp.date), 'MM-dd HH:mm')}
            </Text>
          </Card>
        )}

        {/* 今日用药 */}
        {todayMedications.length > 0 && (
          <Card>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Ionicons name="medkit" size={24} color="#AF52DE" />
                <Text style={styles.cardTitle}>今日用药</Text>
              </View>
              <Text style={styles.cardCount}>{todayMedications.length}次</Text>
            </View>
            {todayMedications.slice(0, 3).map((med) => (
              <View key={med.id} style={styles.medicationItem}>
                <View style={styles.medicationDot} />
                <View style={styles.medicationContent}>
                  <Text style={styles.medicationName}>{med.medicationName}</Text>
                  <Text style={styles.medicationTime}>
                    {format(new Date(med.medicationTime), 'HH:mm')} · {med.dosage}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* 最近疫苗 */}
        {recentVaccines.length > 0 && (
          <Card>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Ionicons name="shield-checkmark" size={24} color="#5AC8FA" />
                <Text style={styles.cardTitle}>疫苗记录</Text>
              </View>
            </View>
            {recentVaccines.slice(0, 2).map((vaccine) => (
              <View key={vaccine.id} style={styles.vaccineItem}>
                <View style={styles.vaccineLeft}>
                  <Text style={styles.vaccineName}>{vaccine.vaccineName}</Text>
                  <Text style={styles.vaccineDate}>
                    {format(new Date(vaccine.vaccinationDate), 'yyyy-MM-dd')}
                  </Text>
                </View>
                {vaccine.nextDate && (
                  <View style={styles.vaccineNext}>
                    <Text style={styles.vaccineNextLabel}>下次</Text>
                    <Text style={styles.vaccineNextDate}>
                      {format(new Date(vaccine.nextDate), 'MM-dd')}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </Card>
        )}

        {/* 今日就诊 */}
        {todayVisits.length > 0 && (
          <Card>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Ionicons name="medical" size={24} color="#3498DB" />
                <Text style={styles.cardTitle}>今日就诊</Text>
              </View>
            </View>
            {todayVisits.map((visit) => (
              <View key={visit.id} style={styles.visitItem}>
                <Text style={styles.visitHospital}>{visit.hospital}</Text>
                <Text style={styles.visitDepartment}>
                  {visit.department} · {format(new Date(visit.visitTime), 'HH:mm')}
                </Text>
              </View>
            ))}
          </Card>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerLeft: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sleepSoundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  babyInfo: {
    marginBottom: 8,
  },
  babyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  babyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  babyAge: {
    fontSize: 13,
    fontWeight: '500',
    color: '#007AFF',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  date: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  babySelectorContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 32,
    width: '80%',
    maxWidth: 400,
    maxHeight: '70%',
  },
  babySelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F7',
  },
  babySelectorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  babyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F7',
  },
  babyOptionActive: {
    backgroundColor: '#F0F9FF',
  },
  babyOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  babyOptionAge: {
    fontSize: 14,
    color: '#8E8E93',
  },
  manageBabiesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F7',
  },
  manageBabiesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  content: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#000',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#8E8E93',
    marginTop: 16,
  },
  cardCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tempValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  tempStatus: {
    fontSize: 16,
    fontWeight: '600',
  },
  tempDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  medicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  medicationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#AF52DE',
    marginRight: 12,
  },
  medicationContent: {
    flex: 1,
  },
  medicationName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  medicationTime: {
    fontSize: 13,
    color: '#8E8E93',
  },
  vaccineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  vaccineLeft: {
    flex: 1,
  },
  vaccineName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  vaccineDate: {
    fontSize: 13,
    color: '#8E8E93',
  },
  vaccineNext: {
    alignItems: 'flex-end',
  },
  vaccineNextLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  vaccineNextDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5AC8FA',
  },
  visitItem: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  visitHospital: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  visitDepartment: {
    fontSize: 13,
    color: '#8E8E93',
  },
  // 今日统计卡片样式
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
  diaperBasicStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  diaperStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  diaperStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  diaperStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  diaperStatLabel: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'center',
  },
  diaperStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  urineAssessmentSection: {
    marginTop: 8,
  },
  assessmentDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 16,
  },
  assessmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  assessmentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 6,
  },
  urineProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  urineProgressBar: {
    flex: 1,
    height: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  urineProgressFill: {
    height: '100%',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 4,
  },
  progressInnerCircle: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  urineProgressPercent: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
    minWidth: 55,
    textAlign: 'right',
  },
  statusRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  statusTextLarge: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },
  rangeInfo: {
    alignItems: 'flex-end',
  },
  rangeLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 2,
  },
  rangeValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  suggestionCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  suggestionContent: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  dataSourceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  dataSourceText: {
    flex: 1,
    fontSize: 10,
    color: '#8E8E93',
    lineHeight: 14,
    marginLeft: 6,
  },
  noWeightTip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  noWeightText: {
    flex: 1,
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 8,
  },
  footer: {
    height: 32,
  },
});

