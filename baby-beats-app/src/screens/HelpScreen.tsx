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
              在各个列表页面中，直接点击记录条目即可进入编辑页面。编辑页面中可以修改信息或删除记录。
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Q: 如何设置疫苗和用药提醒？</Text>
            <Text style={styles.faqAnswer}>
              添加疫苗时设置"下次接种日期"，添加用药时设置"用药频次"，系统会自动发送通知提醒。首次使用需授权通知权限。
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Q: 成长数据如何查看趋势？</Text>
            <Text style={styles.faqAnswer}>
              在"成长"页面可以切换查看体重、身高、头围的成长曲线图，点击历史记录可以编辑或删除。
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Q: 如何记录宝宝的里程碑？</Text>
            <Text style={styles.faqAnswer}>
              在"成长"页面顶部点击"成长里程碑"，可以选择预设的60+里程碑或自定义添加，支持上传照片记录珍贵瞬间。
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Q: 可以同时管理多个宝宝吗？</Text>
            <Text style={styles.faqAnswer}>
              可以。点击首页左上角宝宝名称即可快速切换，也可以通过"设置" → "宝宝管理"添加或管理多个宝宝。
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
                记录体重、身高、头围等成长数据，查看成长曲线，支持编辑删除
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="medical" size={24} color="#FF6B6B" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>健康管理</Text>
              <Text style={styles.featureDesc}>
                体温记录、疫苗接种、用药管理、就医记录，一站式健康管理
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="thermometer" size={24} color="#E74C3C" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>体温监测</Text>
              <Text style={styles.featureDesc}>
                支持腋温、口温、耳温、额温等多种测量方式，趋势图展示
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="shield-checkmark" size={24} color="#5AC8FA" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>疫苗管理</Text>
              <Text style={styles.featureDesc}>
                15种预设疫苗，自动提醒接种时间，记录接种医院和批次
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="medkit" size={24} color="#FF9500" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>用药记录</Text>
              <Text style={styles.featureDesc}>
                智能频次解析（每天3次、每8小时等），多次提醒，记录用药明细
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="fitness" size={24} color="#3498DB" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>就医记录</Text>
              <Text style={styles.featureDesc}>
                15个科室、18种症状，记录诊断和处方，历史就医查询
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="star" size={24} color="#FFD60A" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>成长里程碑</Text>
              <Text style={styles.featureDesc}>
                8大类60+预设里程碑（第一次笑、第一次翻身等），支持照片上传
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="analytics" size={24} color="#007AFF" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>数据统计</Text>
              <Text style={styles.featureDesc}>
                7天/14天/30天/3个月统计，图表展示，实时刷新
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="share" size={24} color="#5856D6" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>数据导出</Text>
              <Text style={styles.featureDesc}>
                支持10种数据类型导出为CSV/JSON格式，方便备份和分享
              </Text>
            </View>
          </View>
        </View>

        {/* 使用技巧 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>使用技巧</Text>
          
          <View style={styles.tipItem}>
            <View style={styles.tipIcon}>
              <Ionicons name="bulb" size={20} color="#FFD60A" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>快速添加记录</Text>
              <Text style={styles.tipDesc}>
                首页快捷按钮可快速添加常用记录，长按可选择更多类型
              </Text>
            </View>
          </View>

          <View style={styles.tipItem}>
            <View style={styles.tipIcon}>
              <Ionicons name="bulb" size={20} color="#FFD60A" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>中文月份显示</Text>
              <Text style={styles.tipDesc}>
                所有日期时间选择器都使用中文显示，更符合使用习惯
              </Text>
            </View>
          </View>

          <View style={styles.tipItem}>
            <View style={styles.tipIcon}>
              <Ionicons name="bulb" size={20} color="#FFD60A" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>下拉刷新</Text>
              <Text style={styles.tipDesc}>
                在首页下拉可以刷新所有数据，确保显示最新信息
              </Text>
            </View>
          </View>

          <View style={styles.tipItem}>
            <View style={styles.tipIcon}>
              <Ionicons name="bulb" size={20} color="#FFD60A" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>宝宝年龄显示</Text>
              <Text style={styles.tipDesc}>
                首页自动显示宝宝年龄：不到1月显示天数，1月-1年显示月天，1年以上显示年月天
              </Text>
            </View>
          </View>

          <View style={styles.tipItem}>
            <View style={styles.tipIcon}>
              <Ionicons name="bulb" size={20} color="#FFD60A" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>定期备份</Text>
              <Text style={styles.tipDesc}>
                建议每月使用"数据导出"功能备份宝宝数据，防止意外丢失
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
            onPress={() => openLink('mailto:zhu.cy@outlook.com')}
          >
            <Ionicons name="mail-outline" size={20} color={Colors.primary} />
            <Text style={styles.contactText}>zhu.cy@outlook.com</Text>
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
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF9E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  tipDesc: {
    fontSize: 12,
    lineHeight: 18,
    color: '#8E8E93',
  },
});

