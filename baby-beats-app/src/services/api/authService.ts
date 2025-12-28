import { api, setAuthToken } from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const AuthApiService = {
  // 注册
  register: async (data: RegisterData): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/register', data);
    await AuthApiService.saveAuth(response);
    return response;
  },

  // 登录
  login: async (data: LoginData): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    await AuthApiService.saveAuth(response);
    return response;
  },

  // 获取用户信息
  getProfile: async (): Promise<User> => {
    const response = await api.get<{ user: User }>('/auth/profile');
    return response.user;
  },

  // 更新用户信息
  updateProfile: async (data: { name?: string }): Promise<User> => {
    const response = await api.put<{ user: User }>('/auth/profile', data);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));
    return response.user;
  },

  // 登出
  logout: async (): Promise<void> => {
    setAuthToken(null);
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  },

  // 保存认证信息
  saveAuth: async (response: LoginResponse): Promise<void> => {
    setAuthToken(response.token);
    await AsyncStorage.setItem(TOKEN_KEY, response.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));
  },

  // 恢复认证信息
  restoreAuth: async (): Promise<User | null> => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const userData = await AsyncStorage.getItem(USER_KEY);

      if (token && userData) {
        setAuthToken(token);
        return JSON.parse(userData);
      }

      return null;
    } catch (error) {
      console.error('Failed to restore auth:', error);
      return null;
    }
  },

  // 检查是否已登录
  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return !!token;
  },
};

