import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

interface FontSizeSettingsScreenProps {
  navigation: any;
}

export const FontSizeSettingsScreen: React.FC<FontSizeSettingsScreenProps> = ({ navigation }) => {
  const [fontSize, setFontSize] = useState(16); // 默认标准字体大小

  const fontSizeLabels = [
    { value: 14, label: '小' },
    { value: 16, label: '标准' },
    { value: 18, label: '大' },
    { value: 20, label: '特大' },
  ];

  const getFontSizeLabel = () => {
    if (fontSize <= 14) return '小';
    if (fontSize <= 16) return '标准';
    if (fontSize <= 18) return '大';
    return '特大';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>文字大小</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content}>
        {/* 预览区域 */}
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>预览</Text>
          <View style={styles.previewCard}>
            <Text style={[styles.previewTitle, { fontSize: fontSize + 4 }]}>
              标题文字预览
            </Text>
            <Text style={[styles.previewText, { fontSize }]}>
              这是正文文字的预览效果，您可以通过下方的滑块来调整文字大小，以获得最舒适的阅读体验。
            </Text>
            <Text style={[styles.previewSmall, { fontSize: fontSize - 2 }]}>
              这是小号文字的预览效果
            </Text>
          </View>
        </View>

        {/* 滑块控制区域 */}
        <View style={styles.controlSection}>
          <Text style={styles.sectionTitle}>调整大小</Text>
          <View style={styles.sliderCard}>
            <View style={styles.currentSizeRow}>
              <Text style={styles.currentSizeLabel}>当前大小</Text>
              <Text style={styles.currentSizeValue}>{getFontSizeLabel()}</Text>
            </View>

            <View style={styles.sliderContainer}>
              <Ionicons name="text-outline" size={20} color="#8E8E93" />
              <Slider
                style={styles.slider}
                minimumValue={12}
                maximumValue={22}
                step={1}
                value={fontSize}
                onValueChange={setFontSize}
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="#E5E5EA"
                thumbTintColor="#007AFF"
              />
              <Ionicons name="text" size={32} color="#8E8E93" />
            </View>

            <View style={styles.labelsRow}>
              {fontSizeLabels.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.labelButton}
                  onPress={() => setFontSize(item.value)}
                >
                  <Text
                    style={[
                      styles.labelText,
                      fontSize === item.value && styles.labelTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* 说明 */}
        <View style={styles.noteSection}>
          <View style={styles.noteCard}>
            <Ionicons name="information-circle-outline" size={20} color="#8E8E93" />
            <Text style={styles.noteText}>
              文字大小设置将应用到整个应用。选择适合您的文字大小，以获得最佳的阅读体验。
            </Text>
          </View>
        </View>

        {/* 推荐设置 */}
        <View style={styles.recommendSection}>
          <Text style={styles.sectionTitle}>推荐设置</Text>
          {[
            { size: 14, label: '小', desc: '适合视力较好的用户' },
            { size: 16, label: '标准', desc: '推荐大多数用户使用' },
            { size: 18, label: '大', desc: '适合需要更清晰文字的用户' },
            { size: 20, label: '特大', desc: '适合视力不佳或老年用户' },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.recommendCard,
                fontSize === item.size && styles.recommendCardActive,
              ]}
              onPress={() => setFontSize(item.size)}
            >
              <View style={styles.recommendLeft}>
                <Text
                  style={[
                    styles.recommendLabel,
                    fontSize === item.size && styles.recommendLabelActive,
                  ]}
                >
                  {item.label}
                </Text>
                <Text style={styles.recommendDesc}>{item.desc}</Text>
              </View>
              {fontSize === item.size && (
                <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
              )}
            </TouchableOpacity>
          ))}
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
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 1,
  },
  previewSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  previewTitle: {
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  previewText: {
    color: '#000',
    lineHeight: 24,
    marginBottom: 12,
  },
  previewSmall: {
    color: '#8E8E93',
  },
  controlSection: {
    padding: 16,
    paddingTop: 0,
  },
  sliderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  currentSizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  currentSizeLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  currentSizeValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  slider: {
    flex: 1,
    marginHorizontal: 12,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  labelText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  labelTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  noteSection: {
    padding: 16,
    paddingTop: 0,
  },
  noteCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noteText: {
    fontSize: 14,
    color: '#8E8E93',
    flex: 1,
    marginLeft: 12,
    lineHeight: 20,
  },
  recommendSection: {
    padding: 16,
    paddingTop: 0,
  },
  recommendCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  recommendCardActive: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F9FF',
  },
  recommendLeft: {
    flex: 1,
  },
  recommendLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  recommendLabelActive: {
    color: '#007AFF',
  },
  recommendDesc: {
    fontSize: 14,
    color: '#8E8E93',
  },
});

