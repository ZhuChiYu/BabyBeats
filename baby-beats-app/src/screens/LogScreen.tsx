import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useBabyStore } from '../store/babyStore';
import { FeedingService } from '../services/feedingService';
import { SleepService } from '../services/sleepService';
import { DiaperService } from '../services/diaperService';
import { PumpingService } from '../services/pumpingService';
import { SwipeableRow } from '../components/SwipeableRow';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

type RecordType = 'all' | 'feeding' | 'sleep' | 'diaper' | 'pumping';

interface BabyRecord {
  id: string;
  type: 'feeding' | 'sleep' | 'diaper' | 'pumping';
  time: number;
  data: any;
}

interface LogScreenProps {
  navigation: any;
}

export const LogScreen: React.FC<LogScreenProps> = ({ navigation }) => {
  const { getCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();
  
  const [records, setRecords] = useState<BabyRecord[]>([]);
  const [filterType, setFilterType] = useState<RecordType>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    if (currentBaby) {
      loadRecords();
    }
  }, [currentBaby?.id, filterType]);

  // 监听页面聚焦，实时刷新数据
  useFocusEffect(
    React.useCallback(() => {
      if (currentBaby) {
        loadRecords();
      }
    }, [currentBaby?.id, filterType])
  );
  
  const loadRecords = async () => {
    if (!currentBaby) return;
    
    setLoading(true);
    try {
      const allRecords: BabyRecord[] = [];
      
      if (filterType === 'all' || filterType === 'feeding') {
        const feedings = await FeedingService.getByBabyId(currentBaby.id, 50);
        feedings.forEach(f => allRecords.push({ id: f.id, type: 'feeding', time: f.time, data: f }));
      }
      
      if (filterType === 'all' || filterType === 'sleep') {
        const sleeps = await SleepService.getByBabyId(currentBaby.id, 50);
        sleeps.forEach(s => allRecords.push({ id: s.id, type: 'sleep', time: s.startTime, data: s }));
      }
      
      if (filterType === 'all' || filterType === 'diaper') {
        const diapers = await DiaperService.getByBabyId(currentBaby.id, 50);
        diapers.forEach(d => allRecords.push({ id: d.id, type: 'diaper', time: d.time, data: d }));
      }
      
      if (filterType === 'all' || filterType === 'pumping') {
        const pumpings = await PumpingService.getByBabyId(currentBaby.id, 50);
        pumpings.forEach(p => allRecords.push({ id: p.id, type: 'pumping', time: p.time, data: p }));
      }
      
      // 按时间排序
      allRecords.sort((a, b) => b.time - a.time);
      
      setRecords(allRecords);
    } catch (error) {
      console.error('Failed to load records:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    loadRecords();
  };
  
  const handleEdit = (record: BabyRecord) => {
    switch (record.type) {
      case 'feeding':
        navigation.navigate('EditFeeding', { feedingId: record.id });
        break;
      case 'sleep':
        navigation.navigate('EditSleep', { sleepId: record.id });
        break;
      case 'diaper':
        navigation.navigate('EditDiaper', { diaperId: record.id });
        break;
      case 'pumping':
        navigation.navigate('EditPumping', { pumpingId: record.id });
        break;
    }
  };

  const handleDelete = (record: BabyRecord) => {
    Alert.alert(
      '确认删除',
      '确定要删除这条记录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              switch (record.type) {
                case 'feeding':
                  await FeedingService.delete(record.id);
                  break;
                case 'sleep':
                  await SleepService.delete(record.id);
                  break;
                case 'diaper':
                  await DiaperService.delete(record.id);
                  break;
                case 'pumping':
                  await PumpingService.delete(record.id);
                  break;
              }
              loadRecords();
            } catch (error) {
              Alert.alert('错误', '删除失败，请重试');
            }
          },
        },
      ]
    );
  };
  
  const getRecordIcon = (type: string) => {
    const icons: Record<string, { name: string; color: string }> = {
      feeding: { name: 'nutrition', color: '#FF9500' },
      sleep: { name: 'moon', color: '#5856D6' },
      diaper: { name: 'water', color: '#34C759' },
      pumping: { name: 'flask', color: '#AF52DE' },
    };
    return icons[type] || { name: 'ellipse', color: '#8E8E93' };
  };
  
  const getRecordTitle = (record: BabyRecord) => {
    switch (record.type) {
      case 'feeding':
        const feeding = record.data;
        if (feeding.type === 'breast') {
          const total = (feeding.leftDuration || 0) + (feeding.rightDuration || 0);
          return `亲喂母乳 ${total}分钟`;
        } else if (feeding.type === 'bottled_breast_milk') {
          return `瓶喂母乳 ${feeding.milkAmount}ml`;
        } else {
          return `配方奶 ${feeding.milkAmount}ml`;
        }
      case 'sleep':
        const sleep = record.data;
        const hours = Math.floor(sleep.duration / 60);
        const mins = sleep.duration % 60;
        return `${sleep.sleepType === 'nap' ? '小睡' : '夜间睡眠'} ${hours}h${mins}m`;
      case 'diaper':
        const diaper = record.data;
        const types = {
          poop: '大便',
          pee: '小便',
          both: '大小便',
        };
        let title = types[diaper.type as keyof typeof types] || '尿布';
        // 如果是小便或都有，且有尿量数据，显示尿量
        if ((diaper.type === 'pee' || diaper.type === 'both') && diaper.urineAmount) {
          title += ` ${diaper.urineAmount.toFixed(1)}g`;
        }
        return title;
      case 'pumping':
        const pumping = record.data;
        return `挤奶 ${pumping.totalAmount}ml`;
      default:
        return '记录';
    }
  };
  
  const formatTime = (timestamp: number) => {
    return format(new Date(timestamp), 'HH:mm', { locale: zhCN });
  };
  
  const handleQuickAdd = () => {
    // 直接导航到快速添加页面，使用当前日期
    navigation.navigate('QuickAddRecord', { initialDate: new Date().getTime() });
  };
  
  const formatDate = (timestamp: number) => {
    const today = new Date();
    const recordDate = new Date(timestamp);
    
    if (recordDate.toDateString() === today.toDateString()) {
      return '今天';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (recordDate.toDateString() === yesterday.toDateString()) {
      return '昨天';
    }
    
    return format(recordDate, 'MM月dd日', { locale: zhCN });
  };
  
  // 按日期分组
  const groupedRecords: { [key: string]: BabyRecord[] } = {};
  records.forEach(record => {
    const dateKey = formatDate(record.time);
    if (!groupedRecords[dateKey]) {
      groupedRecords[dateKey] = [];
    }
    groupedRecords[dateKey].push(record);
  });
  
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>记录</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleQuickAdd}
        >
          <Ionicons name="add-circle" size={32} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* 筛选器 */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { type: 'all', label: '全部' },
            { type: 'feeding', label: '喂养' },
            { type: 'sleep', label: '睡眠' },
            { type: 'diaper', label: '尿布' },
            { type: 'pumping', label: '挤奶' },
          ].map(filter => (
            <TouchableOpacity
              key={filter.type}
              style={[
                styles.filterButton,
                filterType === filter.type && styles.filterButtonActive,
              ]}
              onPress={() => setFilterType(filter.type as RecordType)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterType === filter.type && styles.filterButtonTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* 记录列表 */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {records.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyText}>暂无记录</Text>
          </View>
        ) : (
          Object.keys(groupedRecords).map(dateKey => (
            <View key={dateKey} style={styles.dateSection}>
              <Text style={styles.dateHeader}>{dateKey}</Text>
              {groupedRecords[dateKey].map((record, index) => {
                const icon = getRecordIcon(record.type);
                const isLast = index === groupedRecords[dateKey].length - 1;
                return (
                  <View key={record.id}>
                    <SwipeableRow
                      onDelete={() => handleDelete(record)}
                    >
                      <TouchableOpacity 
                        style={styles.recordCard}
                        onPress={() => handleEdit(record)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.iconContainer, { backgroundColor: `${icon.color}15` }]}>
                          <Ionicons name={icon.name as any} size={20} color={icon.color} />
                        </View>
                        <View style={styles.recordInfo}>
                          <Text style={styles.recordTitle}>{getRecordTitle(record)}</Text>
                          <Text style={styles.recordTime}>{formatTime(record.time)}</Text>
                        </View>
                      </TouchableOpacity>
                    </SwipeableRow>
                    {!isLast && <View style={styles.recordDivider} />}
                  </View>
                );
              })}
            </View>
          ))
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
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
  },
  addButton: {
    padding: 0,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#F5F5F7',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  dateSection: {
    marginTop: 16,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  recordDivider: {
    height: 1,
    backgroundColor: '#F5F5F7',
    marginLeft: 68,
    marginRight: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  recordTime: {
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
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
