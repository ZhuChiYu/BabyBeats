/**
 * 生长评估结果卡片组件
 * 显示百分位评估结果和建议
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GrowthAssessment } from '../constants/growthStandards';

interface AssessmentCardProps {
  assessment: GrowthAssessment;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export const AssessmentCard: React.FC<AssessmentCardProps> = ({
  assessment,
  title,
  icon,
}) => {
  const { result, suggestions } = assessment;

  // 根据状态选择颜色和图标
  const getStatusConfig = () => {
    switch (result.status) {
      case 'low':
        return {
          color: '#FF9500',
          bgColor: '#FFF3E0',
          statusIcon: 'arrow-down-circle' as keyof typeof Ionicons.glyphMap,
          statusText: '偏低',
        };
      case 'high':
        return {
          color: '#FF9500',
          bgColor: '#FFF3E0',
          statusIcon: 'arrow-up-circle' as keyof typeof Ionicons.glyphMap,
          statusText: '偏高',
        };
      case 'normal':
        return {
          color: '#34C759',
          bgColor: '#E8F5E9',
          statusIcon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
          statusText: '正常',
        };
      default:
        return {
          color: '#8E8E93',
          bgColor: '#F5F5F7',
          statusIcon: 'help-circle' as keyof typeof Ionicons.glyphMap,
          statusText: '未知',
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <View style={styles.container}>
      {/* 标题行 */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name={icon} size={24} color="#007AFF" />
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
          <Ionicons name={statusConfig.statusIcon} size={16} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.statusText}
          </Text>
        </View>
      </View>

      {/* 数值和百分位 */}
      <View style={styles.valueContainer}>
        <View style={styles.valueRow}>
          <Text style={styles.valueLabel}>测量值</Text>
          <Text style={styles.value}>{result.value.toFixed(1)}</Text>
        </View>
        <View style={styles.valueRow}>
          <Text style={styles.valueLabel}>百分位</Text>
          <Text style={[styles.percentile, { color: statusConfig.color }]}>
            P{Math.round(result.percentile)}
          </Text>
        </View>
      </View>

      {/* 描述 */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>{result.description}</Text>
      </View>

      {/* 建议 */}
      {suggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>💡 建议</Text>
          {suggestions.map((suggestion, index) => (
            <View key={index} style={styles.suggestionRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.suggestion}>{suggestion}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F5F5F7',
  },
  valueRow: {
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  percentile: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  descriptionContainer: {
    paddingVertical: 12,
  },
  description: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  suggestionsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F7',
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  suggestionRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  bullet: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 8,
    marginTop: 1,
  },
  suggestion: {
    flex: 1,
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
});



