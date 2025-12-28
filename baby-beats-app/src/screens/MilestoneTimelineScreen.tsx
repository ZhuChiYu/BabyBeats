import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBabyStore } from '../store/babyStore';
import { MilestoneService } from '../services/milestoneService';
import { Milestone } from '../types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useFocusEffect } from '@react-navigation/native';

interface MilestoneTimelineScreenProps {
  navigation: any;
}

export const MilestoneTimelineScreen: React.FC<MilestoneTimelineScreenProps> = ({ navigation }) => {
  const { getCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (currentBaby) {
      loadMilestones();
    }
  }, [currentBaby?.id]);

  useFocusEffect(
    React.useCallback(() => {
      if (currentBaby) {
        loadMilestones();
      }
    }, [currentBaby?.id])
  );

  const loadMilestones = async () => {
    if (!currentBaby) return;

    try {
      const data = await MilestoneService.getByBabyId(currentBaby.id);
      setMilestones(data);
    } catch (error) {
      console.error('Failed to load milestones:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMilestones();
  };

  const milestoneTypes = MilestoneService.getMilestoneTypes();
  const getTypeInfo = (typeId: string) => {
    return milestoneTypes.find(t => t.id === typeId);
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
        <Text style={styles.headerTitle}>成长里程碑</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddMilestone')}
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
        {milestones.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="star-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyText}>还没有记录里程碑</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('AddMilestone')}
            >
              <Text style={styles.emptyButtonText}>记录第一个里程碑</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.timeline}>
            {milestones.map((milestone, index) => {
              const typeInfo = getTypeInfo(milestone.milestoneType);
              return (
                <View key={milestone.id} style={styles.timelineItem}>
                  <View style={styles.timelineLine}>
                    <View
                      style={[
                        styles.timelineDot,
                        { backgroundColor: typeInfo?.color || '#007AFF' },
                      ]}
                    >
                      <Ionicons
                        name={typeInfo?.icon as any || 'star'}
                        size={16}
                        color="#FFFFFF"
                      />
                    </View>
                    {index < milestones.length - 1 && (
                      <View style={styles.timelineConnector} />
                    )}
                  </View>

                  <View style={styles.timelineContent}>
                    <TouchableOpacity
                      style={styles.card}
                      onPress={() => navigation.navigate('AddMilestone', { milestone })}
                      activeOpacity={0.7}
                    >
                      <View style={styles.cardHeader}>
                        <View>
                          <Text style={styles.cardTitle}>{milestone.title}</Text>
                          <Text style={styles.cardDate}>
                            {format(new Date(milestone.time), 'yyyy年MM月dd日', {
                              locale: zhCN,
                            })}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.typeBadge,
                            { backgroundColor: `${typeInfo?.color || '#007AFF'}15` },
                          ]}
                        >
                          <Text
                            style={[
                              styles.typeBadgeText,
                              { color: typeInfo?.color || '#007AFF' },
                            ]}
                          >
                            {typeInfo?.name}
                          </Text>
                        </View>
                      </View>

                      {milestone.photoUrl && (
                        <Image
                          source={{ uri: milestone.photoUrl }}
                          style={styles.cardPhoto}
                        />
                      )}

                      {milestone.description && (
                        <Text style={styles.cardDescription}>
                          {milestone.description}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
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
  timeline: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineLine: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  timelineConnector: {
    flex: 1,
    width: 2,
    backgroundColor: '#E5E5EA',
    marginTop: 8,
    minHeight: 40,
  },
  timelineContent: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: '#000',
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

