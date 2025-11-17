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
import { Card } from '../components/Card';
import { QuickActionMenu } from '../components/QuickActionMenu';
import { LiveTimerCard } from '../components/LiveTimerCard';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useFocusEffect } from '@react-navigation/native';
import { syncManager } from '../services/syncManager';

interface TodayScreenProps {
  navigation: any;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({ navigation }) => {
  const { getCurrentBaby, babies, setCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();
  
  const [showBabySelector, setShowBabySelector] = useState(false);
  const [feedingStats, setFeedingStats] = useState({
    totalCount: 0,
    totalAmount: 0,
    totalDuration: 0,
  });
  
  const [sleepStats, setSleepStats] = useState({
    totalCount: 0,
    totalDuration: 0,
  });
  
  const [diaperStats, setDiaperStats] = useState({
    poopCount: 0,
    peeCount: 0,
  });
  
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
        feedingData,
        sleepData,
        diaperData,
        pumpingData,
        tempData,
        vaccineData,
        medicationData,
        visitData,
      ] = await Promise.all([
        FeedingService.getTodayStats(currentBaby.id),
        SleepService.getTodayStats(currentBaby.id),
        DiaperService.getTodayStats(currentBaby.id),
        PumpingService.getTodayStats(currentBaby.id),
        TemperatureService.getLatest(currentBaby.id),
        VaccineService.getByBabyId(currentBaby.id),
        MedicationService.getByBabyId(currentBaby.id),
        MedicalVisitService.getByBabyId(currentBaby.id),
      ]);
      
      setFeedingStats(feedingData);
      setSleepStats(sleepData);
      setDiaperStats(diaperData);
      setPumpingStats(pumpingData);
      setLatestTemp(tempData);
      setRecentVaccines(vaccineData.slice(0, 3)); // 最近3条疫苗记录
      
      // 只显示今天的用药和就诊
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = today.getTime();
      
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
              {babies.filter(b => !b.isArchived).length > 1 && (
                <Ionicons name="chevron-down" size={20} color="#000" />
              )}
            </View>
            <Text style={styles.babyAge}>{formatBabyAge(currentBaby.birthday)}</Text>
          </TouchableOpacity>
          <Text style={styles.date}>
            {format(new Date(), 'MM月dd日 EEEE', { locale: zhCN })}
          </Text>
        </View>
        <QuickActionMenu />
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
        
        {/* 喂养卡片 */}
        <Card>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="nutrition" size={24} color="#FF9500" />
              <Text style={styles.cardTitle}>喂养情况</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{feedingStats.totalCount}</Text>
              <Text style={styles.statLabel}>次数</Text>
            </View>
            {feedingStats.totalAmount > 0 && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{feedingStats.totalAmount}</Text>
                <Text style={styles.statLabel}>ml</Text>
              </View>
            )}
            {feedingStats.totalDuration > 0 && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{feedingStats.totalDuration}</Text>
                <Text style={styles.statLabel}>分钟</Text>
              </View>
            )}
          </View>
        </Card>
        
        {/* 睡眠卡片 */}
        <Card>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="moon" size={24} color="#5856D6" />
              <Text style={styles.cardTitle}>睡眠情况</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{sleepStats.totalCount}</Text>
              <Text style={styles.statLabel}>次数</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatDuration(sleepStats.totalDuration)}
              </Text>
              <Text style={styles.statLabel}>总时长</Text>
            </View>
          </View>
        </Card>
        
        {/* 尿布卡片 */}
        <Card>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="water" size={24} color="#34C759" />
              <Text style={styles.cardTitle}>尿布情况</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{diaperStats.poopCount}</Text>
              <Text style={styles.statLabel}>大便</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{diaperStats.peeCount}</Text>
              <Text style={styles.statLabel}>小便</Text>
            </View>
          </View>
        </Card>
        
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
  babyInfo: {
    marginBottom: 4,
  },
  babyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  babyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  babyAge: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
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
  footer: {
    height: 32,
  },
});

