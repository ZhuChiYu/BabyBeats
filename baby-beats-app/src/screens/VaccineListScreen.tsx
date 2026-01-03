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
import { format, differenceInDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useFocusEffect } from '@react-navigation/native';
import { VACCINE_SCHEDULE, VaccineInfo, VaccineSchedulePoint } from '../constants/vaccineSchedule';

interface VaccineListScreenProps {
  navigation: any;
}

export const VaccineListScreen: React.FC<VaccineListScreenProps> = ({ navigation }) => {
  const { getCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();

  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0, 1, 2, 3])); // 默认展开前几个

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

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const isVaccineCompleted = (vaccineName: string, dose: number): boolean => {
    return vaccines.some(
      v => v.vaccineName === vaccineName && v.doseNumber === dose
    );
  };

  const getVaccineRecord = (vaccineName: string, dose: number): Vaccine | undefined => {
    return vaccines.find(
      v => v.vaccineName === vaccineName && v.doseNumber === dose
    );
  };

  // 检查疫苗是否被其他疫苗替代了
  const isVaccineReplaced = (vaccine: VaccineInfo): boolean => {
    if (!vaccine.replacedBy || vaccine.replacedBy.length === 0) return false;
    
    // 检查是否有任何替代疫苗已接种
    return vaccine.replacedBy.some(replacerName => {
      // 检查所有剂次，只要有一针就算替代
      return vaccines.some(v => v.vaccineName === replacerName);
    });
  };

  const getBabyAgeInMonths = (): number => {
    if (!currentBaby) return 0;
    const days = differenceInDays(new Date(), currentBaby.birthDate);
    return days / 30;
  };

  const shouldHighlight = (schedule: VaccineSchedulePoint): boolean => {
    const babyAge = getBabyAgeInMonths();
    const scheduleAge = schedule.ageDays ? schedule.ageDays / 30 : schedule.ageMonths;
    // 高亮当前年龄前后1个月的接种点
    return Math.abs(scheduleAge - babyAge) <= 1;
  };

  const handleAddVaccine = (vaccineName: string, dose: number) => {
    navigation.navigate('AddVaccine', {
      defaultVaccineName: vaccineName,
      defaultDoseNumber: dose,
    });
  };

  const handleDeleteVaccine = (vaccine: Vaccine) => {
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

  const renderVaccineItem = (vaccine: VaccineInfo, schedule: VaccineSchedulePoint) => {
    const isCompleted = isVaccineCompleted(vaccine.name, vaccine.doses);
    const record = getVaccineRecord(vaccine.name, vaccine.doses);
    const isReplaced = isVaccineReplaced(vaccine);

    return (
      <TouchableOpacity
        key={`${vaccine.name}-${vaccine.doses}`}
        style={[
          styles.vaccineItem,
          isCompleted && styles.vaccineItemCompleted,
          isReplaced && styles.vaccineItemReplaced,
        ]}
        onPress={() => {
          if (isReplaced) {
            // 被替代的疫苗，不允许点击
            return;
          }
          if (isCompleted && record) {
            handleDeleteVaccine(record);
          } else {
            handleAddVaccine(vaccine.name, vaccine.doses);
          }
        }}
        activeOpacity={isReplaced ? 1 : 0.7}
        disabled={isReplaced}
      >
        <View style={styles.vaccineLeft}>
          <View style={[
            styles.checkbox,
            isCompleted && styles.checkboxChecked,
            isReplaced && styles.checkboxReplaced,
          ]}>
            {isCompleted ? (
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            ) : isReplaced ? (
              <Text style={styles.replacedIcon}>≈</Text>
            ) : null}
          </View>
          <View style={styles.vaccineInfo}>
            <Text style={[
              styles.vaccineName,
              isCompleted && styles.vaccineNameCompleted,
              isReplaced && styles.vaccineNameReplaced,
            ]}>
              {vaccine.name}
              {vaccine.doses > 0 && (
                <Text style={styles.doseNumber}>
                  {'①②③④⑤⑥⑦⑧⑨⑩'.charAt(vaccine.doses - 1)}
                </Text>
              )}
            </Text>
            {isReplaced && (
              <Text style={styles.replacedNote}>
                ⚡ 已被 {vaccine.replacedBy?.join('、')} 替代
              </Text>
            )}
            {vaccine.note && !isReplaced && (
              <Text style={styles.vaccineNote}>{vaccine.note}</Text>
            )}
            {vaccine.alternativeTo && !isReplaced && (
              <Text style={styles.vaccineAlternative}>💡 {vaccine.alternativeTo}</Text>
            )}
            {isCompleted && record && (
              <Text style={styles.vaccineDate}>
                ✓ {format(new Date(record.vaccinationDate), 'MM月dd日', { locale: zhCN })}
                {record.location && ` · ${record.location}`}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.vaccineRight}>
          {!isReplaced && !vaccine.isFree && vaccine.price && (
            <Text style={styles.priceTag}>¥{vaccine.price}</Text>
          )}
          {!isReplaced && (
            <Ionicons 
              name={isCompleted ? "trash-outline" : "add-circle"} 
              size={20} 
              color={isCompleted ? "#FF3B30" : "#007AFF"} 
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderScheduleSection = (schedule: VaccineSchedulePoint, index: number) => {
    const isExpanded = expandedSections.has(index);
    const isHighlighted = shouldHighlight(schedule);
    const freeCompleted = schedule.freeVaccines.filter(v => isVaccineCompleted(v.name, v.doses)).length;
    const paidCompleted = schedule.paidVaccines.filter(v => isVaccineCompleted(v.name, v.doses)).length;
    const totalVaccines = schedule.freeVaccines.length + schedule.paidVaccines.length;
    const totalCompleted = freeCompleted + paidCompleted;

    return (
      <View key={index} style={[
        styles.scheduleSection,
        isHighlighted && styles.scheduleSectionHighlighted,
      ]}>
        <TouchableOpacity
          style={styles.scheduleSectionHeader}
          onPress={() => toggleSection(index)}
          activeOpacity={0.7}
        >
          <View style={styles.scheduleHeaderLeft}>
            <View style={[
              styles.ageCircle,
              isHighlighted && styles.ageCircleHighlighted,
            ]}>
              <Ionicons 
                name={schedule.isCheckup ? "calendar" : "time"} 
                size={20} 
                color={isHighlighted ? "#FFFFFF" : "#007AFF"} 
              />
            </View>
            <View>
              <Text style={[
                styles.ageLabel,
                isHighlighted && styles.ageLabelHighlighted,
              ]}>
                {schedule.ageLabel}
                {schedule.isCheckup && <Text style={styles.checkupBadge}> 体检</Text>}
              </Text>
              <Text style={styles.completionText}>
                {totalCompleted}/{totalVaccines} 已完成
              </Text>
            </View>
          </View>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="#8E8E93" 
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.scheduleSectionBody}>
            {/* 免疫规划（免费）疫苗 */}
            {schedule.freeVaccines.length > 0 && (
              <View style={styles.vaccineGroup}>
                <View style={styles.groupHeader}>
                  <Ionicons name="shield-checkmark" size={16} color="#34C759" />
                  <Text style={styles.groupTitle}>
                    免疫规划（免费）
                    <Text style={styles.groupCount}> {freeCompleted}/{schedule.freeVaccines.length}</Text>
                  </Text>
                </View>
                {schedule.freeVaccines.map(vaccine => renderVaccineItem(vaccine, schedule))}
              </View>
            )}

            {/* 非免疫规划（自费）疫苗 */}
            {schedule.paidVaccines.length > 0 && (
              <View style={styles.vaccineGroup}>
                <View style={styles.groupHeader}>
                  <Ionicons name="card" size={16} color="#FF9500" />
                  <Text style={styles.groupTitle}>
                    非免疫规划（自费）
                    <Text style={styles.groupCount}> {paidCompleted}/{schedule.paidVaccines.length}</Text>
                  </Text>
                </View>
                {schedule.paidVaccines.map(vaccine => renderVaccineItem(vaccine, schedule))}
              </View>
            )}
          </View>
        )}
      </View>
    );
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
        <Text style={styles.headerTitle}>疫苗接种计划</Text>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => {
            Alert.alert(
              '使用说明',
              '📋 如何使用：\n' +
              '• 点击疫苗名称添加接种记录\n' +
              '• ✓ 表示已接种，可点击删除\n' +
              '• ⚡ 表示已被其他疫苗替代\n' +
              '• 免费疫苗为国家免疫规划项目\n' +
              '• 自费疫苗价格仅供参考\n' +
              '• 高亮显示当前推荐接种\n\n' +
              '📚 数据来源：\n' +
              '本疫苗接种计划参考中国国家免疫规划和非免疫规划疫苗接种指南。\n\n' +
              '⚠️ 重要提示：\n' +
              '具体接种时间和疫苗选择请咨询医生。',
              [{ text: '知道了' }]
            );
          }}
        >
          <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 疫苗接种计划列表 */}
        {VACCINE_SCHEDULE.map((schedule, index) => renderScheduleSection(schedule, index))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ℹ️ 数据来源：中国国家免疫规划{'\n'}
            具体接种时间请咨询医生
          </Text>
        </View>
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
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  infoButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  scheduleSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  scheduleSectionHighlighted: {
    borderWidth: 2,
    borderColor: '#007AFF',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduleSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FAFAFA',
  },
  scheduleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ageCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ageCircleHighlighted: {
    backgroundColor: '#007AFF',
  },
  ageLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  ageLabelHighlighted: {
    color: '#007AFF',
  },
  checkupBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9500',
  },
  completionText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  scheduleSectionBody: {
    padding: 16,
    paddingTop: 8,
  },
  vaccineGroup: {
    marginBottom: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginLeft: 6,
  },
  groupCount: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
  },
  vaccineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    marginBottom: 8,
  },
  vaccineItemCompleted: {
    backgroundColor: '#E8F5E9',
  },
  vaccineItemReplaced: {
    backgroundColor: '#F5F5F7',
    opacity: 0.7,
  },
  vaccineLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  checkboxReplaced: {
    backgroundColor: '#8E8E93',
    borderColor: '#8E8E93',
  },
  replacedIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  vaccineInfo: {
    flex: 1,
  },
  vaccineName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  vaccineNameCompleted: {
    color: '#34C759',
  },
  vaccineNameReplaced: {
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },
  replacedNote: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
    fontStyle: 'italic',
  },
  doseNumber: {
    fontSize: 13,
    fontWeight: '500',
    color: '#007AFF',
  },
  vaccineNote: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
    lineHeight: 16,
  },
  vaccineAlternative: {
    fontSize: 12,
    color: '#FF9500',
    marginTop: 4,
    lineHeight: 16,
  },
  vaccineDate: {
    fontSize: 12,
    color: '#34C759',
    marginTop: 4,
  },
  vaccineRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  priceTag: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF9500',
    marginBottom: 4,
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
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
  },
});
