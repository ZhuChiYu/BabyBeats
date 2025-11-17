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

interface PrivacyPolicyScreenProps {
  navigation: any;
}

export const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ navigation }) => {

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>隐私政策</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. 信息收集</Text>
          <Text style={styles.text}>
            BabyBeats 是一款本地数据存储应用。所有您的宝宝记录数据都存储在您的设备上，我们不会收集、上传或共享您的个人信息和宝宝数据。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. 数据存储</Text>
          <Text style={styles.text}>
            • 所有数据使用 SQLite 本地数据库存储在您的设备上{'\n'}
            • 数据不会自动上传到云端服务器{'\n'}
            • 您可以随时导出和删除您的数据
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. 数据安全</Text>
          <Text style={styles.text}>
            我们采取合理的技术措施保护您的数据：{'\n'}
            • 数据仅存储在您的本地设备{'\n'}
            • 不会与第三方共享数据{'\n'}
            • 建议您定期备份数据
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. 权限使用</Text>
          <Text style={styles.text}>
            应用可能需要以下权限：{'\n'}
            • 存储权限：用于导出数据到本地文件{'\n'}
            • 通知权限：用于提醒功能（可选）{'\n'}
            • 相机/相册：用于添加宝宝照片（未来功能）
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. 儿童隐私</Text>
          <Text style={styles.text}>
            我们重视儿童隐私保护。本应用用于记录宝宝成长数据，所有数据仅供家长使用，不会向儿童展示任何广告或收集儿童的个人信息。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. 政策更新</Text>
          <Text style={styles.text}>
            我们可能会不定期更新隐私政策。更新后的政策将在应用内发布，重大变更会通过应用通知告知用户。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. 联系我们</Text>
          <Text style={styles.text}>
            如果您对我们的隐私政策有任何疑问或建议，请通过应用内的"帮助与反馈"功能联系我们。
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>最后更新：2024年11月</Text>
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
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: '#8E8E93',
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

