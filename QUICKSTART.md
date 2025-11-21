# 🚀 BabyBeats 快速启动指南

## ✅ 当前状态

所有服务已成功启动！

### 运行中的服务
- ✅ **PostgreSQL 数据库**: localhost:5432
- ✅ **后端 API 服务**: localhost:3000  
- ✅ **Expo 开发服务器**: 正在运行

### 数据库表（12张）
✅ users, babies, feedings, sleeps, diapers, pumpings, growth_records, vaccines, medical_visits, medications, milestones, sync_logs

---

## 📱 开始使用应用

### 方式1：使用手机（推荐）

1. **安装 Expo Go 应用**
   - iOS: App Store 搜索 "Expo Go"
   - Android: Google Play 搜索 "Expo Go"

2. **启动应用**
   - 在运行 Expo 的终端中找到二维码
   - 使用 Expo Go 扫描二维码
   - 应用将自动加载

### 方式2：使用iOS模拟器

```bash
# 打开新终端窗口
cd /Users/zhuchiyu/Documents/projects/BabyBeats/baby-beats-app
npx expo run:ios
```

### 方式3：使用Android模拟器

```bash
# 打开新终端窗口
cd /Users/zhuchiyu/Documents/projects/BabyBeats/baby-beats-app  
npx expo run:android
```

---

## 🧪 测试新功能

### 1. 健康管理（Health Tab）
- [ ] 点击底部 "健康" Tab
- [ ] 查看体温、疫苗、就医、用药卡片
- [ ] 添加体温记录
- [ ] 添加疫苗记录并设置提醒
- [ ] 添加用药记录测试自动提醒

### 2. 里程碑记录
- [ ] 进入 "成长" Tab  
- [ ] 点击 "成长里程碑" 卡片
- [ ] 添加宝宝第一次爬行
- [ ] 上传照片
- [ ] 查看时间轴展示

### 3. 快速记录
- [ ] 点击右上角 "+" 按钮
- [ ] 使用快捷菜单记录体温
- [ ] 使用快捷菜单添加里程碑

### 4. 数据导出
- [ ] 进入 "设置" Tab
- [ ] 点击 "导出数据"
- [ ] 选择 CSV 或 JSON 格式
- [ ] 验证导出的文件

### 5. 通知提醒
- [ ] 添加疫苗时开启提醒
- [ ] 添加用药时设置频次（如：每日3次）
- [ ] 检查通知权限
- [ ] 等待提醒推送（或测试立即通知）

---

## 🔧 管理服务

### 查看服务状态
```bash
# 检查后端
curl http://localhost:3000/health

# 查看Docker容器
docker ps | grep babybeats

# 查看数据库表
docker exec babybeats-postgres psql -U postgres -d babybeats -c "\dt"
```

### 停止服务
```bash
# 停止数据库
cd /Users/zhuchiyu/Documents/projects/BabyBeats/backend
docker compose down

# 停止后端和Expo：在各自终端按 Ctrl+C
```

### 重启服务
```bash
# 重启数据库
cd /Users/zhuchiyu/Documents/projects/BabyBeats/backend
docker compose up -d postgres

# 重启后端
cd /Users/zhuchiyu/Documents/projects/BabyBeats/backend
npm run dev

# 重启Expo
cd /Users/zhuchiyu/Documents/projects/BabyBeats/baby-beats-app
npx expo start
```

---

## 📚 更多文档

- `README.md` - 项目总览
- `NEW_FEATURES_GUIDE.md` - 新功能详细指南
- `NOTIFICATION_GUIDE.md` - 通知功能说明
- `STARTUP_GUIDE.md` - 完整启动指南
- `PROJECT_STATUS.md` - 项目完成状态

---

## 💡 提示

### 首次使用
1. 注册账号或登录
2. 添加宝宝资料
3. 开始记录宝宝成长

### 测试账号（可选）
- 邮箱: demo@babybeats.com
- 密码: Demo123456

### 获取帮助
- 📧 Email: zhu.cy@outlook.com
- 📖 查看项目文档
- 💬 应用内反馈

---

## 🎉 享受使用 BabyBeats！

**所有核心功能已完成并可使用。祝你开发/测试愉快！** 🚀
