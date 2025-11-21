# BabyBeats 本地开发指南

## 🎯 本地开发完整流程

### 前置条件

✅ 已安装：
- Node.js (v18+)
- Xcode (最新版)
- CocoaPods
- iOS 开发设备（已通过 USB 连接到 Mac）

---

## 📱 本地开发步骤

### 方法 1：使用 Expo CLI（推荐）✨

这是最简单和推荐的方式，会自动处理所有事情：

```bash
cd /Users/zhuchiyu/Documents/projects/BabyBeats/baby-beats-app
npx expo run:ios --device
```

**功能：**
- ✅ 自动启动 Metro bundler
- ✅ 自动构建应用
- ✅ 自动安装到连接的设备
- ✅ 支持热更新

**首次运行需要时间：**
- 编译时间：约 2-5 分钟
- 之后的增量构建会快很多

---

### 方法 2：手动启动 Metro + Xcode

如果需要更多控制，可以手动操作：

#### 步骤 1：启动 Metro Bundler

在**第一个终端窗口**运行：

```bash
cd /Users/zhuchiyu/Documents/projects/BabyBeats/baby-beats-app
npx expo start --dev-client
```

保持这个终端窗口运行！你会看到：

```
Metro waiting on exp://192.168.x.x:8081
```

#### 步骤 2：使用 Xcode 运行

1. 打开 Xcode 项目：
   ```bash
   open ios/BabyBeats.xcworkspace
   ```

2. 在 Xcode 中：
   - 选择你的设备（Frank's iPhone）
   - 点击运行按钮 ▶️

---

## 🔄 日常开发流程

### 启动开发环境

**选择 A：一键启动（推荐）**

```bash
cd baby-beats-app
npx expo run:ios --device
```

**选择 B：分步启动**

```bash
# 终端 1：启动服务器
cd baby-beats-app
npx expo start

# 在 Xcode 中运行应用
```

---

## 🛠️ 修复常见问题

### 问题 1：Cannot find native module 'ExponentImagePicker'

**解决方案：重新预构建**

```bash
cd baby-beats-app
npx expo prebuild --clean
cd ios
pod install
```

### 问题 2：白屏或 JS bundle 未加载

**解决方案：确保 Metro bundler 运行**

```bash
# 检查服务器是否运行
lsof -ti:8081

# 如果没有运行，启动它
cd baby-beats-app
npx expo start
```

### 问题 3：Xcode 构建失败

**解决方案：清理并重新构建**

```bash
cd baby-beats-app/ios
xcodebuild clean -workspace BabyBeats.xcworkspace -scheme BabyBeats
```

然后在 Xcode 中：
- Product → Clean Build Folder (`⌘⇧K`)
- Product → Build (`⌘B`)

### 问题 4：Pods 安装失败

**解决方案：重新安装依赖**

```bash
cd baby-beats-app/ios
rm -rf Pods Podfile.lock
pod install
```

### 问题 5：设备无法安装

**确保：**
- ✅ 设备已通过 USB 连接
- ✅ 设备已解锁
- ✅ 设备信任此电脑
- ✅ 设备 UDID 已注册到开发者账号

**检查设备连接：**

```bash
xcrun xctrace list devices | grep -i iphone
```

应该看到：
```
Frank's iphone (26.0.1) (00008120-00143CEC0261A01E)
```

---

## 📦 完整重置流程

如果遇到无法解决的问题，执行完整重置：

```bash
cd /Users/zhuchiyu/Documents/projects/BabyBeats/baby-beats-app

# 1. 清理所有构建产物
rm -rf ios/build
rm -rf ios/Pods
rm -rf ios/Podfile.lock
rm -rf node_modules
rm -rf .expo

# 2. 重新安装依赖
npm ci

# 3. 重新预构建
npx expo prebuild --clean

# 4. 安装 iOS 依赖
cd ios
pod install

# 5. 启动应用
cd ..
npx expo run:ios --device
```

---

## 🎨 开发体验优化

### 启用快速刷新

默认已启用，修改代码后自动刷新。

### 开发菜单

在应用运行时：
- **iOS 设备**：摇晃设备
- **iOS 模拟器**：`⌘D`

开发菜单选项：
- Reload：重新加载 JS
- Debug：启用远程调试
- Show Inspector：查看元素
- Performance Monitor：性能监控

### 日志查看

**Metro Bundler 日志：**
在启动 Metro 的终端窗口查看

**Native 日志：**
在 Xcode 底部的 Console 查看

**设备日志：**
```bash
# 实时查看设备日志
xcrun devicectl device info log --device 00008120-00143CEC0261A01E
```

---

## 🔧 项目结构

```
baby-beats-app/
├── App.tsx                 # 应用入口
├── app.json               # Expo 配置
├── package.json           # 依赖管理
├── eas.json              # EAS Build 配置
├── ios/                  # iOS native 代码
│   ├── BabyBeats.xcworkspace  # Xcode 工作空间
│   └── Podfile           # CocoaPods 配置
├── src/
│   ├── components/       # UI 组件
│   ├── screens/          # 页面
│   ├── services/         # 业务逻辑
│   ├── database/         # SQLite 数据库
│   ├── store/           # 状态管理
│   └── types/           # TypeScript 类型
└── assets/              # 静态资源
```

---

## 📝 开发注意事项

### 1. 数据存储

当前使用 **SQLite 本地存储**，数据保存在设备上：

```typescript
// 数据库位置
import { getDatabase } from './src/database';
const db = await getDatabase();
```

### 2. 后端 API

应用会尝试连接后端 API：

```typescript
// src/services/api/client.ts
API_BASE_URL: 'http://192.168.31.221:3000/api/v1'
```

**如果后端未运行：**
- ✅ 应用仍可正常使用
- ✅ 数据保存在本地 SQLite
- ❌ 同步功能不可用

### 3. 图片选择器

使用 `expo-image-picker`：

```typescript
import * as ImagePicker from 'expo-image-picker';

// 请求权限
const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

// 选择图片
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  quality: 1,
});
```

### 4. 循环依赖警告

应用启动时会看到这些警告：

```
Require cycle: src/services/feedingService.ts -> src/services/syncManager.ts -> src/services/feedingService.ts
```

**这些是警告，不是错误：**
- ⚠️ 不会导致崩溃
- ⚠️ 可能影响代码质量
- ✅ 应用可正常运行

**稍后优化：**
重构服务层，解除循环依赖。

---

## 🚀 构建生产版本

### 开发版 vs 生产版

| 特性 | 开发版（Debug） | 生产版（Release） |
|------|----------------|------------------|
| Metro bundler | 需要 | 不需要 |
| 代码优化 | 否 | 是 |
| 调试信息 | 完整 | 最小 |
| 性能 | 慢 | 快 |
| 文件大小 | 大 | 小 |

### 本地构建 Release 版本

```bash
cd baby-beats-app

# 构建 Release 配置
npx expo run:ios --device --configuration Release
```

### 使用 EAS Build（云构建）

```bash
# Preview 版（可直接安装）
eas build --platform ios --profile preview

# Production 版（用于 TestFlight/App Store）
eas build --platform ios --profile production
```

---

## 🔐 开发者账号相关

### 签名配置

**自动管理（推荐）：**

Xcode 会自动管理签名：
- Xcode → Signing & Capabilities
- Team: CHIYU ZHU (MP998ALN94)
- ✅ Automatically manage signing

**手动管理：**

如果使用 EAS Build：

```bash
# 配置凭证
eas credentials

# 选择：iOS → Manage credentials
```

### 设备注册

**当前已注册设备：**
- Frank's iPhone (00008120-00143CEC0261A01E)
- Mac mini (00006040-001E51682E20801C)

**添加新设备：**

```bash
eas device:create
```

或访问：https://developer.apple.com/account/resources/devices/list

---

## 📊 性能优化建议

### 1. 减少重新渲染

使用 `React.memo` 和 `useMemo`：

```typescript
const MemoizedComponent = React.memo(MyComponent);

const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);
```

### 2. 优化列表渲染

使用 `FlatList` 而不是 `ScrollView`：

```typescript
<FlatList
  data={items}
  renderItem={({ item }) => <ItemComponent item={item} />}
  keyExtractor={item => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={10}
/>
```

### 3. 图片优化

控制图片质量和尺寸：

```typescript
await ImagePicker.launchImageLibraryAsync({
  quality: 0.8,  // 80% 质量
  aspect: [4, 3],
  allowsEditing: true,
});
```

---

## 🧪 测试

### 单元测试

```bash
npm test
```

### E2E 测试

考虑使用：
- Detox
- Appium

---

## 📚 相关文档

- [Expo 文档](https://docs.expo.dev/)
- [React Native 文档](https://reactnative.dev/)
- [EAS Build 文档](https://docs.expo.dev/build/introduction/)
- [iOS 开发文档](https://developer.apple.com/documentation/)

---

## 🆘 获取帮助

### 检查日志

```bash
# Metro bundler 日志
# 在启动 Metro 的终端查看

# Xcode 日志
# Xcode → View → Debug Area → Show Debug Area

# 设备日志
xcrun devicectl device info log --device 00008120-00143CEC0261A01E
```

### 常用调试命令

```bash
# 检查 Metro bundler
lsof -ti:8081

# 列出设备
xcrun xctrace list devices

# 检查 pods 版本
cd ios && pod --version

# 检查 Expo CLI 版本
npx expo --version

# 检查 Node 版本
node --version
```

---

## ✅ 成功标志

当你看到以下内容时，说明环境配置成功：

**终端输出：**
```
✓ Metro bundler running on exp://192.168.x.x:8081
✓ Build succeeded
✓ Installed BabyBeats on Frank's iPhone
```

**应用运行：**
- ✅ 应用启动无白屏
- ✅ 可以添加宝宝信息
- ✅ 可以记录喂养/睡眠等数据
- ✅ 数据持久化（重启应用后仍在）
- ✅ 图片选择器正常工作

---

## 🎉 开始开发

现在你已经准备好开始开发了！

**推荐工作流：**

1. **启动开发服务器**
   ```bash
   cd baby-beats-app
   npx expo start
   ```

2. **在 Xcode 中运行应用**
   - 选择设备
   - 点击运行

3. **修改代码**
   - 编辑 `src/` 下的文件
   - 保存后自动刷新

4. **测试功能**
   - 在真机上测试
   - 查看日志

5. **提交代码**
   ```bash
   git add .
   git commit -m "feat: 添加新功能"
   git push
   ```

祝你开发愉快！🚀


