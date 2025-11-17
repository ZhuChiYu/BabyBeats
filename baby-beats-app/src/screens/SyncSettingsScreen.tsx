import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useBabyStore } from '../store/babyStore';
import { FeedingService } from '../services/feedingService';
import { SleepService } from '../services/sleepService';
import { DiaperService } from '../services/diaperService';
import { PumpingService } from '../services/pumpingService';
import { GrowthService } from '../services/growthService';
import { BabyService } from '../services/babyService';
import { api, setAuthToken } from '../services/api/apiClient';
import { SyncApiService } from '../services/api/syncService';
import { syncManager } from '../services/syncManager';

interface SyncSettingsScreenProps {
  navigation: any;
}

interface SyncConfig {
  email: string;
  deviceId: string;
  lastSyncTime: number | null;
  autoSync: boolean;
  isLoggedIn: boolean;
}

export const SyncSettingsScreen: React.FC<SyncSettingsScreenProps> = ({ navigation }) => {
  const { babies, getCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncConfig, setSyncConfig] = useState<SyncConfig>({
    email: '',
    deviceId: '',
    lastSyncTime: null,
    autoSync: false,
    isLoggedIn: false,
  });

  useEffect(() => {
    loadSyncConfig();
    loadAuthToken();
  }, []);

  const loadAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        setAuthToken(token);
      }
    } catch (error) {
      console.error('Failed to load auth token:', error);
    }
  };

  const loadSyncConfig = async () => {
    try {
      const configStr = await AsyncStorage.getItem('syncConfig');
      if (configStr) {
        const config = JSON.parse(configStr);
        setSyncConfig(config);
        setEmail(config.email);
      }
    } catch (error) {
      console.error('Failed to load sync config:', error);
    }
  };

  const saveSyncConfig = async (config: Partial<SyncConfig>) => {
    try {
      const newConfig = { ...syncConfig, ...config };
      await AsyncStorage.setItem('syncConfig', JSON.stringify(newConfig));
      setSyncConfig(newConfig);
    } catch (error) {
      console.error('Failed to save sync config:', error);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('错误', '请输入邮箱和密码');
      return;
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('错误', '请输入有效的邮箱地址');
      return;
    }

    setLoading(true);
    try {
      // 调用后端登录接口
      const response = await api.post<{ token: string; user: any }>('/auth/login', {
        email: email.trim(),
        password,
      });

      // 保存认证信息
      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('userEmail', email.trim());
      
      // 设置 API 客户端的认证 token
      setAuthToken(response.token);

      // 更新同步配置
      await saveSyncConfig({
        email: email.trim(),
        isLoggedIn: true,
        deviceId: response.user.id || 'device-' + Date.now(),
      });

      // 重新加载同步管理器配置
      await syncManager.reloadConfig();

      // 登录成功后自动同步数据（先推送本地数据，再拉取服务器数据）
      Alert.alert(
        '登录成功',
        '是否立即同步数据？将会上传本地数据并获取服务器数据。',
        [
          { text: '稍后', style: 'cancel', onPress: () => setPassword('') },
          {
            text: '同步',
            onPress: async () => {
              try {
                setSyncing(true);
                console.log('开始登录后的初始同步...');
                
                // 先推送本地数据到服务器
                console.log('步骤1: 推送本地数据到服务器...');
                await syncManager.pushToServer();
                
                // 再从服务器拉取最新数据
                console.log('步骤2: 从服务器拉取数据...');
                await syncManager.pullFromServer();
                
                Alert.alert('成功', '数据同步完成！');
              } catch (error) {
                console.error('Auto sync failed:', error);
                Alert.alert('提示', '自动同步失败，可以稍后手动同步');
              } finally {
                setSyncing(false);
                setPassword('');
              }
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Login error:', error);
      
      // 如果是401错误，提示用户注册
      if (error.response?.status === 401) {
        Alert.alert(
          '登录失败',
          '账号或密码错误，是否要注册新账号？',
          [
            { text: '取消', style: 'cancel' },
            { text: '注册', onPress: handleRegister },
          ]
        );
      } else {
        Alert.alert('错误', '登录失败，请检查网络连接或稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('错误', '请输入邮箱和密码');
      return;
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('错误', '请输入有效的邮箱地址');
      return;
    }

    if (password.length < 6) {
      Alert.alert('错误', '密码长度至少6位');
      return;
    }

    setLoading(true);
    try {
      // 调用后端注册接口
      const response = await api.post<{ token: string; user: any }>('/auth/register', {
        email: email.trim(),
        password,
        name: '用户',
      });

      // 保存认证信息
      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('userEmail', email.trim());
      
      // 设置 API 客户端的认证 token
      setAuthToken(response.token);

      // 更新同步配置
      await saveSyncConfig({
        email: email.trim(),
        isLoggedIn: true,
        deviceId: response.user.id || 'device-' + Date.now(),
      });

      // 重新加载同步管理器配置
      await syncManager.reloadConfig();

      // 注册成功后询问是否同步本地数据到服务器
      Alert.alert(
        '注册成功',
        '是否立即同步数据？将会上传本地数据并获取服务器数据。',
        [
          { text: '稍后', style: 'cancel', onPress: () => setPassword('') },
          {
            text: '同步',
            onPress: async () => {
              try {
                setSyncing(true);
                console.log('开始注册后的初始同步...');
                
                // 先推送本地数据到服务器
                console.log('步骤1: 推送本地数据到服务器...');
                await syncManager.pushToServer();
                
                // 再从服务器拉取最新数据（可能有其他设备的数据）
                console.log('步骤2: 从服务器拉取数据...');
                await syncManager.pullFromServer();
                
                Alert.alert('成功', '数据同步完成！');
              } catch (error) {
                console.error('Auto sync failed:', error);
                Alert.alert('提示', '自动同步失败，可以稍后手动同步');
              } finally {
                setSyncing(false);
                setPassword('');
              }
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Register error:', error);
      Alert.alert('错误', error.response?.data?.error || '注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      '退出登录',
      '退出后将无法同步数据，确定要退出吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('userEmail');
            
            // 清除 API 客户端的认证 token
            setAuthToken(null);
            
            await saveSyncConfig({
              isLoggedIn: false,
              email: '',
              lastSyncTime: null,
            });
            setEmail('');
            setPassword('');
          },
        },
      ]
    );
  };

  const handleSync = async () => {
    if (!syncConfig.isLoggedIn) {
      Alert.alert('提示', '请先登录');
      return;
    }

    Alert.alert(
      '同步数据',
      '将会把本地数据同步到云端，并拉取最新的云端数据。确定要同步吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '同步',
          onPress: async () => {
            setSyncing(true);
            try {
              // 先推送本地数据到服务器
              await syncManager.pushToServer();
              
              // 再从服务器拉取最新数据
              await syncManager.pullFromServer();

              // 更新同步时间
              await saveSyncConfig({
                lastSyncTime: Date.now(),
              });

              Alert.alert('成功', '数据同步成功！');
            } catch (error: any) {
              console.error('Sync error:', error);
              Alert.alert('错误', error.response?.data?.error || '同步失败，请检查网络连接');
            } finally {
              setSyncing(false);
            }
          },
        },
      ]
    );
  };

  const collectLocalData = async () => {
    const data: any[] = [];

    // 收集所有宝宝的数据
    for (const baby of babies) {
      const [feedings, sleeps, diapers, pumpings, growthRecords] = await Promise.all([
        FeedingService.getByBabyId(baby.id),
        SleepService.getByBabyId(baby.id),
        DiaperService.getByBabyId(baby.id),
        PumpingService.getByBabyId(baby.id),
        GrowthService.getByBabyId(baby.id),
      ]);

      data.push(
        { tableName: 'babies', records: [baby] },
        { tableName: 'feedings', records: feedings },
        { tableName: 'sleeps', records: sleeps },
        { tableName: 'diapers', records: diapers },
        { tableName: 'pumpings', records: pumpings },
        { tableName: 'growth_records', records: growthRecords }
      );
    }

    return data;
  };

  const updateLocalData = async (pullResult: any) => {
    // 这里应该实现将服务器数据更新到本地数据库的逻辑
    // 由于涉及数据冲突解决等复杂逻辑，这里只是示例
    console.log('Updating local data with:', pullResult);
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
        <Text style={styles.headerTitle}>数据同步</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 登录状态 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cloud-outline" size={24} color={Colors.primary} />
            <Text style={styles.cardTitle}>同步账号</Text>
          </View>

          {syncConfig.isLoggedIn ? (
            <>
              <View style={styles.loginInfo}>
                <View style={styles.loginInfoRow}>
                  <Ionicons name="mail-outline" size={20} color="#8E8E93" />
                  <Text style={styles.loginInfoText}>{syncConfig.email}</Text>
                </View>
                <View style={styles.loginInfoRow}>
                  <Ionicons name="phone-portrait-outline" size={20} color="#8E8E93" />
                  <Text style={styles.loginInfoText}>设备 ID: {syncConfig.deviceId.substring(0, 16)}...</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutButtonText}>退出登录</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>邮箱</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="输入邮箱"
                  placeholderTextColor="#C7C7CC"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>密码</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="输入密码"
                  placeholderTextColor="#C7C7CC"
                  secureTextEntry
                  editable={!loading}
                />
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.registerButton]}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <Text style={styles.registerButtonText}>注册</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.loginButton]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.loginButtonText}>登录</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* 同步设置 */}
        {syncConfig.isLoggedIn && (
          <>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="sync-outline" size={24} color={Colors.primary} />
                <Text style={styles.cardTitle}>同步设置</Text>
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingTitle}>自动同步</Text>
                  <Text style={styles.settingDescription}>
                    在有网络时自动同步数据
                  </Text>
                </View>
                <Switch
                  value={syncConfig.autoSync}
                  onValueChange={(value) => saveSyncConfig({ autoSync: value })}
                  trackColor={{ false: '#E5E5EA', true: Colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {syncConfig.lastSyncTime && (
                <View style={styles.syncInfo}>
                  <Ionicons name="time-outline" size={16} color="#8E8E93" />
                  <Text style={styles.syncInfoText}>
                    上次同步: {format(new Date(syncConfig.lastSyncTime), 'yyyy/MM/dd HH:mm', { locale: zhCN })}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.card}>
              <TouchableOpacity
                style={styles.syncButton}
                onPress={handleSync}
                disabled={syncing}
              >
                {syncing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.syncButtonText}>立即同步</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* 统计信息 */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="stats-chart-outline" size={24} color={Colors.primary} />
                <Text style={styles.cardTitle}>错误统计</Text>
              </View>
              <Text style={styles.statsText}>同步错误次数: 0</Text>
            </View>
          </>
        )}

        {/* 说明 */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            数据同步功能可以让您在多个设备间共享宝宝的记录。请使用邮箱和密码登录或注册账号，然后点击"立即同步"开始同步数据。
          </Text>
        </View>

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
    alignItems: 'center',
    justifyContent: 'space-between',
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
    color: '#000000',
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000000',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButton: {
    backgroundColor: '#F5F5F7',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  loginButton: {
    backgroundColor: Colors.primary,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loginInfo: {
    marginBottom: 16,
  },
  loginInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  loginInfoText: {
    fontSize: 15,
    color: '#8E8E93',
    marginLeft: 12,
  },
  logoutButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#FF3B30',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLeft: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  syncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F7',
  },
  syncInfoText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  syncButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsText: {
    fontSize: 15,
    color: '#8E8E93',
    paddingVertical: 8,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
});

