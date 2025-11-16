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
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage, Language } from '../contexts/LanguageContext';

interface LanguageSettingsScreenProps {
  navigation: any;
}

export const LanguageSettingsScreen: React.FC<LanguageSettingsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const languageOptions: { value: Language; label: string; nativeName: string }[] = [
    { value: 'zh', label: '中文简体', nativeName: '简体中文' },
    { value: 'en', label: 'English', nativeName: 'English' },
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>语言设置</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          {languageOptions.map((option, index) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionItem,
                index !== languageOptions.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
              ]}
              onPress={() => setLanguage(option.value)}
            >
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                  {option.label}
                </Text>
                <Text style={[styles.optionNativeName, { color: theme.colors.textSecondary }]}>
                  {option.nativeName}
                </Text>
              </View>
              {language === option.value && (
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.infoCard, { backgroundColor: `${theme.colors.info}15` }]}>
          <Ionicons name="information-circle-outline" size={20} color={theme.colors.info} />
          <Text style={[styles.infoText, { color: theme.colors.text }]}>
            更改语言后，应用界面将立即更新为所选语言。部分内容可能需要重新加载才能完全生效。
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionNativeName: {
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

