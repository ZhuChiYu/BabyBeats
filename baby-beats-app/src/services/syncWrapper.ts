import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api/apiClient';

/**
 * 同步包装器 - 同时写入本地数据库和服务器
 * 策略：本地优先，后台同步到服务器
 */

interface SyncConfig {
  enabled: boolean;
  autoSync: boolean;
}

let syncConfig: SyncConfig = {
  enabled: false,
  autoSync: false,
};

// 加载同步配置
export const loadSyncConfig = async () => {
  try {
    const configStr = await AsyncStorage.getItem('syncConfig');
    if (configStr) {
      const config = JSON.parse(configStr);
      syncConfig.enabled = config.isLoggedIn || false;
      syncConfig.autoSync = config.autoSync || false;
    }
    
    // 加载认证token
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      const { setAuthToken } = await import('./api/apiClient');
      setAuthToken(token);
    }
  } catch (error) {
    console.error('Failed to load sync config:', error);
  }
};

// 初始化时加载配置
loadSyncConfig();

/**
 * 检查是否应该同步
 */
const shouldSync = (): boolean => {
  return syncConfig.enabled && syncConfig.autoSync;
};

/**
 * 创建数据（本地 + 服务器）
 */
export async function createWithSync<T>(
  localCreate: () => Promise<T>,
  serverCreate?: () => Promise<any>,
  options?: { forceSync?: boolean }
): Promise<T> {
  // 1. 先创建本地数据
  const localResult = await localCreate();

  // 2. 如果启用同步，后台同步到服务器
  if ((shouldSync() || options?.forceSync) && serverCreate) {
    serverCreate().catch((error) => {
      console.warn('Server sync failed:', error);
      // 可以在这里添加同步失败队列，稍后重试
    });
  }

  return localResult;
}

/**
 * 更新数据（本地 + 服务器）
 */
export async function updateWithSync<T>(
  localUpdate: () => Promise<T>,
  serverUpdate?: () => Promise<any>,
  options?: { forceSync?: boolean }
): Promise<T> {
  // 1. 先更新本地数据
  const localResult = await localUpdate();

  // 2. 如果启用同步，后台同步到服务器
  if ((shouldSync() || options?.forceSync) && serverUpdate) {
    serverUpdate().catch((error) => {
      console.warn('Server sync failed:', error);
    });
  }

  return localResult;
}

/**
 * 删除数据（本地 + 服务器）
 */
export async function deleteWithSync(
  localDelete: () => Promise<void>,
  serverDelete?: () => Promise<any>,
  options?: { forceSync?: boolean }
): Promise<void> {
  // 1. 先删除本地数据
  await localDelete();

  // 2. 如果启用同步，后台同步到服务器
  if ((shouldSync() || options?.forceSync) && serverDelete) {
    serverDelete().catch((error) => {
      console.warn('Server sync failed:', error);
    });
  }
}

/**
 * 从服务器拉取数据
 */
export async function pullFromServer<T>(
  serverFetch: () => Promise<T>,
  localUpdate: (data: T) => Promise<void>
): Promise<T> {
  try {
    // 1. 从服务器获取数据
    const serverData = await serverFetch();

    // 2. 更新本地数据库
    await localUpdate(serverData);

    return serverData;
  } catch (error) {
    console.error('Failed to pull from server:', error);
    throw error;
  }
}

/**
 * 重新加载同步配置
 */
export const reloadSyncConfig = async () => {
  await loadSyncConfig();
};

