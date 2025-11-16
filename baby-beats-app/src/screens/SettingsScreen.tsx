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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBabyStore } from '../store/babyStore';
import { FeedingService } from '../services/feedingService';
import { SleepService } from '../services/sleepService';
import { DiaperService } from '../services/diaperService';
import { PumpingService } from '../services/pumpingService';
import { GrowthService } from '../services/growthService';
import { exportAllData } from '../utils/exportUtils';
import { Colors, APP_CONFIG } from '../constants';

export const SettingsScreen: React.FC = () => {
  const { getCurrentBaby, babies } = useBabyStore();
  const currentBaby = getCurrentBaby();
  
  const [exporting, setExporting] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  
  const handleExportData = async (format: 'csv' | 'json') => {
    if (!currentBaby) {
      Alert.alert('提示', '请先选择一个宝宝');
      return;
    }
    
    Alert.alert(
      '导出数据',
      `确定要导出 ${currentBaby.name} 的所有数据吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: async () => {
            setExporting(true);
            try {
              // 获取所有数据
              const [feedings, sleeps, diapers, pumpings, growthRecords] = await Promise.all([
                FeedingService.getByBabyId(currentBaby.id),
                SleepService.getByBabyId(currentBaby.id),
                DiaperService.getByBabyId(currentBaby.id),
                PumpingService.getByBabyId(currentBaby.id),
                GrowthService.getGrowthRecords(currentBaby.id),
              ]);
              
              await exportAllData(
                {
                  baby: currentBaby,
                  feedings,
                  sleeps,
                  diapers,
                  pumpings,
                  growthRecords,
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
          },
        },
      ]
    );
  };
  
  const handleClearData = () => {
    Alert.alert(
      '清空数据',
      '⚠️ 此操作将删除所有记录，且无法恢复！确定要继续吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: () => {
            Alert.alert('提示', '数据清空功能开发中');
          },
        },
      ]
    );
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
            <TouchableOpacity style={styles.babyEditButton}>
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
              () => Alert.alert('提示', '报告功能已开发完成，请在统计页面查看')
            )}
            {renderSettingItem(
              'download-outline',
              '导出数据 (JSON)',
              '导出所有记录为JSON格式',
              () => handleExportData('json'),
              exporting ? <ActivityIndicator size="small" color={Colors.primary} /> : null
            )}
            {renderSettingItem(
              'document-text-outline',
              '导出数据 (CSV)',
              '导出所有记录为CSV格式',
              () => handleExportData('csv'),
              exporting ? <ActivityIndicator size="small" color={Colors.primary} /> : null
            )}
            {renderSettingItem(
              'cloud-upload-outline',
              '备份数据',
              '备份到云端（开发中）',
              () => Alert.alert('提示', '云端备份功能开发中')
            )}
            {renderSettingItem(
              'cloud-download-outline',
              '恢复数据',
              '从云端恢复（开发中）',
              () => Alert.alert('提示', '云端恢复功能开发中')
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
              'moon-outline',
              '深色模式',
              '开发中',
              undefined,
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: '#E5E5EA', true: Colors.primary }}
                disabled
              />
            )}
            {renderSettingItem(
              'language-outline',
              '语言设置',
              '中文简体',
              () => Alert.alert('提示', '语言设置功能开发中')
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
              () => Alert.alert('提示', '宝宝管理功能开发中')
            )}
            {renderSettingItem(
              'add-circle-outline',
              '添加宝宝',
              '添加新的宝宝档案',
              () => Alert.alert('提示', '添加宝宝功能开发中')
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
              () => Alert.alert('隐私政策', '您的数据安全是我们的首要任务')
            )}
            {renderSettingItem(
              'document-text-outline',
              '使用条款',
              '查看使用条款',
              () => Alert.alert('使用条款', '请遵守使用条款')
            )}
            {renderSettingItem(
              'help-circle-outline',
              '帮助与反馈',
              '获取帮助或提交反馈',
              () => Alert.alert('帮助', '如需帮助，请联系我们')
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
          <Text style={styles.footerText}>Made with ❤️ for parents</Text>
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
});
