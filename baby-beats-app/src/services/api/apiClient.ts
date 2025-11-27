// API 客户端配置
// 
// 🔧 网络配置说明：
// - iOS 模拟器：使用 localhost
// - Android 模拟器：使用 10.0.2.2 (Android 模拟器的特殊 IP)
// - 真机调试：使用本机的局域网 IP 地址
//
// 如何获取本机 IP：
// macOS/Linux: ifconfig | grep "inet " | grep -v 127.0.0.1
// Windows: ipconfig

import { Platform } from 'react-native';

// 根据平台和运行环境选择正确的 API URL
const getApiUrl = () => {
  // 生产环境 - 使用腾讯云服务器
  if (!__DEV__) {
    // 方式1: 使用域名（推荐，需要配置 Nginx）
    return 'https://englishpartner.cn/api/v1';
    
    // 方式2: 直接使用 IP 和端口
    // return 'http://111.230.110.95:3000/api/v1';
  }

  // 开发环境
  // ⚠️ 重要提示：
  // - Docker 容器在 macOS 上运行时，iOS 模拟器无法通过 localhost 访问
  // - 必须使用局域网 IP 地址（如 192.168.x.x）
  // - Android 模拟器可以使用 10.0.2.2 访问主机的 localhost
  
  // 开发环境可以选择：
  // 1. 本地开发服务器
  // 2. 腾讯云测试服务器
  
  // 使用本地开发服务器
  if (Platform.OS === 'android') {
    // Android 模拟器使用特殊 IP 10.0.2.2 访问主机
    return 'http://10.0.2.2:3000/api/v1';
  } else {
    // iOS 模拟器 & 真机都使用局域网 IP
    // 如果后端在 Docker 中运行，localhost 不可用
    return 'http://192.168.31.221:3000/api/v1';
  }
  
  // 或者开发环境也使用腾讯云服务器（取消下面的注释）
  // return 'http://111.230.110.95:3000/api/v1';
};

export const API_BASE_URL = getApiUrl();

// 启动时打印 API URL，方便调试
console.log('📍 API Base URL:', API_BASE_URL);

export interface ApiResponse<T = any> {
  status: string;
  data?: T;
  message?: string;
  errors?: any[];
}

export class ApiError extends Error {
  statusCode: number;
  errors?: any[];

  constructor(message: string, statusCode: number, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;

  console.log('🌐 API Request:', {
    method: options.method || 'GET',
    url,
    hasAuth: !!authToken,
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    console.log('📡 发送请求到:', url);
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('📥 收到响应:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      console.error('❌ API 错误:', data);
      throw new ApiError(
        data.message || 'Request failed',
        response.status,
        data.errors
      );
    }

    console.log('✅ API 请求成功');
    return data.data as T;
  } catch (error) {
    console.error('❌ API 请求失败:', error);
    console.error('请求 URL:', url);
    console.error('错误类型:', error instanceof Error ? error.constructor.name : typeof error);
    
    if (error instanceof ApiError) {
      throw error;
    }

    // 网络错误详细信息
    if (error instanceof TypeError) {
      console.error('⚠️ 这是一个 TypeError，通常意味着网络连接问题');
      console.error('错误信息:', error.message);
      
      throw new ApiError(
        `网络连接失败，请检查：\n1. 设备是否连接到 WiFi\n2. 后端服务器是否运行\n3. IP 地址是否正确: ${API_BASE_URL}\n\n原始错误: ${error.message}`,
        0
      );
    }

    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
};

export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

