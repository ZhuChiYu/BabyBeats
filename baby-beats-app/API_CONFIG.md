# 前端 API 配置说明

## 📍 API 地址配置

前端应用的 API 地址配置位于：
```
baby-beats-app/src/services/api/apiClient.ts
```

## 🌐 可用的 API 服务器

### 1. 腾讯云生产服务器（推荐）

**使用域名（推荐）：**
```typescript
return 'https://englishpartner.cn/api/v1';
```

**使用 IP 地址：**
```typescript
return 'http://111.230.110.95:3000/api/v1';
```

### 2. 本地开发服务器

**iOS 模拟器：**
```typescript
return 'http://192.168.31.221:3000/api/v1';  // 使用你的局域网 IP
```

**Android 模拟器：**
```typescript
return 'http://10.0.2.2:3000/api/v1';  // Android 特殊 IP
```

**真机调试：**
```typescript
return 'http://YOUR_COMPUTER_IP:3000/api/v1';  // 使用电脑的局域网 IP
```

## 🔧 如何修改配置

### 方式 1: 直接修改代码（当前方式）

编辑 `apiClient.ts` 文件：

```typescript
const getApiUrl = () => {
  if (!__DEV__) {
    // 生产环境
    return 'https://englishpartner.cn/api/v1';
  }
  
  // 开发环境
  return 'http://192.168.31.221:3000/api/v1';
};
```

### 方式 2: 使用环境变量（推荐）

1. 创建 `.env` 文件：
```bash
# 开发环境
API_URL=http://192.168.31.221:3000/api/v1

# 生产环境
# API_URL=https://englishpartner.cn/api/v1
```

2. 安装依赖：
```bash
npm install react-native-dotenv
```

3. 配置 babel.config.js：
```javascript
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
    }]
  ]
};
```

4. 修改 apiClient.ts：
```typescript
import { API_URL } from '@env';

const getApiUrl = () => {
  return API_URL || 'http://localhost:3000/api/v1';
};
```

## 🎯 不同场景的配置

### 场景 1: 本地开发

```typescript
// 开发环境
if (Platform.OS === 'android') {
  return 'http://10.0.2.2:3000/api/v1';
} else {
  return 'http://192.168.31.221:3000/api/v1';
}
```

### 场景 2: 真机测试（连接本地服务器）

```typescript
// 获取你的电脑 IP
// macOS/Linux: ifconfig | grep "inet "
// Windows: ipconfig

return 'http://YOUR_COMPUTER_IP:3000/api/v1';
```

### 场景 3: 测试腾讯云服务器

```typescript
// 开发和生产都使用腾讯云
return 'http://111.230.110.95:3000/api/v1';
```

### 场景 4: 生产发布

```typescript
// 使用域名和 HTTPS
return 'https://englishpartner.cn/api/v1';
```

## ⚠️ 注意事项

1. **开发环境注意**：
   - iOS 模拟器不能使用 `localhost`
   - Android 模拟器使用 `10.0.2.2` 代替 `localhost`
   - 真机需要使用局域网 IP

2. **生产环境注意**：
   - 优先使用 HTTPS
   - 使用域名而非 IP 地址
   - 确保防火墙和安全组配置正确

3. **网络问题排查**：
   - 检查设备 WiFi 连接
   - 检查后端服务器是否运行
   - 检查防火墙配置
   - 查看应用日志（`console.log` 会显示实际使用的 API URL）

## 🧪 测试 API 连接

### 1. 在应用启动时查看日志

应用启动时会自动打印 API 地址：
```
📍 API Base URL: http://111.230.110.95:3000/api/v1
```

### 2. 使用浏览器测试

```bash
# 健康检查
http://111.230.110.95:3000/health

# 应该返回
{"status":"ok","timestamp":"..."}
```

### 3. 使用 curl 测试

```bash
# 健康检查
curl http://111.230.110.95:3000/health

# 注册测试
curl -X POST http://111.230.110.95:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456","name":"Test"}'
```

## 🔄 切换环境的步骤

### 从本地切换到腾讯云

1. 修改 `apiClient.ts`：
```typescript
// 生产环境
if (!__DEV__) {
  return 'https://englishpartner.cn/api/v1';  // ✅ 已配置
}

// 开发环境也使用腾讯云
return 'http://111.230.110.95:3000/api/v1';  // ✅ 修改这里
```

2. 重新构建应用：
```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

### 从腾讯云切换到本地

1. 确保本地后端服务正在运行
2. 修改 API 地址为本地地址
3. 重新构建应用

## 📱 当前配置

当前前端配置为：

**生产环境（`!__DEV__`）：**
```
https://englishpartner.cn/api/v1
```

**开发环境：**
- iOS: `http://192.168.31.221:3000/api/v1`
- Android: `http://10.0.2.2:3000/api/v1`

## 🎯 快速切换到腾讯云

如果想在开发环境也使用腾讯云服务器，在 `apiClient.ts` 中找到这段代码并取消注释：

```typescript
// 开发环境也使用腾讯云服务器（取消下面的注释）
return 'http://111.230.110.95:3000/api/v1';
```

注释掉原来的本地开发配置即可。

## 📚 相关文档

- 腾讯云部署文档: `TENCENT_CLOUD_DEPLOYMENT.md`
- 部署命令速查: `backend/DEPLOYMENT_COMMANDS.md`

