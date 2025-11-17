import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Vaccine, Medication } from '../types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 配置通知行为
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  /**
   * 请求通知权限
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('通知权限未授予');
        return false;
      }

      // iOS 需要额外配置
      if (Platform.OS === 'ios') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return true;
    } catch (error) {
      console.error('请求通知权限失败:', error);
      return false;
    }
  }

  /**
   * 取消所有通知
   */
  static async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * 取消特定通知
   */
  static async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  /**
   * 为疫苗设置提醒
   * 在接种日期前7天提醒
   */
  static async scheduleVaccineReminder(vaccine: Vaccine, babyName: string): Promise<string | null> {
    if (!vaccine.reminderEnabled || !vaccine.nextDate) {
      return null;
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('没有通知权限，无法设置提醒');
        return null;
      }

      const nextDate = new Date(vaccine.nextDate);
      const reminderDate = new Date(nextDate);
      reminderDate.setDate(reminderDate.getDate() - 7); // 提前7天

      // 如果提醒日期已过，则不设置
      if (reminderDate <= new Date()) {
        console.log('提醒日期已过，不设置提醒');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💉 疫苗接种提醒',
          body: `${babyName}的${vaccine.vaccineName}将在${format(nextDate, 'MM月dd日', { locale: zhCN })}接种，请提前安排时间。`,
          data: {
            type: 'vaccine',
            vaccineId: vaccine.id,
            babyName,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          date: reminderDate,
        },
      });

      console.log(`疫苗提醒已设置: ${notificationId}，提醒时间: ${reminderDate}`);
      return notificationId;
    } catch (error) {
      console.error('设置疫苗提醒失败:', error);
      return null;
    }
  }

  /**
   * 为用药设置提醒
   * 根据用药频次设置多个提醒
   */
  static async scheduleMedicationReminders(
    medication: Medication,
    babyName: string
  ): Promise<string[]> {
    if (!medication.frequency || !medication.startDate) {
      return [];
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('没有通知权限，无法设置提醒');
        return [];
      }

      const notificationIds: string[] = [];
      const startDate = new Date(medication.startDate);
      const endDate = medication.endDate ? new Date(medication.endDate) : null;

      // 解析用药频次（简化处理）
      const timesPerDay = this.parseFrequency(medication.frequency);
      if (timesPerDay === 0) {
        return [];
      }

      // 默认提醒时间（可以根据用户设置调整）
      const defaultTimes = [
        { hour: 8, minute: 0 },   // 早上8点
        { hour: 14, minute: 0 },  // 下午2点
        { hour: 20, minute: 0 },  // 晚上8点
      ];

      const reminderTimes = defaultTimes.slice(0, timesPerDay);
      const now = new Date();

      // 设置未来7天的提醒（或到结束日期）
      for (let day = 0; day < 7; day++) {
        const reminderDate = new Date(startDate);
        reminderDate.setDate(reminderDate.getDate() + day);

        // 如果已经过了结束日期，停止
        if (endDate && reminderDate > endDate) {
          break;
        }

        // 如果日期已过，跳过
        if (reminderDate < now) {
          continue;
        }

        // 为每个时间点设置提醒
        for (const time of reminderTimes) {
          const notificationDate = new Date(reminderDate);
          notificationDate.setHours(time.hour, time.minute, 0, 0);

          // 如果时间已过，跳过
          if (notificationDate <= now) {
            continue;
          }

          const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: '💊 用药提醒',
              body: `${babyName}需要服用${medication.medicationName}，剂量：${medication.dosage}`,
              data: {
                type: 'medication',
                medicationId: medication.id,
                babyName,
              },
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: {
              date: notificationDate,
            },
          });

          notificationIds.push(notificationId);
        }
      }

      console.log(`用药提醒已设置: ${notificationIds.length}个提醒`);
      return notificationIds;
    } catch (error) {
      console.error('设置用药提醒失败:', error);
      return [];
    }
  }

  /**
   * 解析用药频次字符串
   * 返回每日用药次数
   */
  private static parseFrequency(frequency: string): number {
    const lowerFreq = frequency.toLowerCase();

    if (lowerFreq.includes('每日1次') || lowerFreq.includes('一天一次') || lowerFreq.includes('qd')) {
      return 1;
    } else if (lowerFreq.includes('每日2次') || lowerFreq.includes('一天两次') || lowerFreq.includes('bid')) {
      return 2;
    } else if (lowerFreq.includes('每日3次') || lowerFreq.includes('一天三次') || lowerFreq.includes('tid')) {
      return 3;
    } else if (lowerFreq.includes('每8小时') || lowerFreq.includes('q8h')) {
      return 3;
    } else if (lowerFreq.includes('每6小时') || lowerFreq.includes('q6h')) {
      return 4;
    }

    // 默认返回0，表示无法解析
    return 0;
  }

  /**
   * 设置每日用药打卡提醒
   */
  static async setDailyMedicationCheckReminder(
    time: { hour: number; minute: number },
    babyName: string
  ): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      // 设置重复的每日提醒
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '📋 用药打卡提醒',
          body: `请记录${babyName}今天的用药情况`,
          data: {
            type: 'daily_check',
            babyName,
          },
          sound: true,
        },
        trigger: {
          hour: time.hour,
          minute: time.minute,
          repeats: true,
        },
      });

      console.log(`每日用药打卡提醒已设置: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error('设置每日提醒失败:', error);
      return null;
    }
  }

  /**
   * 获取所有已计划的通知
   */
  static async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  /**
   * 立即发送测试通知
   */
  static async sendTestNotification(title: string, body: string): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('没有通知权限');
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: null, // 立即发送
      });
    } catch (error) {
      console.error('发送测试通知失败:', error);
      throw error;
    }
  }

  /**
   * 监听通知响应
   */
  static addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  /**
   * 监听前台通知
   */
  static addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  }
}

