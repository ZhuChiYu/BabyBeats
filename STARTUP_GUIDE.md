# 🚀 BabyBeats 项目启动指南

## ✅ 当前运行状态

### 后端服务
- ✅ **PostgreSQL 数据库**: 运行中 (端口 5432)
- ✅ **Node.js API 服务**: 运行中 (端口 3000)
- ✅ **健康检查**: http://localhost:3000/health

### 前端服务
- ✅ **Expo 开发服务器**: 正在启动...

---

## 📱 访问应用

### 方式一：扫描二维码（推荐）

1. 在终端中找到 Expo 生成的二维码
2. 使用手机上的 **Expo Go** 应用扫描二维码
3. 应用将自动加载到你的手机上

**下载 Expo Go:**
- iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
- Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

### 方式二：iOS 模拟器

在另一个终端窗口运行：
```bash
cd /Users/zhuchiyu/Documents/projects/BabyBeats/baby-beats-app
npx expo run:ios
```

### 方式三：Android 模拟器

在另一个终端窗口运行：
```bash
cd /Users/zhuchiyu/Documents/projects/BabyBeats/baby-beats-app
npx expo run:android
```

---

## 🔧 服务管理

### 查看后端日志
```bash
cd /Users/zhuchiyu/Documents/projects/BabyBeats/backend
# 后端服务日志会在启动的终端中显示
```

### 查看数据库日志
```bash
docker logs babybeats-postgres -f
```

### 停止所有服务

**停止 Docker 容器：**
```bash
cd /Users/zhuchiyu/Documents/projects/BabyBeats/backend
docker compose down
```

**停止 Expo 和后端：**
- 在各自的终端窗口按 `Ctrl + C`

---

## 🗄️ 数据库管理

### 直接连接数据库
```bash
docker exec -it babybeats-postgres psql -U postgres -d babybeats
```

### 使用 pgAdmin（可选）

启动 pgAdmin 容器：
```bash
cd /Users/zhuchiyu/Documents/projects/BabyBeats/backend
docker compose --profile tools up -d pgadmin
```

访问：http://localhost:5050
- 用户名：`admin@babybeats.local`
- 密码：`admin123`

---

## 📊 API 端点

### 基础端点
- **健康检查**: http://localhost:3000/health
- **API 版本**: http://localhost:3000/api/v1

### 主要 API
- **认证**: `POST /api/v1/auth/register`, `/api/v1/auth/login`
- **宝宝管理**: `/api/v1/babies`
- **喂养记录**: `/api/v1/feedings`
- **睡眠记录**: `/api/v1/sleeps`
- **尿布记录**: `/api/v1/diapers`
- **挤奶记录**: `/api/v1/pumpings`
- **成长记录**: `/api/v1/growth`
- **疫苗记录**: `/api/v1/vaccines`
- **就医记录**: `/api/v1/medical-visits`
- **用药记录**: `/api/v1/medications`
- **里程碑**: `/api/v1/milestones`
- **数据同步**: `POST /api/v1/sync/pull`, `POST /api/v1/sync/push`

---

## 🧪 测试 API

### 使用 curl
```bash
# 健康检查
curl http://localhost:3000/health

# 注册用户
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "测试用户"
  }'

# 登录
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 使用 Postman 或 Insomnia
导入以下环境变量：
- `BASE_URL`: http://localhost:3000
- `API_VERSION`: v1

---

## 🔄 重启服务

### 重启数据库
```bash
cd /Users/zhuchiyu/Documents/projects/BabyBeats/backend
docker compose restart postgres
```

### 重启后端服务
```bash
# 停止当前后端进程 (Ctrl+C)
cd /Users/zhuchiyu/Documents/projects/BabyBeats/backend
npm run dev
```

### 重启 Expo
```bash
# 停止当前 Expo 进程 (Ctrl+C)
cd /Users/zhuchiyu/Documents/projects/BabyBeats/baby-beats-app
npx expo start
```

---

## 🆕 新功能测试清单

### 1. 健康管理功能
- [ ] 添加体温记录
- [ ] 查看体温列表和趋势图
- [ ] 添加疫苗记录（测试提醒功能）
- [ ] 添加就医记录
- [ ] 添加用药记录（测试用药提醒）

### 2. 里程碑功能
- [ ] 从"成长"Tab进入里程碑时间轴
- [ ] 添加不同类别的里程碑
- [ ] 上传照片到里程碑
- [ ] 查看时间轴展示

### 3. 快速记录
- [ ] 使用快捷菜单记录体温
- [ ] 使用快捷菜单添加里程碑
- [ ] 使用快捷菜单记录用药
- [ ] 使用快捷菜单记录就医

### 4. 通知提醒
- [ ] 添加疫苗并设置提醒
- [ ] 添加用药并设置频次
- [ ] 检查通知权限
- [ ] 验证通知推送

### 5. 数据导出
- [ ] 导出为 JSON 格式
- [ ] 导出为 CSV 格式
- [ ] 验证导出数据完整性
- [ ] 测试分享功能

### 6. 数据同步
- [ ] 注册/登录账号
- [ ] 添加数据并触发同步
- [ ] 在另一设备登录验证同步

---

## 🎯 开发工具

### 清理缓存
```bash
# Expo 缓存
cd /Users/zhuchiyu/Documents/projects/BabyBeats/baby-beats-app
npx expo start -c

# npm 缓存
npm cache clean --force
```

### 重置数据库
```bash
cd /Users/zhuchiyu/Documents/projects/BabyBeats/backend
docker compose down -v
docker compose up -d postgres
# 数据库会自动初始化 schema
```

### 查看 Expo 信息
```bash
cd /Users/zhuchiyu/Documents/projects/BabyBeats/baby-beats-app
npx expo doctor
```

---

## 📱 Expo 快捷键

在 Expo 终端中：
- `a` - 在 Android 模拟器/设备上打开
- `i` - 在 iOS 模拟器上打开
- `w` - 在浏览器中打开 (Web)
- `r` - 重新加载应用
- `m` - 切换菜单
- `?` - 显示所有命令

---

## 🐛 常见问题

### 问题：无法连接到后端
**解决方案：**
1. 检查后端是否运行：`curl http://localhost:3000/health`
2. 检查防火墙设置
3. 确认端口 3000 未被占用：`lsof -i :3000`

### 问题：数据库连接失败
**解决方案：**
1. 检查容器状态：`docker ps | grep babybeats`
2. 查看容器日志：`docker logs babybeats-postgres`
3. 确认端口 5432 未被占用：`lsof -i :5432`

### 问题：Expo 无法启动
**解决方案：**
1. 清理缓存：`npx expo start -c`
2. 重新安装依赖：`rm -rf node_modules && npm install`
3. 检查 Node 版本：`node -v` (需要 >= 18.x)

### 问题：通知不工作
**解决方案：**
1. 检查通知权限是否授予
2. 在真机上测试（模拟器可能不支持）
3. 查看控制台日志

### 问题：图片上传失败
**解决方案：**
1. 检查手机权限（相册、相机）
2. 确认文件大小限制
3. 查看错误日志

---

## 📊 性能监控

### 监控后端性能
```bash
# 查看 Node.js 进程
ps aux | grep node

# 监控容器资源
docker stats babybeats-postgres
```

### 监控 Expo 性能
- 在应用中摇晃设备打开开发菜单
- 选择 "Performance Monitor"
- 查看 FPS、内存使用等

---

## 🔒 安全提醒

### 开发环境
- ✅ `.env` 文件已创建（包含在 .gitignore）
- ⚠️ 请勿提交 `.env` 文件到版本控制
- ⚠️ JWT_SECRET 已设置（开发环境）

### 生产环境部署前
- [ ] 修改所有默认密码
- [ ] 生成强 JWT_SECRET
- [ ] 配置 CORS_ORIGIN 为特定域名
- [ ] 启用 HTTPS
- [ ] 设置数据库备份策略
- [ ] 配置日志记录
- [ ] 设置监控告警

---

## 📞 获取帮助

### 文档资源
- `README.md` - 项目总览
- `NEW_FEATURES_GUIDE.md` - 新功能使用指南
- `NOTIFICATION_GUIDE.md` - 通知功能详解
- `PHASE4_COMPLETION_SUMMARY.md` - 完成总结

### 日志位置
- **后端日志**: 启动终端的 stdout
- **Expo 日志**: 启动终端的 stdout
- **数据库日志**: `docker logs babybeats-postgres`

### 联系方式
- 📧 Email: zhu.cy@outlook.com

---

## 🎉 启动成功！

如果你看到以下内容，说明项目已成功启动：

✅ **PostgreSQL**: 容器健康运行
✅ **后端 API**: 返回健康状态
✅ **Expo**: 显示二维码或终端菜单

现在你可以：
1. 🔍 扫描二维码在真机上测试
2. 📱 使用模拟器运行应用
3. 🧪 测试新添加的功能
4. 📊 查看数据库和日志

**祝你开发愉快！** 🚀

