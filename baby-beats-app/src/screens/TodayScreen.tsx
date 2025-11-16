import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBabyStore } from '../store/babyStore';
import { FeedingService } from '../services/feedingService';
import { SleepService } from '../services/sleepService';
import { DiaperService } from '../services/diaperService';
import { PumpingService } from '../services/pumpingService';
import { Card } from '../components/Card';
import { QuickActionMenu } from '../components/QuickActionMenu';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const TodayScreen: React.FC = () => {
  const { getCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();
  
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
  
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (currentBaby) {
      loadTodayData();
    }
  }, [currentBaby?.id]);
  
  const loadTodayData = async () => {
    if (!currentBaby) return;
    
    setLoading(true);
    try {
      const [feedingData, sleepData, diaperData, pumpingData] = await Promise.all([
        FeedingService.getTodayStats(currentBaby.id),
        SleepService.getTodayStats(currentBaby.id),
        DiaperService.getTodayStats(currentBaby.id),
        PumpingService.getTodayStats(currentBaby.id),
      ]);
      
      setFeedingStats(feedingData);
      setSleepStats(sleepData);
      setDiaperStats(diaperData);
      setPumpingStats(pumpingData);
    } catch (error) {
      console.error('Failed to load today data:', error);
    } finally {
      setLoading(false);
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
        <View>
          <Text style={styles.babyName}>{currentBaby.name}</Text>
          <Text style={styles.date}>
            {format(new Date(), 'MM月dd日 EEEE', { locale: zhCN })}
          </Text>
        </View>
        <QuickActionMenu />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
  babyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  date: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
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
  footer: {
    height: 32,
  },
});

