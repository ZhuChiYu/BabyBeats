import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';

interface TermsScreenProps {
  navigation: any;
}

export const TermsScreen: React.FC<TermsScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>使用条款</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. 服务说明</Text>
          <Text style={styles.text}>
            BabyBeats 是一款婴儿成长记录应用，为用户提供：{'\n'}
            • 喂养、睡眠、尿布、挤奶等日常记录{'\n'}
            • 成长数据追踪和图表分析{'\n'}
            • 数据导出和备份功能{'\n'}
            • 本地数据存储，保护隐私
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. 用户责任</Text>
          <Text style={styles.text}>
            使用本应用时，您需要：{'\n'}
            • 提供真实准确的宝宝信息{'\n'}
            • 合理使用应用功能{'\n'}
            • 不得用于非法目的{'\n'}
            • 定期备份重要数据
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. 免责声明</Text>
          <Text style={styles.text}>
            • 本应用仅作为记录工具，不提供医疗建议{'\n'}
            • 关于宝宝健康问题，请咨询专业医生{'\n'}
            • 我们不对因使用应用导致的数据丢失负责{'\n'}
            • 建议定期导出和备份您的数据
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. 知识产权</Text>
          <Text style={styles.text}>
            本应用的所有内容，包括但不限于文字、图形、界面设计、代码等，均受著作权法保护。未经许可，不得复制、修改或用于商业用途。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. 服务变更</Text>
          <Text style={styles.text}>
            我们保留随时修改或中止服务的权利，恕不另行通知。我们会在应用内发布重大变更通知。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. 适用法律</Text>
          <Text style={styles.text}>
            本条款适用中华人民共和国法律。因使用本应用引起的争议，双方应友好协商解决。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. 联系方式</Text>
          <Text style={styles.text}>
            如对本条款有任何疑问，请通过应用内"帮助与反馈"功能联系我们。
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>生效日期：2024年11月</Text>
          <Text style={styles.footerText}>BabyBeats v1.0.0</Text>
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
    color: '#000',
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
    color: '#000',
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: '#3C3C43',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#8E8E93',
    marginVertical: 4,
  },
});

