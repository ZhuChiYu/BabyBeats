# 设备注册和安装步骤

## 你的设备信息

根据系统扫描，你有以下设备：

1. **Frank's iphone** (iOS 26.0.1)
   - UDID: `00008120-00143CEC0261A01E` ⭐ **主要设备**
   
2. **Frank的iPhone** (iOS 18.4)
   - UDID: `00008110-001E79A82653601E`

---

## 完整操作流程

### 步骤 1：注册设备（3 种方法任选其一）

#### 方法 A：使用 EAS CLI 自动注册（最简单）✨

```bash
cd /Users/zhuchiyu/Documents/projects/BabyBeats/baby-beats-app
eas device:create
```

**按照提示输入：**
1. Would you like to use the zhuchiyu account? → **Yes**
2. Apple ID: → **zhu.cy@outlook.com**
3. 输入 Apple ID 密码
4. 选择 Team: → **CHIYU ZHU (MP998ALN94)**
5. Device Name: → **Frank's iPhone**
6. UDID: → **00008120-00143CEC0261A01E**

#### 方法 B：通过 Apple Developer 网站手动注册

1. 访问：https://developer.apple.com/account/resources/devices/list
2. 登录：zhu.cy@outlook.com
3. 点击左侧 **Devices**
4. 点击 **+** 按钮
5. 选择平台：**iOS, tvOS, watchOS**
6. 填写：
   - Device Name: `Frank's iPhone`
   - UDID: `00008120-00143CEC0261A01E`
7. 点击 **Continue** → **Register**

#### 方法 C：通过 App Store Connect 注册

1. 访问：https://appstoreconnect.apple.com
2. 登录后，选择 **My Apps** → **BabyBeats**
3. 点击 **TestFlight** 标签
4. 点击左侧 **Testers** → **Internal Testers**
5. 点击 **+** 添加测试人员
6. 输入邮箱（和 Apple ID 关联的邮箱）

---

### 步骤 2：重新构建应用

注册设备后，**必须重新构建**才能生成包含新设备的 Provisioning Profile：

```bash
cd /Users/zhuchiyu/Documents/projects/BabyBeats/baby-beats-app
eas build --platform ios --profile preview --clear-cache
```

**重要参数说明：**
- `--profile preview`：使用 internal distribution（可直接安装）
- `--clear-cache`：清除缓存，强制生成新的 Provisioning Profile

**构建时间：**
- 预计 10-15 分钟
- 可以在 https://expo.dev/accounts/zhuchiyu/projects/baby-beats-app/builds 查看进度

---

### 步骤 3：下载并安装 IPA

#### 方法 A：通过 EAS Dashboard 下载

1. 构建完成后，访问：  
   https://expo.dev/accounts/zhuchiyu/projects/baby-beats-app/builds

2. 找到最新的 **preview** 构建

3. 点击 **Download** 按钮

4. 下载 `.ipa` 文件到 Downloads 文件夹

#### 方法 B：使用命令行下载

```bash
# EAS CLI 会显示下载链接
# 或者手动从 Dashboard 复制链接
wget -O ~/Downloads/BabyBeats-preview.ipa "下载链接"
```

---

### 步骤 4：安装到真机

#### 方法 A：使用 Xcode（推荐）

1. **连接 iPhone 到 Mac**

2. **打开 Xcode**
   ```bash
   open -a Xcode
   ```

3. **打开设备窗口**
   - Xcode 菜单 → **Window** → **Devices and Simulators**
   - 或按快捷键：`⌘⇧2`

4. **选择你的设备**
   - 左侧选择 **Frank's iPhone**
   - 确认设备已连接和信任

5. **安装应用**
   - 在 **Installed Apps** 区域
   - 点击 **+** 按钮
   - 选择下载的 `.ipa` 文件
   - 或直接拖拽 `.ipa` 到设备窗口

6. **等待安装完成**

#### 方法 B：使用命令行

```bash
# 1. 获取设备 ID
xcrun devicectl list devices

# 2. 安装应用（替换 DEVICE_ID）
xcrun devicectl device install app \
  --device 00008120-00143CEC0261A01E \
  ~/Downloads/application-*.ipa
```

#### 方法 C：使用 ios-deploy

```bash
# 安装 ios-deploy（如果还没安装）
npm install -g ios-deploy

# 安装应用
ios-deploy --bundle ~/Downloads/application-*.ipa
```

---

## 常见问题排查

### 问题 1：设备未信任

**错误：** `"不受信任的开发者"`

**解决：**
1. iPhone 上：设置 → 通用 → VPN与设备管理
2. 找到 **CHIYU ZHU** 开发者证书
3. 点击 **信任**

### 问题 2：设备未注册

**错误：** `The device is not registered as a test device`

**解决：**
- 确认设备已在 https://developer.apple.com/account/resources/devices/list 注册
- 重新构建应用（使用 `--clear-cache`）

### 问题 3：Provisioning Profile 不匹配

**错误：** `No provisioning profile matches`

**解决：**
```bash
# 清除 EAS 凭证缓存
eas credentials

# 选择：
# iOS → Remove all credentials

# 重新构建
eas build --platform ios --profile preview --clear-cache
```

### 问题 4：构建失败

**错误：** Network issues during build

**解决：**
1. 检查 `.npmrc` 和 `.easignore` 文件是否正确
2. 重试构建：
```bash
eas build --platform ios --profile preview
```

### 问题 5：安装时提示 "Unable to Install"

**错误：** `Attempted to install a Beta profile without the proper entitlement`

**原因：** 使用了 `production` profile 而不是 `preview`

**解决：** 使用 `preview` profile 重新构建：
```bash
eas build --platform ios --profile preview
```

---

## 验证步骤

### 1. 验证设备已注册

**方法 A - Apple Developer 网站：**
1. 访问：https://developer.apple.com/account/resources/devices/list
2. 登录后，在列表中查找 `00008120-00143CEC0261A01E`
3. 确认状态为 **Enabled**

**方法 B - 命令行：**
```bash
eas device:list
```

### 2. 验证 Provisioning Profile

在构建日志中查找：
```
✓ Provisioning Profile created
  - Devices: 1 device(s) registered
  - UDID: 00008120-00143CEC0261A01E
```

### 3. 验证构建配置

检查 `eas.json`：
```bash
cat baby-beats-app/eas.json | grep -A 10 preview
```

应该显示：
```json
"preview": {
  "distribution": "internal",  // ✅ 正确
  "ios": {
    "simulator": false,
    "buildConfiguration": "Release"
  }
}
```

---

## 快速命令参考

### 注册设备
```bash
eas device:create
```

### 查看已注册设备
```bash
eas device:list
```

### 构建 Preview 版本
```bash
cd baby-beats-app
eas build --platform ios --profile preview --clear-cache
```

### 查看构建状态
```bash
eas build:list --platform ios
```

### 查看设备 UDID
```bash
xcrun xctrace list devices | grep -i iphone
```

### 安装到设备
```bash
xcrun devicectl device install app \
  --device 00008120-00143CEC0261A01E \
  path/to/app.ipa
```

---

## 完整流程总结

```bash
# 1. 注册设备
cd /Users/zhuchiyu/Documents/projects/BabyBeats/baby-beats-app
eas device:create
# 输入：Frank's iPhone, UDID: 00008120-00143CEC0261A01E

# 2. 重新构建
eas build --platform ios --profile preview --clear-cache

# 3. 等待构建完成（10-15 分钟）

# 4. 下载 IPA
# 访问：https://expo.dev/accounts/zhuchiyu/projects/baby-beats-app/builds

# 5. 安装到设备
# 使用 Xcode: Window → Devices and Simulators → 拖拽 IPA
```

---

## 重要提醒

### ⚠️ 使用 Preview Profile
- ✅ 用于真机直接安装测试
- ✅ 需要注册设备 UDID
- ✅ 适合开发和内部测试

### ⚠️ 使用 Production Profile
- ✅ 用于 TestFlight 和 App Store
- ❌ **不能**直接安装到真机
- ✅ 适合正式发布流程

### ⚠️ 重新构建的必要性
每次添加新设备后，**必须重新构建**应用：
- Provisioning Profile 需要包含新设备
- 使用 `--clear-cache` 确保生成新的 Profile
- 旧的构建无法安装到新注册的设备

---

## 相关文档

- `IOS_DEPLOYMENT_GUIDE.md` - iOS 部署完整指南
- `IPA_INSTALLATION_GUIDE.md` - IPA 安装详细说明
- `BUILD_TROUBLESHOOTING.md` - 构建问题排查
- `SUBMIT_TO_APPSTORE.md` - App Store 提交指南

---

## 技术支持

如果遇到问题：

1. **查看 EAS 构建日志**  
   https://expo.dev/accounts/zhuchiyu/projects/baby-beats-app/builds

2. **查看 Apple Developer 设备列表**  
   https://developer.apple.com/account/resources/devices/list

3. **检查凭证配置**
   ```bash
   eas credentials
   ```

4. **重置凭证（最后手段）**
   ```bash
   eas credentials
   # 选择 iOS → Remove all credentials
   # 然后重新构建
   ```

---

## 成功标志

当你看到以下内容时，说明成功了：

✅ **设备已注册**
```
✓ Device registered: Frank's iPhone (00008120-00143CEC0261A01E)
```

✅ **构建成功**
```
✓ Build finished
  Platform: iOS
  Profile: preview
  Download: [URL]
```

✅ **安装成功**
- 设备上显示 BabyBeats 应用图标
- 可以正常启动应用
- 没有 "不受信任的开发者" 警告

---

祝你好运！🎉


