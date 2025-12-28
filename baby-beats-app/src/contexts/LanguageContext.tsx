import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

export type Language = 'zh' | 'en';

interface Translations {
  [key: string]: {
    zh: string;
    en: string;
  };
}

const translations: Translations = {
  // 通用
  'common.save': { zh: '保存', en: 'Save' },
  'common.cancel': { zh: '取消', en: 'Cancel' },
  'common.delete': { zh: '删除', en: 'Delete' },
  'common.edit': { zh: '编辑', en: 'Edit' },
  'common.confirm': { zh: '确定', en: 'Confirm' },
  'common.loading': { zh: '加载中...', en: 'Loading...' },
  'common.success': { zh: '成功', en: 'Success' },
  'common.error': { zh: '错误', en: 'Error' },
  
  // 底部导航
  'tab.today': { zh: '今天', en: 'Today' },
  'tab.log': { zh: '记录', en: 'Log' },
  'tab.growth': { zh: '成长', en: 'Growth' },
  'tab.stats': { zh: '统计', en: 'Stats' },
  'tab.settings': { zh: '设置', en: 'Settings' },
  
  // 首页
  'today.title': { zh: '今天', en: 'Today' },
  'today.feeding': { zh: '喂养', en: 'Feeding' },
  'today.sleep': { zh: '睡眠', en: 'Sleep' },
  'today.diaper': { zh: '尿布', en: 'Diaper' },
  'today.pumping': { zh: '挤奶', en: 'Pumping' },
  
  // 记录类型
  'record.feeding': { zh: '喂养', en: 'Feeding' },
  'record.sleep': { zh: '睡眠', en: 'Sleep' },
  'record.diaper': { zh: '尿布', en: 'Diaper' },
  'record.pumping': { zh: '挤奶', en: 'Pumping' },
  'record.growth': { zh: '成长', en: 'Growth' },
  
  // 设置
  'settings.title': { zh: '设置', en: 'Settings' },
  'settings.dataManagement': { zh: '数据管理', en: 'Data Management' },
  'settings.appSettings': { zh: '应用设置', en: 'App Settings' },
  'settings.darkMode': { zh: '深色模式', en: 'Dark Mode' },
  'settings.language': { zh: '语言设置', en: 'Language' },
  'settings.sync': { zh: '数据同步', en: 'Data Sync' },
  'settings.exportData': { zh: '导出数据', en: 'Export Data' },
  
  // 深色模式
  'theme.light': { zh: '浅色', en: 'Light' },
  'theme.dark': { zh: '深色', en: 'Dark' },
  'theme.auto': { zh: '跟随系统', en: 'Auto' },
  
  // 语言
  'language.chinese': { zh: '中文简体', en: 'Simplified Chinese' },
  'language.english': { zh: 'English', en: 'English' },
  
  // 宝宝信息
  'baby.name': { zh: '宝宝姓名', en: 'Baby Name' },
  'baby.gender': { zh: '性别', en: 'Gender' },
  'baby.birthday': { zh: '出生日期', en: 'Birthday' },
  'baby.male': { zh: '男孩', en: 'Boy' },
  'baby.female': { zh: '女孩', en: 'Girl' },
  'baby.unknown': { zh: '保密', en: 'Unknown' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('zh');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLang = await AsyncStorage.getItem('language');
      if (savedLang && (savedLang === 'zh' || savedLang === 'en')) {
        setLanguageState(savedLang as Language);
      } else {
        // 使用系统语言
        const locale = Localization.locale || Localization.getLocales()[0]?.languageCode || 'zh';
        const systemLang = locale.startsWith('zh') ? 'zh' : 'en';
        setLanguageState(systemLang);
      }
    } catch (error) {
      console.error('Failed to load language:', error);
      // 发生错误时默认使用中文
      setLanguageState('zh');
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem('language', lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation not found for key: ${key}`);
      return key;
    }
    return translation[language];
  };

  if (isLoading) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

