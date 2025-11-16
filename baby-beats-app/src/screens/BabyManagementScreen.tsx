import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBabyStore } from '../store/babyStore';
import { BabyService } from '../services/babyService';
import { Colors } from '../constants';
import { format } from 'date-fns';

interface BabyManagementScreenProps {
  navigation: any;
}

export const BabyManagementScreen: React.FC<BabyManagementScreenProps> = ({ navigation }) => {
  const { babies, currentBabyId, setCurrentBabyId, removeBaby, setBabies } = useBabyStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const allBabies = await BabyService.getAll('temp-user-id'); // TODO: 使用真实用户ID
      setBabies(allBabies);
    } catch (error) {
      console.error('Failed to load babies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveBaby = (babyId: string) => {
    const baby = babies.find(b => b.id === babyId);
    if (!baby) return;

    Alert.alert(
      '归档宝宝',
      `确定要归档 ${baby.name} 吗？归档后可以在归档列表中找回。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '归档',
          style: 'destructive',
          onPress: async () => {
            try {
              await BabyService.update(babyId, { isArchived: true });
              
              // 如果归档的是当前宝宝，切换到第一个未归档的宝宝
              if (currentBabyId === babyId) {
                const activeBabies = babies.filter(b => !b.isArchived && b.id !== babyId);
                if (activeBabies.length > 0) {
                  setCurrentBabyId(activeBabies[0].id);
                } else {
                  setCurrentBabyId(null);
                }
              }
              
              await loadData();
            } catch (error) {
              Alert.alert('错误', '归档失败，请重试');
            }
          },
        },
      ]
    );
  };

  const handleDeleteBaby = (babyId: string) => {
    const baby = babies.find(b => b.id === babyId);
    if (!baby) return;

    Alert.alert(
      '删除宝宝',
      `确定要永久删除 ${baby.name} 及其所有记录吗？此操作不可恢复！`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await BabyService.delete(babyId);
              removeBaby(babyId);
              
              // 如果删除的是当前宝宝，切换到第一个宝宝
              if (currentBabyId === babyId) {
                const remainingBabies = babies.filter(b => b.id !== babyId);
                if (remainingBabies.length > 0) {
                  setCurrentBabyId(remainingBabies[0].id);
                } else {
                  setCurrentBabyId(null);
                }
              }
            } catch (error) {
              Alert.alert('错误', '删除失败，请重试');
            }
          },
        },
      ]
    );
  };

  const handleRestoreBaby = async (babyId: string) => {
    try {
      await BabyService.update(babyId, { isArchived: false });
      await loadData();
    } catch (error) {
      Alert.alert('错误', '恢复失败，请重试');
    }
  };

  const activeBabies = babies.filter(b => !b.isArchived);
  const archivedBabies = babies.filter(b => b.isArchived);

  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case 'male':
        return { name: 'male', color: '#007AFF' };
      case 'female':
        return { name: 'female', color: '#FF2D55' };
      default:
        return { name: 'help', color: '#8E8E93' };
    }
  };

  const calculateAge = (birthday: number) => {
    const now = new Date();
    const birth = new Date(birthday);
    const diffTime = Math.abs(now.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} 天`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} 个月`;
    } else {
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      return `${years} 岁 ${months} 个月`;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>宝宝管理</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddBaby')}
        >
          <Ionicons name="add" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 活跃宝宝 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>我的宝宝</Text>
          {activeBabies.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="person-add-outline" size={48} color="#C7C7CC" />
              <Text style={styles.emptyText}>还没有宝宝，点击右上角添加</Text>
            </View>
          ) : (
            activeBabies.map((baby) => {
              const genderIcon = getGenderIcon(baby.gender);
              return (
                <View key={baby.id} style={styles.babyCard}>
                  <TouchableOpacity
                    style={styles.babyCardLeft}
                    onPress={() => {
                      setCurrentBabyId(baby.id);
                      navigation.goBack();
                    }}
                  >
                    <View style={styles.babyInfo}>
                      <View style={styles.babyNameRow}>
                        <Text style={styles.babyName}>{baby.name}</Text>
                        <Ionicons
                          name={genderIcon.name as any}
                          size={16}
                          color={genderIcon.color}
                        />
                        {currentBabyId === baby.id && (
                          <View style={styles.currentBadge}>
                            <Text style={styles.currentBadgeText}>当前</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.babyAge}>
                        {calculateAge(baby.birthday)} · {format(baby.birthday, 'yyyy年MM月dd日')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  
                  <View style={styles.babyActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => navigation.navigate('EditBaby')}
                    >
                      <Ionicons name="create-outline" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleArchiveBaby(baby.id)}
                    >
                      <Ionicons name="archive-outline" size={20} color="#FF9500" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteBaby(baby.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* 归档宝宝 */}
        {archivedBabies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>已归档</Text>
            {archivedBabies.map((baby) => {
              const genderIcon = getGenderIcon(baby.gender);
              return (
                <View key={baby.id} style={[styles.babyCard, styles.archivedBabyCard]}>
                  <View style={styles.babyInfo}>
                    <View style={styles.babyNameRow}>
                      <Text style={[styles.babyName, styles.archivedText]}>{baby.name}</Text>
                      <Ionicons
                        name={genderIcon.name as any}
                        size={16}
                        color="#C7C7CC"
                      />
                    </View>
                    <Text style={[styles.babyAge, styles.archivedText]}>
                      {calculateAge(baby.birthday)} · {format(baby.birthday, 'yyyy年MM月dd日')}
                    </Text>
                  </View>
                  
                  <View style={styles.babyActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleRestoreBaby(baby.id)}
                    >
                      <Ionicons name="arrow-undo-outline" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteBaby(baby.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 40 }} />
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  addButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8E8E93',
  },
  babyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  archivedBabyCard: {
    opacity: 0.6,
  },
  babyCardLeft: {
    flex: 1,
  },
  babyInfo: {
    flex: 1,
  },
  babyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  babyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginRight: 8,
  },
  currentBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  currentBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  babyAge: {
    fontSize: 14,
    color: '#8E8E93',
  },
  archivedText: {
    color: '#C7C7CC',
  },
  babyActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});

