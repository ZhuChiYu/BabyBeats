import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBabyStore } from '../store/babyStore';
import { VaccineService } from '../services/vaccineService';
import { Vaccine } from '../types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useFocusEffect } from '@react-navigation/native';

interface VaccineListScreenProps {
  navigation: any;
}

export const VaccineListScreen: React.FC<VaccineListScreenProps> = ({ navigation }) => {
  const { getCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();

  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (currentBaby) {
      loadVaccines();
    }
  }, [currentBaby?.id]);

  useFocusEffect(
    React.useCallback(() => {
      if (currentBaby) {
        loadVaccines();
      }
    }, [currentBaby?.id])
  );

  const loadVaccines = async () => {
    if (!currentBaby) return;

    try {
      const data = await VaccineService.getByBabyId(currentBaby.id);
      setVaccines(data);
    } catch (error) {
      console.error('Failed to load vaccines:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadVaccines();
  };

  const handleDelete = (vaccine: Vaccine) => {
    Alert.alert('确认删除', '确定要删除这条疫苗记录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await VaccineService.delete(vaccine.id);
            loadVaccines();
          } catch (error) {
            Alert.alert('错误', '删除失败，请重试');
          }
        },
      },
    ]);
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>疫苗接种</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddVaccine')}
        >
          <Ionicons name="add" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {vaccines.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="shield-checkmark-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyText}>暂无疫苗记录</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('AddVaccine')}
            >
              <Text style={styles.emptyButtonText}>添加第一条记录</Text>
            </TouchableOpacity>
          </View>
        ) : (
          vaccines.map((vaccine) => (
            <View key={vaccine.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons name="shield-checkmark" size={24} color="#34C759" />
                </View>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle}>{vaccine.vaccineName}</Text>
                  <Text style={styles.cardDate}>
                    {format(new Date(vaccine.vaccinationDate), 'yyyy年MM月dd日', {
                      locale: zhCN,
                    })}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(vaccine)}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>

              <View style={styles.cardBody}>
                {vaccine.doseNumber && (
                  <View style={styles.detailRow}>
                    <Ionicons name="medical" size={16} color="#8E8E93" />
                    <Text style={styles.detailText}>第{vaccine.doseNumber}针</Text>
                  </View>
                )}
                {vaccine.location && (
                  <View style={styles.detailRow}>
                    <Ionicons name="location" size={16} color="#8E8E93" />
                    <Text style={styles.detailText}>{vaccine.location}</Text>
                  </View>
                )}
                {vaccine.nextDate && (
                  <View style={[styles.detailRow, styles.highlightRow]}>
                    <Ionicons name="time" size={16} color="#FF9500" />
                    <Text style={[styles.detailText, { color: '#FF9500' }]}>
                      下次: {format(new Date(vaccine.nextDate), 'MM-dd', { locale: zhCN })}
                    </Text>
                  </View>
                )}
                {vaccine.notes && (
                  <Text style={styles.notes}>{vaccine.notes}</Text>
                )}
              </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  addButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F7',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#34C75915',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  deleteButton: {
    padding: 8,
  },
  cardBody: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  highlightRow: {
    backgroundColor: '#FF950015',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  notes: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    lineHeight: 20,
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
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    height: 32,
  },
});

