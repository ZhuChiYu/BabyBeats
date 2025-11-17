import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';

interface HelpScreenProps {
  navigation: any;
}

export const HelpScreen: React.FC<HelpScreenProps> = ({ navigation }) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) {
      Alert.alert('提示', '请输入您的反馈内容');
      return;
    }

    Alert.alert(
      '提交反馈',
      '确定要提交反馈吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: () => {
            setSubmitting(true);
            // TODO: 实现实际的反馈提交逻辑
            setTimeout(() => {
              setSubmitting(false);
              Alert.alert('感谢反馈', '我们会认真阅读您的建议并持续改进产品');
              setFeedbackText('');
              setContactEmail('');
            }, 1000);
          },
        },
      ]
    );
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('错误', '无法打开链接');
    });
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
        <Text style={styles.headerTitle}>帮助与反馈</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 常见问题 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>常见问题</Text>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Q: 如何添加新宝宝？</Text>
            <Text style={styles.faqAnswer}>
              进入"设置" → "宝宝管理" → 点击右上角"+"按钮即可添加新宝宝。
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Q: 如何切换宝宝？</Text>
            <Text style={styles.faqAnswer}>
              在首页顶部点击宝宝名称，即可在多个宝宝之间切换。
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Q: 数据会丢失吗？</Text>
            <Text style={styles.faqAnswer}>
              所有数据都存储在您的本地设备上。建议定期使用"导出数据"功能备份重要数据。
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Q: 如何导出数据？</Text>
            <Text style={styles.faqAnswer}>
              进入"设置" → "数据管理" → "导出数据"，可选择导出为 CSV 或 JSON 格式。
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Q: 如何编辑或删除记录？</Text>
            <Text style={styles.faqAnswer}>
              在"记录"页面中，点击记录可以编辑，点击右侧垃圾桶图标可以删除。
            </Text>
          </View>
        </View>

        {/* 功能说明 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>功能说明</Text>
          
          <View style={styles.featureItem}>
            <Ionicons name="nutrition" size={24} color={Colors.feeding} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>喂养记录</Text>
              <Text style={styles.featureDesc}>
                记录亲喂、瓶喂母乳和配方奶，追踪喂养时间和奶量
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="moon" size={24} color={Colors.sleep} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>睡眠记录</Text>
              <Text style={styles.featureDesc}>
                记录宝宝的睡眠时间和时长，区分白天小睡和夜间睡眠
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="water" size={24} color={Colors.diaper} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>尿布记录</Text>
              <Text style={styles.featureDesc}>
                记录换尿布时间，追踪大小便情况
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="flask" size={24} color={Colors.pumping} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>挤奶记录</Text>
              <Text style={styles.featureDesc}>
                记录挤奶时间、方式和奶量
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="stats-chart" size={24} color={Colors.growth} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>成长追踪</Text>
              <Text style={styles.featureDesc}>
                记录体重、身高、头围等成长数据，查看成长曲线
              </Text>
            </View>
          </View>
        </View>

        {/* 反馈表单 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>反馈与建议</Text>
          <Text style={styles.feedbackHint}>
            您的反馈对我们很重要，帮助我们改进产品
          </Text>
          
          <TextInput
            style={styles.feedbackInput}
            value={feedbackText}
            onChangeText={setFeedbackText}
            placeholder="请输入您的反馈、建议或遇到的问题..."
            placeholderTextColor="#C7C7CC"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <TextInput
            style={styles.contactInput}
            value={contactEmail}
            onChangeText={setContactEmail}
            placeholder="联系邮箱（选填）"
            placeholderTextColor="#C7C7CC"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.submitButton, (!feedbackText.trim() || submitting) && styles.submitButtonDisabled]}
            onPress={handleSubmitFeedback}
            disabled={!feedbackText.trim() || submitting}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? '提交中...' : '提交反馈'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 联系方式 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>联系我们</Text>
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => openLink('mailto:support@babybeats.app')}
          >
            <Ionicons name="mail-outline" size={20} color={Colors.primary} />
            <Text style={styles.contactText}>support@babybeats.app</Text>
          </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 20,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    color: '#8E8E93',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureText: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    lineHeight: 18,
    color: '#8E8E93',
  },
  feedbackHint: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 12,
  },
  feedbackInput: {
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#000000',
    minHeight: 120,
    marginBottom: 12,
  },
  contactInput: {
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#000000',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 8,
  },
});

