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
import { MedicationService } from '../services/medicationService';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useFocusEffect } from '@react-navigation/native';

export const MedicationListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { getCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();
  const [medications, setMedications] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadMedications = async () => {
    if (!currentBaby) return;
    try {
      const data = await MedicationService.getByBabyId(currentBaby.id);
      setMedications(data);
    } catch (error) {
      console.error('Failed to load medications:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (currentBaby) loadMedications();
  }, [currentBaby?.id]);

  useFocusEffect(React.useCallback(() => {
    if (currentBaby) loadMedications();
  }, [currentBaby?.id]));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>用药记录</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddMedication')}>
          <Ionicons name="add" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadMedications(); }} />}
      >
        {medications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="medkit-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyText}>暂无用药记录</Text>
          </View>
        ) : (
          medications.map((med) => (
            <TouchableOpacity
              key={med.id}
              style={styles.card}
              onPress={() => navigation.navigate('AddMedication', { medication: med })}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Ionicons name="medkit" size={24} color="#AF52DE" />
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle}>{med.medicationName}</Text>
                  <Text style={styles.cardDate}>
                    {format(new Date(med.medicationTime), 'yyyy-MM-dd HH:mm')}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardDetail}>剂量: {med.dosage}</Text>
              {med.frequency && <Text style={styles.cardDetail}>频次: {med.frequency}</Text>}
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

