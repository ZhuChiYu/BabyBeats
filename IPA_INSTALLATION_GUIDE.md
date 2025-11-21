# iOS IPA 安装指南

## 问题：Production IPA 无法直接安装到真机

### 错误信息
```
Failed to install embedded profile for com.babybeats.app : 0xe800801f 
(Attempted to install a Beta profile without the proper entitlement.)
```

### 原因分析

使用 `production` profile 构建的 IPA 使用 **App Store Distribution** 证书和配置文件，只能通过以下方式安装：
- ✅ TestFlight
- ✅ App Store

**不能**通过以下方式安装：
- ❌ Xcode 直接安装
- ❌ 拖拽到 Apple Configurator
- ❌ 第三方安装工具（如爱思助手）

---

## 解决方案

### 方案 1：使用 Preview 构建（推荐用于开发测试）

#### 1. 重新构建
```bash
cd baby-beats-app
eas build --platform ios --profile preview
```

#### 2. 下载并安装
```bash
# 下载完成后，通过以下任一方式安装：

# 方式 A：使用 Xcode
# Xcode → Window → Devices and Simulators → 选择设备 → 拖拽 IPA

# 方式 B：使用命令行
xcrun devicectl device install app --device <DEVICE_ID> path/to/app.ipa
```

#### Preview Profile 特点
- ✅ 使用 Ad Hoc 或 Development 分发方式
- ✅ 可以直接安装到已注册的设备
- ✅ 不需要通过 TestFlight
- ✅ 适合快速迭代测试
- ⚠️ 需要设备 UDID 注册到开发者账号

### 方案 2：通过 TestFlight 安装 Production 构建

#### 1. 提交到 App Store Connect
```bash
eas submit --platform ios --latest
```

#### 2. 等待处理
- 提交通常需要 5-15 分钟
- 可以在 [EAS Dashboard](https://expo.dev/accounts/zhuchiyu/projects/baby-beats-app/submissions) 查看状态

#### 3. TestFlight 安装

**内部测试（Internal Testing）：**
1. 登录 [App Store Connect](https://appstoreconnect.apple.com)
2. 选择应用 → TestFlight
3. 在 **Internal Testing** 添加测试人员（最多 100 人）
4. 测试人员会收到邮件邀请
5. 安装 TestFlight App 即可测试

**外部测试（External Testing）：**
1. App Store Connect → TestFlight → External Testing
2. 创建测试组并添加构建版本
3. 需要通过 Beta App 审核（通常 24-48 小时）
4. 可以邀请最多 10,000 名测试人员
5. 可以生成公开链接

---

## 构建配置对比

### eas.json 配置说明

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",      // 内部分发
      "ios": {
        "simulator": true              // 支持模拟器
      }
    },
    "preview": {
      "distribution": "internal",      // 内部分发（可直接安装）
      "ios": {
        "simulator": false,
        "buildConfiguration": "Release"
      }
    },
    "production": {
      "distribution": "store",         // App Store 分发（仅 TestFlight/App Store）
      "ios": {
        "buildConfiguration": "Release"
      }
    }
  }
}
```

### 三种配置对比

| 特性 | Development | Preview | Production |
|------|------------|---------|-----------|
| **分发类型** | Internal | Internal | Store |
| **证书类型** | Development | Ad Hoc/Enterprise | App Store |
| **安装方式** | Xcode 直接安装 | Xcode 直接安装 | TestFlight/App Store |
| **设备限制** | 需要 UDID | 需要 UDID | 无限制 |
| **用途** | 开发调试 | 内部测试 | 正式发布 |
| **构建速度** | 快 | 中 | 慢 |
| **模拟器支持** | ✅ | ❌ | ❌ |

---

## 推荐工作流程

### 阶段 1：开发调试
```bash
# 使用 preview 构建进行真机测试
eas build --platform ios --profile preview
```
- 快速构建
- 直接安装到测试设备
- 快速迭代

### 阶段 2：内部测试
```bash
# 使用 production 构建 + TestFlight 内部测试
eas build --platform ios --profile production
eas submit --platform ios --latest
```
- 通过 TestFlight 分发给团队
- 模拟真实 App Store 环境
- 收集内部反馈

### 阶段 3：公开测试
- TestFlight 外部测试
- 邀请真实用户测试
- 需要通过 Beta 审核

### 阶段 4：正式发布
- App Store Connect 提交审核
- 通过审核后发布
- 版本更新

---

## 常见问题

### Q1: Preview 构建需要注册设备 UDID 吗？
**A**: 是的，使用 `internal` 分发需要设备注册。EAS 会自动管理这个过程：
- 首次安装时，EAS 会注册设备
- 自动更新 Provisioning Profile
- 无需手动操作

### Q2: 我可以直接把 Preview IPA 发给朋友测试吗？
**A**: 不行。Preview 构建使用 Ad Hoc 分发，只能安装到已注册的设备。如果要分发给其他人：
- 使用 TestFlight（推荐）
- 或者使用 Enterprise 账号（需要 $299/年）

### Q3: 为什么 Production 构建不能直接安装？
**A**: 这是 Apple 的安全机制：
- App Store Distribution 证书只能用于 TestFlight 和 App Store
- 防止未经审核的应用直接分发
- 保证用户安全

### Q4: 如何查看设备 UDID？
**方法 1 - Xcode:**
```
Xcode → Window → Devices and Simulators → 选择设备 → Identifier
```

**方法 2 - 命令行:**
```bash
xcrun xctrace list devices
```

**方法 3 - 系统信息:**
```
关于本机 → 系统报告 → 硬件 → USB → iPhone
```

### Q5: Preview 和 Production 构建的代码有区别吗？
**A**: 代码相同，但：
- 使用不同的证书和配置文件
- 不同的分发方式
- 可能有不同的环境变量（如果配置了）

---

## 注册设备到 Apple Developer

### 自动注册（通过 EAS）
EAS 会自动注册设备，无需手动操作：
1. 构建 preview 版本
2. 下载 IPA 并尝试安装
3. 如果设备未注册，EAS 会提示
4. 按照提示完成注册

### 手动注册
1. 登录 [Apple Developer](https://developer.apple.com/account/resources/devices/list)
2. Devices → 点击 "+" 按钮
3. 输入设备名称和 UDID
4. 重新构建应用（Provisioning Profile 会自动更新）

---

## 故障排除

### 错误：设备未注册
```
The device is not registered as a test device
```

**解决：**
```bash
# 方式 1：使用 EAS 自动注册
eas device:create

# 方式 2：手动在 Apple Developer 网站注册
# 然后重新构建
eas build --platform ios --profile preview --clear-cache
```

### 错误：证书已过期
```
Code signing certificate has expired
```

**解决：**
```bash
# 清除本地证书缓存
eas credentials

# 选择 iOS → Distribution Certificate → Remove
# 然后重新构建，EAS 会生成新证书
eas build --platform ios --profile preview
```

### 错误：配置文件不匹配
```
Provisioning profile doesn't include signing certificate
```

**解决：**
```bash
# 清除缓存并重新构建
eas build --platform ios --profile preview --clear-cache
```

---

## 最佳实践

### 1. 开发阶段
- ✅ 使用 `preview` profile
- ✅ 直接安装到测试设备
- ✅ 快速迭代

### 2. 测试阶段
- ✅ 使用 `production` profile
- ✅ 通过 TestFlight 分发
- ✅ 内部测试完成后再进行外部测试

### 3. 发布阶段
- ✅ 使用 `production` profile
- ✅ 通过 App Store Connect 提交
- ✅ 完成 App Review

### 4. 版本管理
```bash
# 每次发布前更新版本号
# baby-beats-app/app.json
{
  "expo": {
    "version": "1.0.1",  // 更新版本号
    "ios": {
      "buildNumber": "2"  // 更新构建号
    }
  }
}
```

---

## 相关链接

- [EAS Build 文档](https://docs.expo.dev/build/introduction/)
- [App Store Connect](https://appstoreconnect.apple.com)
- [TestFlight 文档](https://developer.apple.com/testflight/)
- [Apple Developer Portal](https://developer.apple.com/account/)
- [EAS Dashboard](https://expo.dev/accounts/zhuchiyu/projects/baby-beats-app)

---

## 总结

记住这个简单规则：

**想直接安装到真机？用 `preview`**
```bash
eas build --platform ios --profile preview
```

**要发布或通过 TestFlight 测试？用 `production`**
```bash
eas build --platform ios --profile production
eas submit --platform ios --latest
```

这样就不会再遇到安装问题了！ 🎉


