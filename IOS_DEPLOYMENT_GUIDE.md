# BabyBeats iOS 发布完整指南

## 目录
1. [Apple 开发者账号申请](#1-apple-开发者账号申请)
2. [Expo EAS 配置](#2-expo-eas-配置)
3. [TestFlight 内测发布](#3-testflight-内测发布)
4. [App Store 正式发布](#4-app-store-正式发布)
5. [版本更新流程](#5-版本更新流程)

---

## 1. Apple 开发者账号申请

### 1.1 准备材料
- **个人开发者账号** ($99/年)
  - Apple ID
  - 信用卡或借记卡（支持 Visa、Mastercard、American Express）
  - 有效的电话号码
  
- **公司开发者账号** ($99/年)
  - 以上个人材料
  - 公司 DUNS 编号
  - 公司法人信息
  - 公司官方网站
  - 公司营业执照

### 1.2 注册步骤

#### Step 1: 创建或准备 Apple ID
1. 访问 [Apple ID 注册页面](https://appleid.apple.com/)
2. 创建新的 Apple ID 或使用现有的（建议使用公司邮箱）
3. 启用**双重认证（2FA）**（必须）

#### Step 2: 加入 Apple Developer Program
1. 访问 [Apple Developer Program](https://developer.apple.com/programs/)
2. 点击 "Enroll"（注册）
3. 使用 Apple ID 登录
4. 选择账号类型：
   - **Individual/Sole Proprietor**：个人开发者
   - **Organization**：公司/组织

#### Step 3: 同意协议并付费
1. 阅读并同意 Apple Developer Program License Agreement
2. 填写个人/公司信息
3. 完成支付（$99/年）
4. 等待审核（个人账号通常 1-2 天，公司账号可能需要 1-2 周）

#### Step 4: 审核通过后
1. 收到确认邮件
2. 登录 [App Store Connect](https://appstoreconnect.apple.com/)
3. 完善账号信息

### 1.3 配置证书和描述文件

这部分将由 Expo EAS 自动处理，但了解流程很重要：

1. **证书类型**
   - Development Certificate：开发证书
   - Distribution Certificate：发布证书

2. **Provisioning Profile**
   - Development Profile：开发配置文件
   - Ad Hoc Profile：临时分发
   - App Store Profile：App Store 发布

---

## 2. Expo EAS 配置

### 2.1 安装 EAS CLI

```bash
# 安装 EAS CLI
npm install -g eas-cli

# 登录 Expo 账号（如果还没有，需要先注册）
eas login

# 如果没有 Expo 账号，先注册
eas register
```

### 2.2 配置 EAS Build

在项目根目录创建 `eas.json` 配置文件：

```bash
cd baby-beats-app
eas build:configure
```

### 2.3 更新 app.json

确保 `app.json` 包含完整的 iOS 配置：

```json
{
  "expo": {
    "name": "BabyBeats",
    "slug": "baby-beats-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.babybeats.app",
      "buildNumber": "1",
      "icon": "./assets/icon-ios.png",
      "infoPlist": {
        "NSCameraUsageDescription": "需要访问相机以拍摄宝宝照片",
        "NSPhotoLibraryUsageDescription": "需要访问相册以选择宝宝照片",
        "NSRemindersUsageDescription": "需要访问提醒事项以设置喂养提醒",
        "UIBackgroundModes": ["remote-notification"]
      }
    },
    "extra": {
      "eas": {
        "projectId": "YOUR_PROJECT_ID"
      }
    }
  }
}
```

### 2.4 连接 Apple Developer 账号

#### 配置证书和 Provisioning Profile

```bash
cd baby-beats-app

# 配置 iOS 证书
eas credentials

# 或者在首次构建时自动配置
eas build --platform ios --profile production
```

#### 详细配置流程

**Step 1: 选择平台和配置**
```
✔ Select platform › iOS
✔ Which build profile do you want to configure? › production
```

**注意**：
- `development` - 用于开发构建（模拟器）
- `preview` - 用于内部测试（Ad Hoc）
- `production` - 用于 App Store 发布 ⭐ **推荐先配置此项**

**Step 2: 登录 Apple 开发者账号**
```
✔ Do you want to log in to your Apple account? › yes
✔ Apple ID: … your-apple-id@example.com
✔ Password: … (输入密码)
```

**Step 3: 双重认证**
```
Two-factor Authentication (6 digit code) is enabled
✔ How do you want to validate your account? › device / sms
✔ Please enter the 6 digit code … 123456
✔ Valid code
✔ Logged in and verified
```

**Step 4: 选择开发者团队**
```
› Team CHIYU ZHU (MP998ALN94)  ← 这是您的 Team ID
› Provider CHIYU ZHU (128307617)
```

**Step 5: 配置构建证书**
```
Bundle Identifier: com.babybeats.app

✔ What do you want to do? › Build Credentials: Manage everything needed to build your project
✔ What do you want to do? › All: Set up all the required credentials to build your project
```

EAS 会自动：
1. ✅ 注册 Bundle Identifier (com.babybeats.app)
2. ✅ 同步 Capabilities（权限配置）
3. ✅ 生成 Apple Distribution Certificate（发布证书）
4. ✅ 创建 Provisioning Profile（配置文件）

**Step 6: 配置完成**
```
Project Credentials Configuration

Project                   @your-username/baby-beats-app
Bundle Identifier         com.babybeats.app
                          
Distribution Certificate  
Serial Number             46447255650FFA458D259869704DC9A5
Expiration Date           (1年后)
Apple Team                MP998ALN94 (CHIYU ZHU (Individual))
                          
Provisioning Profile      
Developer Portal ID       52S3WQJT7Z
Status                    active
Expiration                (1年后)
Apple Team                MP998ALN94 (CHIYU ZHU (Individual))
                          
✅ All credentials are ready to build!
```

#### 配置 App Store Connect API Key（可选但推荐）

API Key 用于自动提交到 App Store Connect，无需每次手动输入密码。

**创建 API Key**：

1. 登录 [App Store Connect](https://appstoreconnect.apple.com/)
2. 用户和访问 → 密钥 → App Store Connect API
3. 点击 "+" 创建新密钥
4. 填写信息：
   - 名称：EAS Build Key
   - 访问权限：开发者
5. 创建后下载 `.p8` 文件（**只能下载一次，请妥善保管**）
6. 记录：
   - Key ID：`ABC123DEF4`
   - Issuer ID：`12345678-1234-1234-1234-123456789012`

**配置到 EAS**：

```bash
# 重新运行 credentials 配置
eas credentials

# 选择：
✔ What do you want to do? › App Store Connect: Manage your API Key
✔ What do you want to do? › Add a new API Key For EAS Submit

# 输入信息：
Key ID: ABC123DEF4
Issuer ID: 12345678-1234-1234-1234-123456789012
Key file (.p8): /path/to/AuthKey_ABC123DEF4.p8
```

**注意**：如果遇到错误 "A simulator distribution does not require credentials"，说明您选择了错误的 profile。请确保：
- 使用 `production` profile（而非 `development`）
- `development` profile 用于模拟器，不需要 API Key

---

## 3. TestFlight 内测发布

### 3.1 创建 App Store Connect 应用

#### Step 1: 创建应用
1. 登录 [App Store Connect](https://appstoreconnect.apple.com/)
2. 点击 "我的 App" → "+" → "新建 App"
3. 填写信息：
   - **平台**: iOS
   - **名称**: BabyBeats
   - **主要语言**: 简体中文
   - **套装 ID**: com.babybeats.app
   - **SKU**: babybeats-app-001（唯一标识符）
   - **用户访问权限**: 完全访问权限

#### Step 2: 填写 App 信息
1. **App 信息**
   - 名称：BabyBeats
   - 副标题：宝宝成长记录助手
   - 类别：健康健美 / 生活
   - 内容版权：© 2025 Your Company

2. **定价和销售范围**
   - 价格：免费
   - 销售范围：选择国家/地区

3. **App 隐私**
   - 填写隐私政策 URL
   - 声明数据收集类型

### 3.2 构建并上传到 TestFlight

#### 首次构建

```bash
cd baby-beats-app

# 方式一：构建预览版本（推荐首次测试）
eas build --platform ios --profile preview

# 方式二：直接构建生产版本
eas build --platform ios --profile production
```

#### 构建过程

**1. 开始构建**
```
✔ Build type › Build a new binary
✔ iOS Bundle Identifier › com.babybeats.app

› Compressing project files...
› Uploading to EAS Build...
› Build queued...
```

**2. 构建队列**
```
⠧ Waiting for build to complete. You can press Ctrl+C to exit.

Build details: https://expo.dev/accounts/[username]/projects/baby-beats-app/builds/[build-id]
```

**提示**：
- 可以按 Ctrl+C 退出，构建会在后台继续
- 访问上述链接查看实时构建日志
- 首次构建通常需要 20-30 分钟

**3. 构建完成**
```
✅ Build finished successfully!

Build artifact:
- https://expo.dev/.../baby-beats-app.ipa

Next steps:
- Submit to App Store: eas submit --platform ios
- Download: eas build:download --platform ios
```

#### 自动提交到 App Store Connect

构建完成后，自动提交到 TestFlight：

```bash
# 自动提交最新构建
eas submit --platform ios

# 或指定构建 ID
eas submit --platform ios --id [build-id]
```

**提交过程**：
```
✔ Using build: [build-id]
› Submitting to App Store Connect...
› Processing...
✅ Successfully submitted to App Store Connect!

› You can check the status at:
  https://appstoreconnect.apple.com/
```

**等待处理**：
- 提交后需要等待 Apple 处理：10-30 分钟
- 处理完成后会在 TestFlight 中显示
- 收到邮件通知："Your app is ready for testing"

**构建配置 (eas.json)**：
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false,
        "buildConfiguration": "Release"
      }
    },
    "production": {
      "distribution": "store",
      "ios": {
        "buildConfiguration": "Release"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "YOUR_ASC_APP_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

构建完成后：
1. EAS 会自动上传到 App Store Connect
2. 等待处理（通常 10-30 分钟）
3. 在 TestFlight 中查看构建版本

### 3.3 配置 TestFlight 测试

#### 内部测试（Internal Testing）

1. **添加内部测试人员**
   - App Store Connect → TestFlight → 内部测试
   - 添加团队成员（最多 100 人）
   - 测试人员必须有 App Store Connect 账号

2. **自动分发**
   - 启用 "自动分发给测试人员"
   - 新构建版本会自动推送

#### 外部测试（External Testing）

1. **创建测试群组**
   - TestFlight → 外部测试 → "+" 创建新群组
   - 群组名称：例如 "Beta 测试组 1"
   - 最多 10,000 名测试人员

2. **添加测试人员**
   - 方式一：通过邮箱邀请
     ```
     tester1@example.com
     tester2@example.com
     ```
   - 方式二：生成公开链接（推荐）
     - 启用 "公开链接"
     - 设置测试人员上限
     - 复制链接分享给测试用户

3. **提交审核**
   - **重要**：外部测试需要 Apple 审核（通常 24-48 小时）
   - 填写测试信息：
     - **测试信息**: 说明测试重点
     - **反馈邮箱**: support@yourdomain.com
     - **营销 URL**: https://yourdomain.com
     - **隐私政策 URL**: https://yourdomain.com/privacy
   - 提交后等待审核通过

### 3.4 分发邀请码（公开链接方式）

1. **生成测试链接**
   ```
   https://testflight.apple.com/join/YOUR_CODE
   ```

2. **分享方式**
   - 通过邮件发送
   - 在社交媒体分享
   - 在官网放置下载链接

3. **测试人员安装流程**
   - 在 iOS 设备上安装 TestFlight App
   - 点击邀请链接或输入邀请码
   - 接受测试邀请
   - 下载并安装 BabyBeats

### 3.5 收集测试反馈

1. **TestFlight 内置反馈**
   - 测试人员可在 TestFlight 中截图反馈
   - 在 App Store Connect 查看反馈

2. **Crash 报告**
   - TestFlight → 构建版本 → Crash 报告
   - 分析崩溃日志

3. **建议测试周期**
   - 内部测试：1-2 周
   - 外部测试：2-4 周
   - 修复关键 bug 后发布新版本

---

## 4. App Store 正式发布

### 4.1 准备发布资料

#### 必需的截图（每种设备至少 1 张）
- **6.7" Display (iPhone 15 Pro Max)**: 1290 x 2796 px
- **6.5" Display (iPhone 14 Plus)**: 1284 x 2778 px
- **5.5" Display (iPhone 8 Plus)**: 1242 x 2208 px

**建议截图内容**：
1. 主界面 - 今日概览
2. 喂养记录界面
3. 睡眠记录界面
4. 成长曲线图表
5. 疫苗接种记录

#### App 预览视频（可选但推荐）
- 格式：.mov, .mp4, .m4v
- 时长：15-30 秒
- 分辨率：与截图相同

#### App 图标
- 1024 x 1024 px
- PNG 格式
- 无圆角、无透明通道

### 4.2 填写 App Store 商品信息

登录 App Store Connect → 选择应用 → "App Store"

#### 1. App 信息
```
App 名称: BabyBeats - 宝宝成长记录
副标题: 科学记录宝宝每一天

描述:
BabyBeats 是一款专为新手父母设计的宝宝成长记录应用，帮助您轻松记录和追踪宝宝的日常活动。

【核心功能】
📝 全面记录
• 喂养记录：母乳、配方奶、辅食
• 睡眠追踪：入睡时间、睡眠时长
• 换尿布：大小便记录
• 成长数据：身高、体重、头围

📊 可视化报告
• 成长曲线对比 WHO 标准
• 每日、每周、每月统计
• 导出数据报告

⏱️ 智能计时器
• 喂养计时
• 睡眠计时
• 左右乳切换提醒

🔔 贴心提醒
• 喂养时间提醒
• 换尿布提醒
• 疫苗接种提醒

☁️ 数据同步
• 多设备同步
• 数据备份
• 家庭成员共享

关键词: 宝宝,婴儿,喂养,记录,成长,追踪,父母,育儿,日记
```

#### 2. 定价和销售范围
- 价格：免费
- 可用性：所有国家/地区（或指定区域）

#### 3. App 隐私
填写数据收集声明（重要）：
- 标识符：用户 ID
- 使用数据：宝宝数据、喂养记录等
- 诊断：崩溃数据

#### 4. 分级
- 完成年龄分级问卷
- BabyBeats 预计分级：4+

### 4.3 提交审核

#### Step 1: 选择构建版本
1. App Store Connect → 构建版本
2. 选择 TestFlight 测试通过的版本
3. 点击 "+"，选择要发布的构建

#### Step 2: 填写版本信息
```
版本号: 1.0.0

此版本的新增内容:
🎉 BabyBeats 正式发布！

• 全面的宝宝日常记录功能
• 科学的成长数据追踪
• 智能喂养和睡眠计时器
• 美观直观的数据可视化
• 多设备数据同步

感谢您选择 BabyBeats，陪伴宝宝健康成长！
```

#### Step 3: 审核信息
```
联系信息:
• 姓名: [您的姓名]
• 电话: +86 138-xxxx-xxxx
• 电子邮件: support@yourdomain.com

App 审核信息:
• 登录所需: 是（提供测试账号）
• 测试账号:
  - 用户名: testuser@example.com
  - 密码: Test123456!
  - 说明: 此账号已预置测试数据

备注:
BabyBeats 是一款宝宝成长记录应用。主要功能包括记录喂养、睡眠、换尿布等日常活动，以及追踪成长数据。应用使用本地 SQLite 数据库存储数据，支持云端同步备份。
```

#### Step 4: 导出合规信息
- 使用加密：是（HTTPS）
- 是否使用美国政府豁免的加密：是
- App 使用标准加密

#### Step 5: 广告标识符 (IDFA)
- 如果不使用第三方广告：选择 "否"

#### Step 6: 提交审核
- 检查所有信息
- 点击 "提交以供审核"
- 状态变为 "正在等待审核"

### 4.4 审核流程时间线

```
提交审核
    ↓
正在等待审核 (12-48 小时)
    ↓
正在审核中 (24-48 小时)
    ↓
┌─────────────┬─────────────┐
│   被拒绝     │    已批准    │
│  (修改重提)  │   (可发布)   │
└─────────────┴─────────────┘
```

**平均审核时间**：2-4 天
**加急审核**：可申请，但需要充分理由

### 4.5 常见被拒原因及解决方案

| 拒绝原因 | 解决方案 |
|---------|---------|
| 崩溃或 bug | 修复 bug，重新提交构建 |
| 功能不完整 | 补充功能或说明 |
| 隐私政策缺失 | 添加隐私政策链接 |
| 测试账号无效 | 确保测试账号可用 |
| 界面不符合规范 | 优化 UI 设计 |
| 元数据问题 | 修改描述或截图 |

### 4.6 发布应用

审核通过后：

#### 自动发布
- 在提交时选择 "自动发布"
- 审核通过后立即上架

#### 手动发布
- 在提交时选择 "手动发布"
- 审核通过后，自行选择发布时间
- App Store Connect → 版本发布 → 发布此版本

发布后 24 小时内，App 将在全球 App Store 上线。

---

## 5. 版本更新流程

### 5.1 准备更新

1. **更新版本号**
   ```json
   // app.json
   {
     "expo": {
       "version": "1.0.1",  // 增加版本号
       "ios": {
         "buildNumber": "2"  // 增加构建号
       }
     }
   }
   ```

2. **开发和测试**
   - 完成新功能或修复 bug
   - 本地测试
   - TestFlight 内部测试

### 5.2 构建新版本

```bash
# 构建新版本
eas build --platform ios --profile production

# 等待构建完成后，提交到 App Store Connect
eas submit --platform ios --latest
```

**完整更新流程**：

```bash
# 1. 更新代码和版本号
# 编辑 app.json，更新 version 和 buildNumber

# 2. 清理缓存（可选）
rm -rf node_modules/.cache
rm -rf .expo

# 3. 重新安装依赖
npm install

# 4. 构建
eas build --platform ios --profile production

# 5. 等待构建完成（20-30分钟）

# 6. 提交
eas submit --platform ios --latest

# 7. 登录 App Store Connect 完成发布设置
```

### 5.3 更新 App Store 信息

1. App Store Connect → 选择应用
2. "+" 创建新版本（如 1.0.1）
3. 填写 "此版本的新增内容"
   ```
   版本 1.0.1 更新内容：
   
   🐛 错误修复
   • 修复了喂养记录保存失败的问题
   • 优化了数据同步性能
   
   ✨ 功能优化
   • 改进了成长曲线显示
   • 增强了通知提醒准确性
   ```

4. 选择新的构建版本
5. 提交审核

### 5.4 版本号规范

遵循 **语义化版本** (Semantic Versioning)：

```
主版本号.次版本号.修订号 (MAJOR.MINOR.PATCH)

1.0.0 → 首次发布
1.0.1 → Bug 修复
1.1.0 → 新增功能（向后兼容）
2.0.0 → 重大更新（可能不向后兼容）
```

### 5.5 快速更新（OTA）

对于不涉及原生代码的更新，可使用 Expo Updates：

```bash
# 发布 OTA 更新
eas update --branch production --message "修复喂养记录 bug"
```

用户下次打开 App 时会自动下载更新，无需通过 App Store。

**限制**：
- 不能修改原生代码
- 不能添加新的权限
- 只能更新 JS bundle

---

## 6. 证书管理和故障排查

### 6.1 查看已配置的证书

```bash
# 查看所有证书
eas credentials

# 选择：
✔ Select platform › iOS
✔ Which build profile? › production

# 会显示当前配置：
iOS Credentials
Project            @your-username/baby-beats-app
Bundle Identifier  com.babybeats.app
Apple Team         MP998ALN94 (CHIYU ZHU (Individual))

Distribution Certificate
Serial Number      46447255650FFA458D259869704DC9A5
Expiration Date    (到期日期)
Apple Team         MP998ALN94

Provisioning Profile
Developer Portal ID    52S3WQJT7Z
Status                active
Expiration            (到期日期)
```

### 6.2 重新生成证书

如果证书过期或损坏：

```bash
eas credentials

# 选择：
✔ What do you want to do? › Build Credentials
✔ What do you want to do? › All: Set up all the required credentials
✔ Generate a new Apple Distribution Certificate? › yes
```

### 6.3 常见错误和解决方案

#### 错误 1: "A simulator distribution does not require credentials"

**原因**：选择了 `development` profile，该 profile 用于模拟器构建

**解决方案**：
```bash
# 使用 production profile
eas credentials
✔ Which build profile? › production  # 而不是 development
```

#### 错误 2: "Bundle identifier is not available"

**原因**：Bundle ID 已被其他应用使用

**解决方案**：
1. 在 `app.json` 中修改 `ios.bundleIdentifier`
2. 使用唯一的 ID，如 `com.yourname.babybeats`

#### 错误 3: "Invalid Apple Developer account"

**原因**：Apple 开发者账号未激活或已过期

**解决方案**：
1. 访问 [developer.apple.com](https://developer.apple.com/)
2. 确认账号状态为 Active
3. 如果过期，续费 $99/年

#### 错误 4: "No profiles for 'com.babybeats.app' were found"

**原因**：Provisioning Profile 未正确创建

**解决方案**：
```bash
# 重新创建 profile
eas credentials
✔ What do you want to do? › Build Credentials
✔ What do you want to do? › All: Set up all the required credentials
```

#### 错误 5: "Authentication session expired"

**原因**：Apple 登录会话过期

**解决方案**：
```bash
# 清除缓存的凭证
eas credentials
# 重新登录 Apple 账号
```

### 6.4 证书过期提醒

- **Distribution Certificate**：有效期 1 年
- **Provisioning Profile**：有效期 1 年
- **Apple Developer 账号**：需每年续费 $99

**过期前 30 天**：
- Apple 会发送提醒邮件
- App Store Connect 会显示警告
- 证书过期前需要更新

**更新证书**：
```bash
# 自动更新
eas build --platform ios --profile production

# 如果提示证书过期，选择重新生成
✔ Generate a new certificate? › yes
```

---

## 7. 常见问题 (FAQ)

### Q1: Expo 和 React Native CLI 的区别？
**A**: BabyBeats 使用 Expo，优势是：
- 简化构建流程，无需 Xcode
- 自动管理证书
- 支持 OTA 更新
- 提供丰富的原生模块

### Q2: TestFlight 测试人员上限是多少？
**A**: 
- 内部测试：100 人
- 外部测试：10,000 人

### Q3: 审核被拒后怎么办？
**A**:
1. 仔细阅读拒绝原因
2. 在 Resolution Center 回复问题
3. 修复后重新提交
4. 不会影响 App 排名

### Q4: 能否撤回审核？
**A**: 可以，在 "正在等待审核" 或 "正在审核中" 状态下，可以点击 "撤回此版本" 撤回审核。

### Q5: 如何加急审核？
**A**: 
1. App Store Connect → 联系我们
2. 选择 "请求加急审核"
3. 说明紧急原因（如关键 bug 修复）
4. 每年有限次数，谨慎使用

### Q6: 如何处理用户差评？
**A**:
1. App Store Connect 中回复评价
2. 引导用户更新到最新版本
3. 提供支持邮箱解决问题
4. 持续改进产品

### Q7: 需要每年续费开发者账号吗？
**A**: 是的，$99/年。到期前 30 天会收到续费提醒。不续费的话：
- App 仍在 App Store 上
- 但无法更新或发布新版本

### Q8: development、preview、production 有什么区别？
**A**: 
- **development**: 开发构建，运行在模拟器，不需要证书
- **preview**: 内部测试，真机安装（Ad Hoc），需要注册设备 UDID
- **production**: 生产构建，用于 TestFlight 和 App Store，需要完整证书

### Q9: 如何添加测试设备？
**A**: 
```bash
eas credentials
✔ Select platform › iOS
✔ Which build profile? › preview  # 使用 preview profile
✔ What do you want to do? › Build Credentials
# 选择添加设备，输入设备 UDID

# 获取设备 UDID：
# iOS 设备：设置 → 通用 → 关于本机 → 点击"序列号"多次显示 UDID
# Mac (Apple Silicon): 自动获取
```

### Q10: 构建失败怎么办？
**A**: 
1. 查看构建日志：访问 EAS 提供的构建链接
2. 常见原因：
   - 依赖版本不兼容：检查 `package.json`
   - 原生代码错误：检查 `ios/` 目录
   - 证书问题：重新运行 `eas credentials`
3. 清理并重试：
   ```bash
   rm -rf node_modules
   npm install
   eas build --platform ios --profile production --clear-cache
   ```

---

## 8. 有用的资源

### 官方文档
- [Apple Developer](https://developer.apple.com/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Expo Documentation](https://docs.expo.dev/)
- [App Store 审核指南](https://developer.apple.com/app-store/review/guidelines/)

### 工具和服务
- [App Store Connect API](https://developer.apple.com/app-store-connect/api/)
- [TestFlight](https://developer.apple.com/testflight/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)

### 设计资源
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [iOS Design Resources](https://developer.apple.com/design/resources/)

---

---

## 9. 快速命令参考

### 常用命令

```bash
# 登录 EAS
eas login

# 配置证书
eas credentials

# 构建应用
eas build --platform ios --profile production

# 提交到 App Store
eas submit --platform ios --latest

# 查看构建列表
eas build:list --platform ios

# 查看构建详情
eas build:view [build-id]

# 下载构建文件
eas build:download --platform ios

# OTA 更新（无需重新构建）
eas update --branch production --message "修复bug"

# 查看更新列表
eas update:list

# 查看项目配置
eas config
```

### 调试命令

```bash
# 清理缓存重新构建
eas build --platform ios --profile production --clear-cache

# 本地预览构建配置
eas build:configure

# 检查项目配置
eas diagnostics

# 查看 EAS 版本
eas --version

# 更新 EAS CLI
npm install -g eas-cli@latest
```

### 有用的 URL

```bash
# EAS 构建dashboard
https://expo.dev/accounts/[username]/projects/baby-beats-app/builds

# App Store Connect
https://appstoreconnect.apple.com/

# Apple Developer Portal
https://developer.apple.com/account/

# TestFlight
https://testflight.apple.com/
```

---

## 10. 实战经验总结

### ✅ 最佳实践

1. **先配置 production profile**
   - 避免配置 development 时遇到 "simulator distribution" 错误
   - production 证书可用于 TestFlight 和 App Store

2. **使用 API Key 自动提交**
   - 避免每次都输入 Apple ID 密码
   - 提高自动化程度

3. **保存证书信息**
   - Team ID: MP998ALN94
   - Bundle ID: com.babybeats.app
   - 记录在安全的地方

4. **定期备份**
   - 导出 Provisioning Profile
   - 保存 Distribution Certificate
   - EAS 会自动管理，但建议本地备份

5. **版本管理**
   - 使用语义化版本号
   - 每次发布前更新 `buildNumber`
   - 在 git 中打标签

### ⚠️ 注意事项

1. **证书有效期**
   - Distribution Certificate：1年
   - Provisioning Profile：1年
   - 提前 30 天更新

2. **Bundle ID 不能修改**
   - 一旦发布就固定了
   - 修改需要创建新应用

3. **测试账号**
   - 提供给 Apple 审核的测试账号必须可用
   - 预先准备好测试数据

4. **隐私政策**
   - 必须提供可访问的 URL
   - 内容需符合 Apple 要求

5. **首次构建**
   - 通常需要 20-30 分钟
   - 后续构建会更快（10-15 分钟）

### 📝 实际操作记录（示例）

```
项目：BabyBeats
Bundle ID：com.babybeats.app
Team ID：MP998ALN94
Team Name：CHIYU ZHU (Individual)

证书信息：
- Distribution Certificate：46447255650FFA458D259869704DC9A5
- Provisioning Profile：52S3WQJT7Z
- 到期日期：2026-11-20

构建记录：
- 首次构建：2025-11-20（耗时 28 分钟）
- 版本 1.0.0 (Build 1)

测试：
- TestFlight 内部测试：5 人
- TestFlight 外部测试：待开始

发布状态：
- 准备中
```

---

## 下一步

完成 iOS 发布后，继续阅读：
- [后端部署指南](./BACKEND_DEPLOYMENT_GUIDE.md)
- [Android 发布指南](./ANDROID_DEPLOYMENT_GUIDE.md)（可选）
- [部署检查清单](./DEPLOYMENT_CHECKLIST.md)

祝发布顺利！🎉

