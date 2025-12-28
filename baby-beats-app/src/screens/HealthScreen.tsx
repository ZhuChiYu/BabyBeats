import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBabyStore } from '../store/babyStore';
import { TemperatureService } from '../services/temperatureService';
import { VaccineService } from '../services/vaccineService';
import { MedicationService } from '../services/medicationService';
import { MedicalVisitService } from '../services/medicalVisitService';
import { Card } from '../components/Card';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useFocusEffect } from '@react-navigation/native';

interface HealthScreenProps {
  navigation: any;
}

export const HealthScreen: React.FC<HealthScreenProps> = ({ navigation }) => {
  const { getCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();

  const [latestTemp, setLatestTemp] = useState<any>(null);
  const [vaccineStats, setVaccineStats] = useState({ totalCount: 0, upcomingCount: 0 });
  const [medicationStats, setMedicationStats] = useState({ totalCount: 0, activeCount: 0 });
  const [visitStats, setVisitStats] = useState({ totalCount: 0, recentCount: 0 });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (currentBaby) {
      loadHealthData();
    }
  }, [currentBaby?.id]);

  useFocusEffect(
    React.useCallback(() => {
      if (currentBaby) {
        loadHealthData();
      }
    }, [currentBaby?.id])
  );

  const loadHealthData = async () => {
    if (!currentBaby) return;

    try {
      const [temp, vaccineData, medicationData, visitData] = await Promise.all([
        TemperatureService.getLatest(currentBaby.id),
        VaccineService.getStats(currentBaby.id),
        MedicationService.getStats(currentBaby.id),
        MedicalVisitService.getStats(currentBaby.id),
      ]);

      setLatestTemp(temp);
      setVaccineStats(vaccineData);
      setMedicationStats(medicationData);
      setVisitStats(visitData);
    } catch (error) {
      console.error('Failed to load health data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHealthData();
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
        <Text style={styles.headerTitle}>健康管理</Text>
        <Text style={styles.headerSubtitle}>{currentBaby.name}的健康档案</Text>
      </View>

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
        {/* 体温卡片 */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('TemperatureList')}
        >
          <Card>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <View style={[styles.iconContainer, { backgroundColor: '#FF6B6B15' }]}>
                  <Ionicons name="thermometer" size={24} color="#FF6B6B" />
                </View>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle}>体温记录</Text>
                  {latestTemp && (
                    <Text style={styles.cardSubtitle}>
                      最近: {format(new Date(latestTemp.date), 'MM-dd HH:mm')}
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddTemperature')}
              >
                <Ionicons name="add-circle" size={28} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
            {latestTemp ? (
              <View style={styles.tempDisplay}>
                <Text style={[styles.tempValue, { color: TemperatureService.getTemperatureStatus(latestTemp.temperature).color }]}>
                  {latestTemp.temperature}°C
                </Text>
                <View style={[
                  styles.tempStatus,
                  { backgroundColor: `${TemperatureService.getTemperatureStatus(latestTemp.temperature).color}15` }
                ]}>
                  <Text style={[
                    styles.tempStatusText,
                    { color: TemperatureService.getTemperatureStatus(latestTemp.temperature).color }
                  ]}>
                    {TemperatureService.getTemperatureStatus(latestTemp.temperature).label}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.noDataText}>暂无记录</Text>
            )}
          </Card>
        </TouchableOpacity>

        {/* 疫苗接种卡片 */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('VaccineList')}
        >
          <Card>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <View style={[styles.iconContainer, { backgroundColor: '#34C75915' }]}>
                  <Ionicons name="shield-checkmark" size={24} color="#34C759" />
                </View>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle}>疫苗接种</Text>
                  <Text style={styles.cardSubtitle}>计划管理与提醒</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddVaccine')}
              >
                <Ionicons name="add-circle" size={28} color="#34C759" />
              </TouchableOpacity>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#34C759' }]}>
                  {vaccineStats.totalCount}
                </Text>
                <Text style={styles.statLabel}>已接种</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#FF9500' }]}>
                  {vaccineStats.upcomingCount}
                </Text>
                <Text style={styles.statLabel}>待接种</Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>

        {/* 就医记录卡片 */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('MedicalVisitList')}
        >
          <Card>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <View style={[styles.iconContainer, { backgroundColor: '#5856D615' }]}>
                  <Ionicons name="medical" size={24} color="#5856D6" />
                </View>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle}>就医记录</Text>
                  <Text style={styles.cardSubtitle}>看病历史与诊断</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddMedicalVisit')}
              >
                <Ionicons name="add-circle" size={28} color="#5856D6" />
              </TouchableOpacity>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#5856D6' }]}>
                  {visitStats.totalCount}
                </Text>
                <Text style={styles.statLabel}>总就诊</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#FF9500' }]}>
                  {visitStats.recentCount}
                </Text>
                <Text style={styles.statLabel}>近30天</Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>

        {/* 用药记录卡片 */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('MedicationList')}
        >
          <Card>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <View style={[styles.iconContainer, { backgroundColor: '#AF52DE15' }]}>
                  <Ionicons name="medkit" size={24} color="#AF52DE" />
                </View>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle}>用药记录</Text>
                  <Text style={styles.cardSubtitle}>用药管理与提醒</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddMedication')}
              >
                <Ionicons name="add-circle" size={28} color="#AF52DE" />
              </TouchableOpacity>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#AF52DE' }]}>
                  {medicationStats.totalCount}
                </Text>
                <Text style={styles.statLabel}>总记录</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#FF3B30' }]}>
                  {medicationStats.activeCount}
                </Text>
                <Text style={styles.statLabel}>进行中</Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>

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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSubtitle: {
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
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  addButton: {
    padding: 4,
  },
  tempDisplay: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  tempValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tempStatus: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tempStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noDataText: {
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 14,
    paddingVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5EA',
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
