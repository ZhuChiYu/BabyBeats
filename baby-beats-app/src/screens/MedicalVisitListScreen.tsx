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
import { MedicalVisitService } from '../services/medicalVisitService';
import { format } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';

export const MedicalVisitListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { getCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();
  const [visits, setVisits] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadVisits = async () => {
    if (!currentBaby) return;
    try {
      const data = await MedicalVisitService.getByBabyId(currentBaby.id);
      setVisits(data);
    } catch (error) {
      console.error('Failed to load visits:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (currentBaby) loadVisits();
  }, [currentBaby?.id]);

  useFocusEffect(React.useCallback(() => {
    if (currentBaby) loadVisits();
  }, [currentBaby?.id]));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>就医记录</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddMedicalVisit')}>
          <Ionicons name="add" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadVisits(); }} />}
      >
        {visits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="medical-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyText}>暂无就医记录</Text>
          </View>
        ) : (
          visits.map((visit) => (
            <TouchableOpacity
              key={visit.id}
              style={styles.card}
              onPress={() => navigation.navigate('AddMedicalVisit', { medicalVisit: visit })}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Ionicons name="medical" size={24} color="#5856D6" />
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle}>{visit.hospital || '就诊记录'}</Text>
                  <Text style={styles.cardDate}>
                    {format(new Date(visit.visitTime), 'yyyy-MM-dd HH:mm')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </View>
              {visit.department && <Text style={styles.cardDetail}>科室: {visit.department}</Text>}
              {visit.symptoms && <Text style={styles.cardDetail}>症状: {visit.symptoms}</Text>}
              {visit.diagnosis && <Text style={styles.cardDetail}>诊断: {visit.diagnosis}</Text>}
            </TouchableOpacity>
          ))
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitleContainer: { flex: 1, marginLeft: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#000' },
  cardDate: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
  cardDetail: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
  emptyText: { fontSize: 16, color: '#8E8E93', marginTop: 16 },
});

