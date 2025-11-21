# 📱 通知提醒功能使用指南

## 概述

BabyBeats 应用现已集成智能通知提醒系统，帮助您及时管理宝宝的疫苗接种和用药计划。

---

## ✨ 功能特性

### 1. 疫苗接种提醒 💉
- **自动提醒**：在接种日期前7天自动推送通知
- **详细信息**：显示疫苗名称、接种日期和宝宝姓名
- **一键管理**：在添加疫苗时选择是否启用提醒

### 2. 用药提醒 💊
- **智能解析**：自动识别用药频次（每日1-3次）
- **多次提醒**：根据频次在固定时间点提醒
- **疗程管理**：自动计算用药周期内的所有提醒
- **默认时间**：
  - 每日1次：早上8:00
  - 每日2次：早上8:00、下午2:00
  - 每日3次：早上8:00、下午2:00、晚上8:00

### 3. 用药打卡提醒 📋
- **每日提醒**：在设定时间提醒记录用药情况
- **可自定义**：灵活设置提醒时间

---

## 🚀 快速开始

### 首次使用

1. **授予通知权限**
   - 首次添加带提醒的记录时，应用会自动请求通知权限
   - iOS：点击"允许"
   - Android：点击"允许"

2. **设置疫苗提醒**
   ```
   添加疫苗 → 填写信息 → 设置"下次接种日期" → 开启"提醒开关" → 保存
   ```

3. **设置用药提醒**
   ```
   添加用药 → 填写药品名称和剂量 → 填写"用药频次"（如：每日3次）→ 设置疗程 → 保存
   ```

---

## 📖 详细使用

### 疫苗提醒设置

**步骤：**
1. 进入健康Tab → 疫苗接种 → 添加疫苗
2. 选择疫苗名称（如：百白破疫苗）
3. 设置接种日期
4. **重要**：设置"下次接种日期"
5. 开启"到期提醒"开关
6. 保存

**通知内容：**
```
标题：💉 疫苗接种提醒
内容：宝宝的百白破疫苗将在12月15日接种，请提前安排时间。
提醒时间：接种日期前7天
```

### 用药提醒设置

**支持的频次格式：**
- "每日1次" / "一天一次" / "qd"
- "每日2次" / "一天两次" / "bid"
- "每日3次" / "一天三次" / "tid"
- "每8小时" / "q8h"
- "每6小时" / "q6h"

**步骤：**
1. 进入健康Tab → 用药记录 → 添加用药
2. 填写药品名称和剂量
3. **重要**：填写用药频次（如：每日3次）
4. 设置开始日期和结束日期
5. 保存

**通知内容：**
```
标题：💊 用药提醒
内容：宝宝需要服用布洛芬混悬液，剂量：5ml
提醒时间：根据频次自动设置
```

**提醒时间示例：**
- 每日3次：8:00、14:00、20:00
- 每日2次：8:00、20:00
- 每日1次：8:00

---

## ⚙️ 权限配置

### iOS 配置

应用已在 `app.json` 中配置：
```json
{
  "ios": {
    "infoPlist": {
      "UIBackgroundModes": ["fetch", "remote-notification"]
    }
  }
}
```

### Android 配置

应用已配置通知渠道：
```json
{
  "android": {
    "permissions": [
      "NOTIFICATIONS",
      "SCHEDULE_EXACT_ALARM"
    ]
  }
}
```

---

## 🔧 通知管理

### 查看已计划的通知

应用内部集成了通知管理功能：
```typescript
import { NotificationService } from './services/notificationService';

// 获取所有已计划的通知
const notifications = await NotificationService.getAllScheduledNotifications();
console.log(`共有 ${notifications.length} 个提醒`);
```

### 取消通知

**取消所有通知：**
```typescript
await NotificationService.cancelAllNotifications();
```

**取消特定通知：**
```typescript
await NotificationService.cancelNotification(notificationId);
```

### 测试通知

在开发阶段测试通知功能：
```typescript
await NotificationService.sendTestNotification(
  '测试通知',
  '这是一条测试消息'
);
```

---

## 🎯 最佳实践

### 1. 疫苗提醒
- ✅ 添加疫苗记录后立即设置下次接种提醒
- ✅ 记录批次号，便于查询
- ✅ 完成接种后及时更新记录

### 2. 用药提醒
- ✅ 使用标准频次格式（如：每日3次）
- ✅ 设置准确的疗程时间
- ✅ 配合就医记录关联使用
- ✅ 按时打卡，养成习惯

### 3. 提醒时间
- 📱 保持手机通知权限开启
- 🔋 避免在省电模式下错过提醒
- ⏰ 根据作息时间调整提醒设置

---

## 🐛 常见问题

### Q1: 为什么没有收到通知？

**检查清单：**
1. ✓ 确认已授予通知权限
   - iOS：设置 → BabyBeats → 通知 → 允许通知
   - Android：设置 → 应用 → BabyBeats → 通知 → 允许
2. ✓ 确认提醒时间未过期
3. ✓ 确认手机未开启勿扰模式
4. ✓ 确认应用未被系统杀掉

### Q2: 用药提醒时间可以自定义吗？

当前版本使用固定的提醒时间：
- 早上：8:00
- 下午：14:00  
- 晚上：20:00

后续版本将支持自定义提醒时间。

### Q3: 疫苗提醒可以提前更多天吗？

当前版本固定为接种前7天提醒。后续版本将支持自定义提前天数。

### Q4: 通知过多怎么办？

您可以：
1. 关闭不需要的疫苗提醒开关
2. 调整用药记录的疗程时间
3. 使用"取消所有通知"功能重置

### Q5: 如何知道有多少个提醒？

当前可以通过代码查看：
```typescript
const notifications = await NotificationService.getAllScheduledNotifications();
```

后续版本将在设置中添加"通知管理"界面。

---

## 🔄 通知生命周期

### 疫苗提醒
```
添加疫苗（设置下次接种+开启提醒）
    ↓
计算提醒时间（接种日期 - 7天）
    ↓
注册系统通知
    ↓
到期时推送通知
    ↓
用户查看通知 → 打开应用 → 完成接种 → 更新记录
```

### 用药提醒
```
添加用药（设置频次+疗程）
    ↓
解析频次（每日几次）
    ↓
计算7天内的所有提醒时间点
    ↓
批量注册系统通知
    ↓
每个时间点推送通知
    ↓
用户打卡记录
```

---

## 💡 开发者说明

### NotificationService API

**主要方法：**
```typescript
// 请求权限
await NotificationService.requestPermissions();

// 设置疫苗提醒
await NotificationService.scheduleVaccineReminder(vaccine, babyName);

// 设置用药提醒
await NotificationService.scheduleMedicationReminders(medication, babyName);

// 获取所有提醒
await NotificationService.getAllScheduledNotifications();

// 取消提醒
await NotificationService.cancelNotification(id);
await NotificationService.cancelAllNotifications();

// 监听通知响应
NotificationService.addNotificationResponseListener((response) => {
  console.log('用户点击了通知:', response);
});
```

### 扩展提醒功能

如需添加新的提醒类型：
1. 在 `NotificationService` 中添加新方法
2. 在对应的 Service 中调用通知方法
3. 配置通知内容和触发条件

---

## 🎉 未来计划

- [ ] 自定义提醒时间
- [ ] 自定义提前天数
- [ ] 通知管理界面
- [ ] 提醒统计和历史
- [ ] 声音和震动自定义
- [ ] 复诊提醒
- [ ] 重要日期提醒（生日、满月等）

---

## 📞 反馈与支持

如有问题或建议，欢迎联系：
- 📧 Email: zhu.cy@outlook.com
- 💬 应用内：设置 → 帮助与反馈

---

**享受智能提醒，守护宝宝健康！** 💙

