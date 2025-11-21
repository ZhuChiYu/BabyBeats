# 📱 提交到 App Store Connect 指南

## 🚀 快速提交（交互式）

### 第一次提交

```bash
cd baby-beats-app

# 交互式提交（推荐）
eas submit --platform ios
```

EAS 会引导您完成以下步骤：

1. **选择构建**
   ```
   ✔ Select a build from EAS › 
   Latest build (Nov 20, 2025)
   ```

2. **Apple ID 登录**
   ```
   ✔ Apple ID: … zhu.cy@outlook.com
   ✔ Password: … (输入密码)
   ✔ Two-factor code: … 123456
   ```

3. **自动提交**
   ```
   › Submitting to App Store Connect...
   ✅ Successfully submitted!
   ```

---

## 📋 需要的信息

### 如果是第一次提交

EAS 可能会要求以下信息：

#### 1. App Store Connect App ID (ASC App ID)

**如何获取**：
1. 登录 https://appstoreconnect.apple.com/
2. 我的 App → 选择 BabyBeats
3. App 信息 → 通用信息
4. 找到 "Apple ID"（纯数字，如：1234567890）

#### 2. Apple Team ID

您的 Team ID：`MP998ALN94`（已知）

---

## 🎯 完整提交流程

### Step 1: 确认构建成功

```bash
# 查看构建列表
eas build:list --platform ios

# 确认最新构建状态为 "finished"
```

### Step 2: 提交到 App Store Connect

```bash
# 交互式提交
eas submit --platform ios

# 或指定构建 ID
eas submit --platform ios --id [build-id]

# 或提交最新构建
eas submit --platform ios --latest
```

### Step 3: 等待处理

```
› Submitting to App Store Connect...
› Uploading IPA...
› Processing...
✅ Successfully submitted!

› App is now available in App Store Connect
  https://appstoreconnect.apple.com/
```

**等待时间**：10-30 分钟

---

## 🔍 App Store Connect 中的状态

### 提交后检查

1. 登录 https://appstoreconnect.apple.com/
2. 我的 App → BabyBeats
3. TestFlight → iOS 构建版本

**状态变化**：
```
正在处理中 → 等待处理 → 可供测试
(10-30 分钟)
```

### 可能的状态

| 状态 | 说明 | 操作 |
|------|------|------|
| 正在处理 | Apple 正在处理您的构建 | 等待 |
| 处理中 | 正在验证和优化 | 等待 |
| 可供测试 | 可以开始 TestFlight 测试 | 添加测试人员 ✅ |
| 失败 | 处理失败（罕见） | 查看错误并重新提交 |

---

## 📱 在 TestFlight 中测试

### 添加自己为测试人员

1. App Store Connect → TestFlight
2. 内部测试 → "+" 创建群组
3. 添加测试人员（输入您的邮箱）
4. 在 iPhone 上：
   - 安装 TestFlight App
   - 打开邮件中的邀请
   - 接受并安装

### 邀请其他人测试

**内部测试**（最多 100 人）：
- App Store Connect → TestFlight → 内部测试
- 添加 App Store Connect 用户

**外部测试**（最多 10,000 人）：
- App Store Connect → TestFlight → 外部测试
- 创建测试群组
- 生成公开链接
- 分享链接给测试人员

---

## 🔧 故障排查

### 错误 1: "Invalid App Store Connect App ID"

**原因**：`eas.json` 中配置了错误的 ASC App ID

**解决**：
```bash
# 方案 A: 删除 submit 配置，使用交互式（推荐）
# 已完成 ✅

# 方案 B: 获取正确的 ASC App ID 并更新
# 从 App Store Connect 获取纯数字 ID
```

### 错误 2: "Apple ID authentication failed"

**原因**：Apple ID 密码错误或需要双重认证

**解决**：
```bash
# 重新登录
eas submit --platform ios

# 确保：
# 1. Apple ID 密码正确
# 2. 双重认证已启用
# 3. 输入正确的验证码
```

### 错误 3: "No builds found"

**原因**：没有可用的构建

**解决**：
```bash
# 先构建
eas build --platform ios --profile production

# 等待构建完成后再提交
eas submit --platform ios --latest
```

### 错误 4: "Bundle ID mismatch"

**原因**：Bundle ID 不匹配

**解决**：
1. 确认 App Store Connect 中的 Bundle ID 是 `com.babybeats.app`
2. 如果不是，需要创建新的 App

---

## 📝 配置 ASC App ID（可选）

如果您想预先配置，避免每次都输入：

### 1. 获取 ASC App ID

```
登录 App Store Connect
→ 我的 App
→ BabyBeats
→ App 信息
→ 通用信息
→ Apple ID (纯数字，如：1234567890)
```

### 2. 更新 eas.json

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "zhu.cy@outlook.com",
        "ascAppId": "1234567890",
        "appleTeamId": "MP998ALN94"
      }
    }
  }
}
```

### 3. 下次提交更快

```bash
eas submit --platform ios --latest
# 不再需要交互式输入
```

---

## 🎯 推荐工作流程

### 开发阶段

```bash
# 1. 本地开发和测试
npm run ios

# 2. 构建 preview 版本（Ad Hoc）
eas build --platform ios --profile preview

# 3. 在注册的设备上测试
```

### 测试阶段

```bash
# 1. 构建 production 版本
eas build --platform ios --profile production

# 2. 提交到 App Store Connect
eas submit --platform ios --latest

# 3. 在 TestFlight 测试
# - 内部测试（5-10 人）
# - 外部测试（更多用户）
```

### 发布阶段

```bash
# 1. TestFlight 测试通过

# 2. 在 App Store Connect 提交审核
# - 填写截图和描述
# - 提交审核

# 3. 审核通过后发布
```

---

## 💡 有用的命令

### 查看提交历史

```bash
# 查看所有提交
eas submission:list --platform ios

# 查看特定提交
eas submission:view [submission-id]
```

### 管理构建

```bash
# 列出所有构建
eas build:list --platform ios

# 查看构建详情
eas build:view [build-id]

# 下载 IPA 文件
eas build:download --platform ios --latest
```

### 取消提交

如果提交了错误的版本：

```bash
# 在 App Store Connect 中取消
# 我的 App → TestFlight → 构建版本 → 删除
```

---

## ✅ 检查清单

提交前确认：

- [ ] 构建已成功完成
- [ ] 在本地或模拟器测试通过
- [ ] 版本号已更新（app.json）
- [ ] Bundle ID 正确（com.babybeats.app）
- [ ] Apple 开发者账号有效
- [ ] 在 App Store Connect 中创建了应用

---

## 📚 相关资源

- [App Store Connect](https://appstoreconnect.apple.com/)
- [TestFlight](https://testflight.apple.com/)
- [EAS Submit 文档](https://docs.expo.dev/submit/introduction/)
- [Apple Developer](https://developer.apple.com/)

---

## 🎉 成功提交后

1. **收到邮件通知**
   - "Your app is ready for testing"

2. **在 TestFlight 中可见**
   - App Store Connect → TestFlight
   - 可以看到新的构建版本

3. **开始测试**
   - 添加测试人员
   - 收集反馈
   - 修复问题

4. **准备发布**
   - 填写 App Store 信息
   - 提交审核
   - 等待审核通过
   - 🎊 发布！

---

## 🆘 需要帮助？

如果遇到问题：

1. 查看 [EAS 文档](https://docs.expo.dev/submit/ios/)
2. 查看 [故障排查指南](./BUILD_TROUBLESHOOTING.md)
3. 联系 Expo 支持：https://expo.dev/contact

---

**现在就开始提交**：

```bash
cd baby-beats-app
eas submit --platform ios
```

祝您提交顺利！🚀


