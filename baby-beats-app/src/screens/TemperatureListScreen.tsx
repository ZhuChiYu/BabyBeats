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
import { format } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';

export const TemperatureListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { getCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();
  const [temperatures, setTemperatures] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadTemperatures = async () => {
    if (!currentBaby) return;
    try {
      const data = await TemperatureService.getByBabyId(currentBaby.id);
      setTemperatures(data);
    } catch (error) {
      console.error('Failed to load temperatures:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (currentBaby) loadTemperatures();
  }, [currentBaby?.id]);

  useFocusEffect(React.useCallback(() => {
    if (currentBaby) loadTemperatures();
  }, [currentBaby?.id]));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>体温记录</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddTemperature')}>
          <Ionicons name="add" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadTemperatures(); }} />}
      >
        {temperatures.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="thermometer-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyText}>暂无体温记录</Text>
          </View>
        ) : (
          temperatures.map((temp) => {
            const status = TemperatureService.getTemperatureStatus(temp.temperature);
            return (
              <View key={temp.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.tempIcon, { backgroundColor: `${status.color}15` }]}>
                    <Ionicons name="thermometer" size={24} color={status.color} />
                  </View>
                  <View style={styles.cardTitleContainer}>
                    <Text style={[styles.tempValue, { color: status.color }]}>
                      {temp.temperature}°C
                    </Text>
                    <Text style={styles.cardDate}>
                      {format(new Date(temp.date), 'yyyy-MM-dd HH:mm')}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${status.color}15` }]}>
                    <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                  </View>
                </View>
                {temp.notes && <Text style={styles.notes}>{temp.notes}</Text>}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  content: { flex: 1 },
  card: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  tempIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardTitleContainer: { flex: 1 },
  tempValue: { fontSize: 24, fontWeight: 'bold' },
  cardDate: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 14, fontWeight: '600' },
  notes: { fontSize: 14, color: '#8E8E93', marginTop: 12 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
  emptyText: { fontSize: 16, color: '#8E8E93', marginTop: 16 },
});

