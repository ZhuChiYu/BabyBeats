import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBabyStore } from '../store/babyStore';
import { FeedingService } from '../services/feedingService';
import { SleepService } from '../services/sleepService';
import { DiaperService } from '../services/diaperService';
import { PumpingService } from '../services/pumpingService';
import { GrowthService } from '../services/growthService';
import { exportAllData } from '../utils/exportUtils';
import { importFromJSON, showImportStats } from '../utils/importUtils';
import { Colors, APP_CONFIG } from '../constants';
import { DataService } from '../services/dataService';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { getCurrentBaby, babies } = useBabyStore();
  const currentBaby = getCurrentBaby();
  
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  const handleShowExportModal = () => {
    if (!currentBaby) {
      Alert.alert('提示', '请先选择一个宝宝');
      return;
    }
    setShowExportModal(true);
  };
  
  const handleExportData = async (format: 'csv' | 'json') => {
    setShowExportModal(false);
    
    if (!currentBaby) {
      Alert.alert('提示', '请先选择一个宝宝');
      return;
    }
    
            setExporting(true);
            try {
              // 动态导入新服务
              const { TemperatureService } = await import('../services/temperatureService');
              const { VaccineService } = await import('../services/vaccineService');
              const { MilestoneService } = await import('../services/milestoneService');
              const { MedicationService } = await import('../services/medicationService');
              const { MedicalVisitService } = await import('../services/medicalVisitService');
              
              // 获取所有数据
              const [
                feedings,
                sleeps,
                diapers,
                pumpings,
                growthRecords,
                temperatures,
                vaccines,
                milestones,
                medications,
                medicalVisits,
              ] = await Promise.all([
                FeedingService.getByBabyId(currentBaby.id),
                SleepService.getByBabyId(currentBaby.id),
                DiaperService.getByBabyId(currentBaby.id),
                PumpingService.getByBabyId(currentBaby.id),
                GrowthService.getByBabyId(currentBaby.id),
                TemperatureService.getByBabyId(currentBaby.id),
                VaccineService.getByBabyId(currentBaby.id),
                MilestoneService.getByBabyId(currentBaby.id),
                MedicationService.getByBabyId(currentBaby.id),
                MedicalVisitService.getByBabyId(currentBaby.id),
              ]);
              
              await exportAllData(
                {
                  baby: currentBaby,
                  feedings,
                  sleeps,
                  diapers,
                  pumpings,
                  growthRecords,
                  temperatures,
                  vaccines,
                  milestones,
                  medications,
                  medicalVisits,
                },
                format
              );
              
              Alert.alert('成功', '数据导出成功');
            } catch (error) {
              console.error('Export error:', error);
              Alert.alert('错误', '导出失败，请重试');
            } finally {
              setExporting(false);
    }
  };

  const handleShowImportModal = () => {
    if (!currentBaby) {
      Alert.alert('提示', '请先选择一个宝宝');
      return;
    }
    setShowImportModal(true);
  };

  const handleImportData = async () => {
    setShowImportModal(false);
    
    if (!currentBaby) {
      Alert.alert('提示', '请先选择一个宝宝');
      return;
    }
    
    Alert.alert(
      '导入数据',
      `即将导入数据到 ${currentBaby.name} 的记录中\n\n⚠️ 导入的数据将添加到现有记录中，不会覆盖现有数据`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '继续导入',
          onPress: async () => {
            setImporting(true);
            try {
              const result = await importFromJSON(currentBaby.id);
              
              if (result.success) {
                const statsMessage = result.stats ? `\n\n${showImportStats(result.stats)}` : '';
                Alert.alert('成功', result.message + statsMessage);
              } else {
                Alert.alert('导入失败', result.message);
              }
            } catch (error) {
              console.error('Import error:', error);
              Alert.alert('错误', '导入失败，请重试');
            } finally {
              setImporting(false);
            }
          },
        },
      ]
    );
  };
  
  const handleClearData = async () => {
    if (!currentBaby) {
      Alert.alert('提示', '请先选择一个宝宝');
      return;
    }

    // 第一次确认：询问是否清空
    Alert.alert(
      '清空数据',
      '⚠️ 此操作将删除所有记录（喂养、睡眠、尿布、挤奶、成长等），但保留宝宝信息。\n\n确定要继续吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '继续',
          style: 'destructive',
          onPress: () => showDataStats(),
        },
      ]
    );
  };

  const showDataStats = async () => {
    try {
      // 获取数据统计
      const stats = await DataService.getDataStats(currentBaby?.id);
      const totalRecords = 
        stats.feedingCount + 
        stats.sleepCount + 
        stats.diaperCount + 
        stats.pumpingCount + 
        stats.growthCount;

      if (totalRecords === 0) {
        Alert.alert('提示', '当前没有任何记录可以清空');
        return;
      }

      // 第二次确认：显示数据统计
      Alert.alert(
        '确认清空',
        `即将清空以下数据：\n\n` +
        `• 喂养记录：${stats.feedingCount} 条\n` +
        `• 睡眠记录：${stats.sleepCount} 条\n` +
        `• 尿布记录：${stats.diaperCount} 条\n` +
        `• 挤奶记录：${stats.pumpingCount} 条\n` +
        `• 成长记录：${stats.growthCount} 条\n\n` +
        `共 ${totalRecords} 条记录\n\n` +
        `⚠️ 此操作无法撤销！`,
        [
          { text: '取消', style: 'cancel' },
          {
            text: '确认清空',
            style: 'destructive',
            onPress: () => confirmFinalClear(),
          },
        ]
      );
    } catch (error) {
      console.error('Failed to get data stats:', error);
      Alert.alert('错误', '获取数据统计失败');
    }
  };

  const confirmFinalClear = () => {
    // 第三次确认：最终确认
    Alert.alert(
      '最后确认',
      '真的要清空所有数据吗？此操作无法恢复！\n\n请输入"确认清空"以继续。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清空',
          style: 'destructive',
          onPress: () => executeClearData(),
        },
      ]
    );
  };

  const executeClearData = async () => {
    try {
      setExporting(true); // 复用 exporting 状态显示加载
      
      // 清空数据
      await DataService.clearAllRecords(currentBaby?.id);
      
      // 优化数据库
      await DataService.optimizeDatabase();
      
      Alert.alert(
        '成功',
        '所有数据已清空',
        [
          {
            text: '确定',
            onPress: () => {
              // 可以刷新页面或导航回首页
            },
          },
        ]
      );
    } catch (error) {
      console.error('Failed to clear data:', error);
      Alert.alert('错误', '清空数据失败，请重试');
    } finally {
      setExporting(false);
    }
  };
  
  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightElement?: React.ReactNode
  ) => {
    return (
      <TouchableOpacity
        style={styles.settingItem}
        onPress={onPress}
        disabled={!onPress}
      >
        <View style={styles.settingLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${Colors.primary}15` }]}>
            <Ionicons name={icon as any} size={20} color={Colors.primary} />
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>{title}</Text>
            {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
          </View>
        </View>
        {rightElement || (onPress && <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />)}
      </TouchableOpacity>
    );
  };
  
  const renderSection = (title: string, children: React.ReactNode) => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionContent}>{children}</View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>设置</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 宝宝信息 */}
        {currentBaby && (
          <View style={styles.babyCard}>
            <View style={styles.babyAvatar}>
              <Ionicons name="person" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.babyInfo}>
              <Text style={styles.babyName}>{currentBaby.name}</Text>
              <Text style={styles.babyDetail}>
                {currentBaby.gender === 'male' ? '男孩' : currentBaby.gender === 'female' ? '女孩' : ''}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.babyEditButton}
              onPress={() => navigation.navigate('EditBaby')}
            >
              <Ionicons name="create-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        )}
        
        {/* 数据管理 */}
        {renderSection(
          '数据管理',
          <>
            {renderSettingItem(
              'stats-chart-outline',
              '周/月报告',
              '查看详细的统计报告',
              () => navigation.navigate('Main', { screen: 'Stats' })
            )}
            {renderSettingItem(
              'download-outline',
              '导出数据',
              '导出所有记录（JSON/CSV）',
              handleShowExportModal,
              exporting ? <ActivityIndicator size="small" color={Colors.primary} /> : null
            )}
            {renderSettingItem(
              'cloud-upload-outline',
              '导入数据',
              '从文件导入记录',
              handleShowImportModal,
              importing ? <ActivityIndicator size="small" color={Colors.primary} /> : null
            )}
            {renderSettingItem(
              'cloud-outline',
              '数据同步',
              '多端同步，随时随地访问',
              () => navigation.navigate('SyncSettings')
            )}
          </>
        )}
        
        {/* 应用设置 */}
        {renderSection(
          '应用设置',
          <>
            {renderSettingItem(
              'notifications-outline',
              '通知提醒',
              '开启后会及时提醒',
              undefined,
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#E5E5EA', true: Colors.primary }}
              />
            )}
            {renderSettingItem(
              'text-outline',
              '文字大小',
              '标准',
              () => navigation.navigate('FontSizeSettings')
            )}
          </>
        )}
        
        {/* 宝宝管理 */}
        {renderSection(
          '宝宝管理',
          <>
            {renderSettingItem(
              'people-outline',
              '管理宝宝',
              `当前有 ${babies.length} 个宝宝`,
              () => navigation.navigate('BabyManagement')
            )}
            {renderSettingItem(
              'add-circle-outline',
              '添加宝宝',
              '添加新的宝宝档案',
              () => navigation.navigate('AddBaby')
            )}
          </>
        )}
        
        {/* 关于 */}
        {renderSection(
          '关于',
          <>
            {renderSettingItem(
              'information-circle-outline',
              '应用版本',
              APP_CONFIG.version
            )}
            {renderSettingItem(
              'shield-checkmark-outline',
              '隐私政策',
              '查看我们的隐私政策',
              () => navigation.navigate('PrivacyPolicy')
            )}
            {renderSettingItem(
              'document-text-outline',
              '使用条款',
              '查看使用条款',
              () => navigation.navigate('Terms')
            )}
            {renderSettingItem(
              'help-circle-outline',
              '帮助与反馈',
              '获取帮助或提交反馈',
              () => navigation.navigate('Help')
            )}
          </>
        )}
        
        {/* 危险操作 */}
        {renderSection(
          '危险操作',
          <>
            {renderSettingItem(
              'trash-outline',
              '清空所有数据',
              '删除所有记录（不可恢复）',
              handleClearData
            )}
          </>
        )}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {APP_CONFIG.name} v{APP_CONFIG.version}
          </Text>
          <Text style={styles.footerText}>Made with ❤️ for Zhu Jin Xi</Text>
        </View>
      </ScrollView>

      {/* 导出格式选择弹窗 */}
      <Modal
        visible={showExportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExportModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowExportModal(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>选择导出格式</Text>
              <TouchableOpacity 
                onPress={() => setShowExportModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <TouchableOpacity
                style={styles.formatOption}
                onPress={() => handleExportData('json')}
              >
                <View style={styles.formatIconContainer}>
                  <Ionicons name="code-outline" size={32} color={Colors.primary} />
                </View>
                <View style={styles.formatInfo}>
                  <Text style={styles.formatTitle}>JSON 格式</Text>
                  <Text style={styles.formatDescription}>
                    包含所有数据的完整备份，适合导入到其他设备
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </TouchableOpacity>

              <View style={styles.formatDivider} />

              <TouchableOpacity
                style={styles.formatOption}
                onPress={() => handleExportData('csv')}
              >
                <View style={styles.formatIconContainer}>
                  <Ionicons name="document-text-outline" size={32} color={Colors.primary} />
                </View>
                <View style={styles.formatInfo}>
                  <Text style={styles.formatTitle}>CSV 格式</Text>
                  <Text style={styles.formatDescription}>
                    表格数据，可在Excel中打开，按类型分别导出
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* 导入说明弹窗 */}
      <Modal
        visible={showImportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImportModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowImportModal(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>导入数据</Text>
              <TouchableOpacity 
                onPress={() => setShowImportModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.importInfo}>
                <Ionicons name="information-circle" size={48} color={Colors.primary} />
                <Text style={styles.importTitle}>支持的格式</Text>
                <Text style={styles.importDescription}>
                  仅支持导入 JSON 格式的文件{'\n'}
                  （由本应用导出的数据文件）
                </Text>
                
                <View style={styles.importWarning}>
                  <Ionicons name="warning-outline" size={20} color="#FF9500" />
                  <Text style={styles.importWarningText}>
                    导入的数据将添加到当前宝宝的记录中，不会覆盖现有数据
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.importButton}
                onPress={handleImportData}
              >
                <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
                <Text style={styles.importButtonText}>选择文件并导入</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
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
  content: {
    flex: 1,
  },
  babyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  babyAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  babyInfo: {
    flex: 1,
    marginLeft: 16,
  },
  babyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  babyDetail: {
    fontSize: 14,
    color: '#8E8E93',
  },
  babyEditButton: {
    padding: 8,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginLeft: 32,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F7',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 13,
    color: '#C7C7CC',
    marginBottom: 4,
  },
  // Modal 样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F7',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  // 导出格式选项
  formatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  formatIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  formatInfo: {
    flex: 1,
  },
  formatTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  formatDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  formatDivider: {
    height: 1,
    backgroundColor: '#F5F5F7',
    marginVertical: 8,
  },
  // 导入样式
  importInfo: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  importTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  importDescription: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  importWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  importWarningText: {
    flex: 1,
    fontSize: 13,
    color: '#FF9500',
    marginLeft: 8,
    lineHeight: 18,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  importButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
