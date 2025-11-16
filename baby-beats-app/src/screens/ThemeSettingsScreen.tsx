import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeMode } from '../contexts/ThemeContext';

interface ThemeSettingsScreenProps {
  navigation: any;
}

export const ThemeSettingsScreen: React.FC<ThemeSettingsScreenProps> = ({ navigation }) => {
  const { theme, themeMode, setThemeMode } = useTheme();

  const themeOptions: { value: ThemeMode; label: string; icon: string; description: string }[] = [
    { value: 'light', label: '浅色模式', icon: 'sunny', description: '始终使用浅色主题' },
    { value: 'dark', label: '深色模式', icon: 'moon', description: '始终使用深色主题' },
    { value: 'auto', label: '跟随系统', icon: 'phone-portrait', description: '跟随系统设置自动切换' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>深色模式</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          {themeOptions.map((option, index) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionItem,
                index !== themeOptions.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
              ]}
              onPress={() => setThemeMode(option.value)}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
                <Ionicons name={option.icon as any} size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                  {option.label}
                </Text>
                <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                  {option.description}
                </Text>
              </View>
              {themeMode === option.value && (
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.infoCard, { backgroundColor: `${theme.colors.info}15` }]}>
          <Ionicons name="information-circle-outline" size={20} color={theme.colors.info} />
          <Text style={[styles.infoText, { color: theme.colors.text }]}>
            深色模式可以减少屏幕亮度，保护眼睛，尤其在夜间使用时更加舒适。选择"跟随系统"将根据您的设备设置自动切换。
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  card: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
  },
  infoCard: {
    flexDirection: 'row',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});

