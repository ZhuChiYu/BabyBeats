# 🔧 EAS Build 故障排查指南

## 问题：依赖安装失败 - ENOTFOUND github.com

### 错误信息
```
npm error command sh -c node ./scripts/install-skia.mjs
npm error Error: getaddrinfo ENOTFOUND github.com
```

### 原因分析
这是 EAS 构建服务器网络问题，无法访问 GitHub 下载 `@shopify/react-native-skia` 的预构建文件。
该包是通过以下依赖引入的：
- `victory-native` (图表库)
- `react-native-chart-kit` (图表库)

### 解决方案

#### 方案 1：重试构建（最简单） ⭐ 推荐

网络问题通常是暂时的，等待 5-10 分钟后重试：

```bash
# 重新构建
eas build --platform ios --profile preview
```

#### 方案 2：使用构建缓存

已更新 `eas.json` 启用缓存：

```json
{
  "preview": {
    "cache": {
      "disabled": false
    }
  }
}
```

#### 方案 3：增加网络重试配置

已创建 `.npmrc` 文件，增加网络超时和重试次数：

```
fetch-retries=5
fetch-retry-mintimeout=20000
fetch-retry-maxtimeout=120000
```

#### 方案 4：本地构建（如果有 Mac）

如果有 Mac 电脑，可以本地构建：

```bash
# 本地构建
npx expo run:ios --configuration Release

# 或使用 EAS 本地构建
eas build --platform ios --profile preview --local
```

#### 方案 5：移除图表库（不推荐）

如果急需构建且不需要图表功能：

```bash
# 移除图表库
npm uninstall react-native-chart-kit victory-native

# 但需要删除所有使用图表的代码
# 不推荐，因为会破坏统计功能
```

---

## 其他常见构建错误

### 1. "cli.appVersionSource" 警告

**警告信息**：
```
The field "cli.appVersionSource" is not set, but it will be required in the future
```

**解决方案**：
已在 `eas.json` 中添加：
```json
{
  "cli": {
    "appVersionSource": "remote"
  }
}
```

### 2. Bundle Identifier 被忽略

**警告信息**：
```
Specified value for "ios.bundleIdentifier" in app.json is ignored because an ios directory was detected
```

**解释**：
- 这是正常的，因为项目有 `ios/` 原生目录
- EAS 会使用原生代码中的 Bundle ID
- 不影响构建

**验证**：
```bash
# 检查原生代码中的 Bundle ID
grep -r "PRODUCT_BUNDLE_IDENTIFIER" ios/
```

### 3. 推送通知配置

**提示信息**：
```
Would you like to set up Push Notifications for your project?
```

**解决方案**：
已在 `eas.json` 中配置不再提示：
```json
{
  "cli": {
    "promptToConfigurePushNotifications": false
  }
}
```

如需使用推送通知，手动配置：
```bash
eas credentials
# 选择 Push Notifications 配置
```

### 4. TypeScript 编译错误

**错误信息**：
```
error TS2322: Type 'X' is not assignable to type 'Y'
```

**解决方案**：
```bash
# 本地检查 TypeScript
npx tsc --noEmit

# 修复错误后重新构建
```

### 5. 依赖版本冲突

**错误信息**：
```
npm error ERESOLVE unable to resolve dependency tree
```

**解决方案**：
```bash
# 清理并重装
rm -rf node_modules package-lock.json
npm install

# 或使用 --legacy-peer-deps
npm install --legacy-peer-deps
```

---

## 推荐的构建流程

### 首次构建

```bash
# 1. 清理环境
cd baby-beats-app
rm -rf node_modules .expo
npm install

# 2. 本地验证
npm start  # 确保应用能正常启动

# 3. 配置证书（首次）
eas credentials

# 4. 开始构建
eas build --platform ios --profile preview

# 5. 如果失败，等待 5-10 分钟后重试
```

### 后续构建

```bash
# 直接构建
eas build --platform ios --profile preview

# 如遇网络问题，重试即可
```

---

## 构建状态监控

### 查看构建日志

```bash
# 查看最新构建
eas build:list --platform ios

# 查看特定构建的详细日志
eas build:view [build-id]
```

### 在线查看

访问 EAS Build Dashboard：
```
https://expo.dev/accounts/[username]/projects/baby-beats-app/builds
```

可以看到：
- 构建进度
- 详细日志
- 错误信息
- 构建时间

---

## 预防措施

### 1. 在本地验证

构建前确保本地运行正常：

```bash
# iOS 模拟器
npm run ios

# Android 模拟器
npm run android

# Web 浏览器
npm run web
```

### 2. 检查依赖

```bash
# 检查过时的依赖
npm outdated

# 检查安全漏洞
npm audit
```

### 3. 使用 .gitignore

确保不提交：
```
node_modules/
.expo/
.expo-shared/
*.log
.DS_Store
```

### 4. 版本控制

每次构建前：
```bash
# 提交代码
git add .
git commit -m "准备构建 v1.0.0"
git push

# 打标签
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

---

## 网络问题专项

### 如果持续遇到网络问题

#### 方案 A：切换 EAS 服务器区域

在 `eas.json` 中指定区域：
```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "resourceClass": "m-medium"
    }
  }
}
```

#### 方案 B：使用 VPN 或代理

如果是国内网络问题，可以：
1. 等待非高峰时段构建
2. 使用国际网络环境
3. 联系 EAS 支持

#### 方案 C：联系 EAS 支持

如果问题持续：
```
https://expo.dev/contact
```

提供：
- 构建 ID
- 错误日志
- 项目信息

---

## 成功构建的标志

构建成功时会看到：

```
✅ Build finished successfully!

Build artifact:
- https://expo.dev/.../baby-beats-app.ipa

Build details:
- https://expo.dev/accounts/[username]/projects/baby-beats-app/builds/[build-id]
```

然后可以：

```bash
# 下载 IPA
eas build:download --platform ios

# 提交到 App Store
eas submit --platform ios --latest
```

---

## 快速参考

### 常用命令

| 命令 | 用途 |
|------|------|
| `eas build --platform ios --profile preview` | 构建预览版 |
| `eas build --platform ios --profile production` | 构建生产版 |
| `eas build:list` | 查看构建列表 |
| `eas build:view [id]` | 查看构建详情 |
| `eas build:cancel [id]` | 取消构建 |
| `eas build:download` | 下载构建文件 |

### 故障排查步骤

1. ✅ 查看错误日志
2. ✅ 确认网络正常
3. ✅ 等待 5-10 分钟重试
4. ✅ 检查依赖版本
5. ✅ 清理本地缓存
6. ✅ 联系支持

---

## 总结

**当前遇到的网络错误**：
- ✅ 已添加 `appVersionSource` 配置
- ✅ 已启用构建缓存
- ✅ 已创建 `.npmrc` 增加重试
- ⏭️ 建议：等待 5-10 分钟后重试

**推荐操作**：
```bash
# 等待几分钟后重试
eas build --platform ios --profile preview
```

网络问题通常是暂时的，重试即可成功！💪


