# 🍼 BabyBeats - 宝宝成长记录应用

一款功能完整的跨平台宝宝成长记录应用，支持离线使用和云端同步。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61dafb.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)

## ✨ 功能特性

### 👶 宝宝管理
- ✅ 多宝宝档案管理
- ✅ 宝宝信息编辑
- ✅ 宝宝切换
- ✅ 宝宝归档

### 📊 记录功能
- ✅ **喂养记录**
  - 亲喂母乳（左右侧独立计时）
  - 瓶喂母乳（奶量记录）
  - 配方奶（奶量和品牌）
  - 实时计时器
  - 今日统计

- ✅ **睡眠记录**
  - 开始/结束时间
  - 自动计算时长
  - 睡眠类型（小睡/夜间）
  - 入睡方式
  - 今日统计

- ✅ **尿布记录**
  - 尿布类型（尿/便/混合）
  - 便便特征（质地、颜色、量）
  - 尿量记录
  - 异常标记

- ✅ **挤奶记录**
  - 挤奶量记录
  - 时长统计
  - 储存管理

- ✅ **成长记录**
  - 身高/体重/头围/体温
  - 成长曲线图表
  - WHO标准对比

- ✅ **健康管理**
  - 体温记录（支持多种测量方式）
  - 疫苗接种计划与提醒
  - 就医记录（医院、科室、诊断）
  - 用药记录（剂量、频次、疗程）

- ✅ **成长里程碑**
  - 运动发展（抬头、翻身、爬行、走路等）
  - 语言发展（微笑、说话、叫爸妈等）
  - 社交发展（认人、拍手、分享等）
  - 饮食发展（吃辅食、用勺子等）
  - 生活技能（穿衣、刷牙等）
  - 特殊时刻（第一次、纪念日等）
  - 照片记录与时间轴展示

### 📈 数据分析
- ✅ 今日概览（Today）
- ✅ 记录日志（Log）
- ✅ 统计图表（Stats）
- ✅ 成长曲线（Growth）
- ✅ 数据导出（Excel/CSV）

### 🔄 同步功能
- ✅ 离线优先架构
- ✅ 自动后台同步
- ✅ 批量数据推送
- ✅ 增量数据拉取
- ✅ 冲突解决机制

### 👤 用户系统
- ✅ 用户注册/登录
- ✅ JWT 身份认证
- ✅ 密码加密存储
- ✅ 设备管理

### 🎨 界面功能
- ✅ 深色/浅色主题切换
- ✅ 多语言支持（中文/英文）
- ✅ 响应式布局
- ✅ 优雅的动画效果

## 🏗️ 技术架构

### 前端（baby-beats-app）

```
React Native App (iOS/Android)
├── Expo SDK 54 (New Architecture)
├── TypeScript
├── React Navigation 7
├── Zustand (状态管理)
├── SQLite (本地数据库)
├── date-fns (日期处理)
└── Expo Vector Icons
```

**核心技术：**
- **框架**: Expo + React Native 0.81.5
- **语言**: TypeScript 5.x
- **导航**: React Navigation (Native Stack + Bottom Tabs)
- **状态管理**: Zustand
- **本地数据库**: SQLite (expo-sqlite)
- **网络请求**: Fetch API
- **图表**: react-native-chart-kit
- **日期**: date-fns

### 后端（backend）

```
Node.js API Server
├── Express.js
├── PostgreSQL 16
├── Docker Compose
├── JWT 认证
└── RESTful API
```

**核心技术：**
- **运行时**: Node.js 18+
- **框架**: Express.js
- **数据库**: PostgreSQL 16
- **认证**: JWT (jsonwebtoken)
- **密码**: bcryptjs
- **容器化**: Docker + Docker Compose
- **进程管理**: PM2

## 📁 项目结构

```
BabyBeats/
├── baby-beats-app/              # 前端应用
│   ├── src/
│   │   ├── components/          # UI组件
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Timer.tsx
│   │   │   ├── LiveTimerCard.tsx
│   │   │   └── ModalHeader.tsx
│   │   ├── contexts/            # React Context
│   │   │   ├── ThemeContext.tsx
│   │   │   └── LanguageContext.tsx
│   │   ├── screens/             # 页面组件
│   │   │   ├── auth/            # 认证页面
│   │   │   ├── TodayScreen.tsx  # 今日概览
│   │   │   ├── LogScreen.tsx    # 记录日志
│   │   │   ├── StatsScreen.tsx  # 统计分析
│   │   │   ├── GrowthScreen.tsx # 成长曲线
│   │   │   ├── HealthScreen.tsx # 健康管理
│   │   │   ├── MilestoneTimelineScreen.tsx # 里程碑时间轴
│   │   │   └── SettingsScreen.tsx
│   │   ├── navigation/          # 导航配置
│   │   ├── services/            # 业务逻辑
│   │   │   ├── api/             # API客户端
│   │   │   ├── babyService.ts
│   │   │   ├── feedingService.ts
│   │   │   ├── sleepService.ts
│   │   │   ├── diaperService.ts
│   │   │   ├── pumpingService.ts
│   │   │   ├── growthService.ts
│   │   │   ├── temperatureService.ts    # 体温服务
│   │   │   ├── vaccineService.ts        # 疫苗服务
│   │   │   ├── milestoneService.ts      # 里程碑服务
│   │   │   ├── medicationService.ts     # 用药服务
│   │   │   ├── medicalVisitService.ts   # 就医服务
│   │   │   ├── syncManager.ts   # 同步管理
│   │   │   └── dataService.ts
│   │   ├── store/               # 全局状态
│   │   │   ├── babyStore.ts
│   │   │   ├── timerStore.ts
│   │   │   └── authStore.ts
│   │   ├── database/            # 数据库
│   │   │   ├── index.ts
│   │   │   └── schema.ts
│   │   ├── types/               # 类型定义
│   │   ├── utils/               # 工具函数
│   │   └── constants/           # 常量
│   ├── ios/                     # iOS原生代码
│   ├── android/                 # Android原生代码
│   ├── App.tsx                  # 应用入口
│   ├── app.json                 # Expo配置
│   └── package.json
│
├── backend/                     # 后端服务
│   ├── src/
│   │   ├── config/              # 配置
│   │   │   ├── config.ts
│   │   │   └── database.ts
│   │   ├── controllers/         # 控制器
│   │   │   ├── authController.ts
│   │   │   ├── babyController.ts
│   │   │   ├── syncController.ts
│   │   │   └── feedingController.ts
│   │   ├── middleware/          # 中间件
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── validation.ts
│   │   ├── routes/              # 路由
│   │   ├── utils/               # 工具函数
│   │   ├── database/            # 数据库脚本
│   │   │   └── schema.sql
│   │   └── server.ts            # 服务器入口
│   ├── docker-compose.yml       # Docker配置
│   ├── Dockerfile
│   └── package.json
│
└── docs/                        # 文档（*.md）
    ├── START_HERE.md            # 快速开始
    ├── DEPLOYMENT.md            # 部署指南
    ├── DATABASE_FIX_SUMMARY.md  # 数据库修复
    └── ...
```

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Docker**: >= 20.10 (后端部署)
- **iOS开发**: macOS + Xcode 15+
- **Android开发**: Android Studio + JDK 17+

### 1. 克隆项目

```bash
git clone https://github.com/your-username/BabyBeats.git
cd BabyBeats
```

### 2. 启动后端服务

```bash
cd backend

# 复制环境变量配置
cp .env.template .env

# 启动 Docker 容器（PostgreSQL + API）
docker-compose up -d

# 检查服务状态
docker-compose ps

# 查看日志
docker-compose logs -f app
```

后端服务将运行在：
- **API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **PostgreSQL**: localhost:5432

### 3. 启动前端应用

```bash
cd baby-beats-app

# 安装依赖
npm install

# 启动开发服务器
npx expo start

# 按 'i' 启动 iOS 模拟器
# 按 'a' 启动 Android 模拟器
```

**快捷启动脚本**：
```bash
# iOS
./baby-beats-app/START_IOS.sh

# 测试 API 连接
./test-api-connection.sh
```

## 📱 开发指南

### 前端开发

#### 运行开发服务器
```bash
cd baby-beats-app
npx expo start
```

#### 原生构建
```bash
# iOS（首次或配置变更后）
npx expo prebuild --clean
npx expo run:ios

# Android
npx expo run:android
```

#### 清理缓存
```bash
rm -rf .expo node_modules/.cache
npm install
```

#### 重要配置

**API 配置** (`src/services/api/apiClient.ts`):
- iOS 模拟器: 使用局域网 IP（如 `http://192.168.31.221:3000`）
- Android 模拟器: 使用 `http://10.0.2.2:3000`
- 真机: 使用局域网 IP

**ATS 配置** (`app.json`):
```json
{
  "ios": {
    "infoPlist": {
      "NSAppTransportSecurity": {
        "NSAllowsArbitraryLoads": true
      }
    }
  }
}
```

### 后端开发

#### 启动开发服务器
```bash
cd backend

# 使用 Docker
docker-compose up -d

# 或本地开发
npm run dev
```

#### 数据库管理
```bash
# 连接数据库
docker exec -it babybeats-postgres psql -U postgres -d babybeats

# 查看表结构
\dt

# 执行 SQL 脚本
docker exec -i babybeats-postgres psql -U postgres -d babybeats < src/database/schema.sql
```

#### 查看日志
```bash
# API 日志
docker-compose logs -f app

# 数据库日志
docker-compose logs -f postgres
```

## 🗄️ 数据库设计

### 主要数据表

| 表名 | 说明 | 主要字段 |
|------|------|---------|
| `users` | 用户表 | id, email, password_hash, name |
| `babies` | 宝宝档案 | id, user_id, name, gender, birthday |
| `feedings` | 喂养记录 | id, baby_id, type, time, amount, duration |
| `sleeps` | 睡眠记录 | id, baby_id, start_time, end_time, duration |
| `diapers` | 尿布记录 | id, baby_id, time, type, notes |
| `pumpings` | 挤奶记录 | id, baby_id, amount, duration, time |
| `growth_records` | 成长记录 | id, baby_id, date, height, weight, head_circ |
| `sync_logs` | 同步日志 | id, user_id, device_id, sync_status |

### 数据同步机制

1. **离线优先**: 所有数据先保存到本地 SQLite
2. **自动同步**: 后台自动同步到云端 PostgreSQL
3. **批量推送**: 使用 `/api/v1/sync/push` 批量上传
4. **增量拉取**: 使用 `/api/v1/sync/pull` 获取更新
5. **冲突解决**: 基于时间戳的最后写入优胜策略

## 🔐 API 文档

### 认证 API

```bash
# 注册
POST /api/v1/auth/register
Body: { email, password, name }

# 登录
POST /api/v1/auth/login
Body: { email, password }
Response: { token, user }

# 刷新 Token
POST /api/v1/auth/refresh
Header: Authorization: Bearer <token>
```

### 同步 API

```bash
# 推送数据
POST /api/v1/sync/push
Header: Authorization: Bearer <token>
Body: { data: [{ tableName, records }] }

# 拉取数据
GET /api/v1/sync/pull?lastSyncTime=<timestamp>
Header: Authorization: Bearer <token>
Response: { syncTime, data: { babies, feedings, ... } }

# 同步状态
GET /api/v1/sync/status
Header: Authorization: Bearer <token>
```

### 宝宝管理 API

```bash
# 获取宝宝列表
GET /api/v1/babies

# 创建宝宝
POST /api/v1/babies

# 更新宝宝
PUT /api/v1/babies/:id

# 删除宝宝
DELETE /api/v1/babies/:id
```

## 📦 部署指南

### 后端部署

#### Docker 部署（推荐）

```bash
cd backend

# 1. 配置环境变量
cp .env.template .env
# 编辑 .env 文件

# 2. 启动服务
docker-compose up -d

# 3. 检查状态
docker-compose ps
curl http://localhost:3000/health
```

#### 服务器部署

```bash
# 1. 安装 PostgreSQL
sudo apt install postgresql

# 2. 创建数据库
createdb babybeats

# 3. 导入 Schema
psql -d babybeats -f src/database/schema.sql

# 4. 安装依赖
npm install

# 5. 构建
npm run build

# 6. 使用 PM2 启动
pm2 start ecosystem.config.js
```

### 前端部署

#### 生产构建

```bash
cd baby-beats-app

# 1. 更新 API URL
# 修改 src/services/api/apiClient.ts 中的生产环境 URL

# 2. iOS 构建
npx expo build:ios

# 3. Android 构建
npx expo build:android
```

### 📚 完整部署文档

BabyBeats 提供了详细的生产环境部署指南，帮助您从开发到上线：

#### 🎯 快速部署
- **[快速部署指南](./QUICK_DEPLOYMENT_GUIDE.md)** - 30 分钟快速上线
- **[部署总览](./DEPLOYMENT_OVERVIEW.md)** - 完整流程和时间线规划
- **[部署检查清单](./DEPLOYMENT_CHECKLIST.md)** - 逐项检查确保不遗漏

#### 📱 iOS 发布
- **[iOS 发布完整指南](./IOS_DEPLOYMENT_GUIDE.md)** - 包含：
  - Apple 开发者账号申请流程
  - Expo EAS 配置和使用
  - TestFlight 内测完整指南（邀请码生成和分发）
  - App Store 审核准备和正式发布
  - 版本更新流程

#### 🖥️ 后端部署
- **[后端部署完整指南](./BACKEND_DEPLOYMENT_GUIDE.md)** - 包含：
  - 服务器选购详细对比（阿里云/腾讯云/DigitalOcean/AWS）
  - 服务器初始化和安全配置
  - Docker 一键部署方案
  - 域名和 SSL 证书配置
  - 数据库管理和备份策略
  - 监控、日志和性能优化

#### 🛠️ 自动化脚本
项目提供了开箱即用的部署脚本：

```bash
# 后端一键部署
cd backend
chmod +x deploy.sh
./deploy.sh production

# iOS 自动构建和发布
cd baby-beats-app
chmod +x deploy-ios.sh
./deploy-ios.sh production

# 服务器初始化（首次使用）
wget https://raw.githubusercontent.com/yourusername/BabyBeats/main/backend/setup-server.sh
sudo bash setup-server.sh
```

#### 💰 成本估算
- **Apple 开发者账号**: $99/年 (约 ¥700)
- **服务器**: ¥200-400/月（初创阶段）
- **域名**: ¥55/年
- **SSL 证书**: 免费（Let's Encrypt）
- **首年总计**: 约 ¥3,155 起

#### ⏱️ 时间线
- **最快发布**: 2-3 周
- **稳妥发布**: 5-8 周（含充分测试）

#### 🎓 推荐阅读顺序
1. **[部署总览](./DEPLOYMENT_OVERVIEW.md)** - 了解全局流程
2. **[后端部署指南](./BACKEND_DEPLOYMENT_GUIDE.md)** - 部署后端服务
3. **[iOS 发布指南](./IOS_DEPLOYMENT_GUIDE.md)** - 发布 iOS 应用
4. **[部署检查清单](./DEPLOYMENT_CHECKLIST.md)** - 逐项确认

## 🧪 测试

### 前端测试
```bash
cd baby-beats-app
npm test
```

### 后端测试
```bash
cd backend
npm test
```

### API 连接测试
```bash
./test-api-connection.sh
```

## 🐛 故障排除

### 常见问题

#### 1. 网络连接失败
```
ERROR: Network request failed
```

**解决方案**:
- iOS: 使用局域网 IP，不用 localhost
- Android: 使用 10.0.2.2
- 确保后端服务运行在 0.0.0.0:3000
- 检查防火墙设置

参考：[SYNC_FIX_COMPLETED.md](./SYNC_FIX_COMPLETED.md)

#### 2. 数据库连接失败
```
ERROR: column "quality" does not exist
```

**解决方案**:
```bash
./fix-backend-db.sh
```

参考：[DATABASE_FIX_SUMMARY.md](./DATABASE_FIX_SUMMARY.md)

#### 3. 启动失败
```
ERROR: Unable to find destination
```

**解决方案**:
```bash
cd baby-beats-app
npx expo start
# 然后按 'i' 启动 iOS
```

参考：[QUICK_START_FIX.md](./QUICK_START_FIX.md)

## 📚 文档

- [🚀 快速开始](./START_HERE.md) - 最快上手指南
- [🔧 完整修复指南](./FINAL_FIX_GUIDE.md) - 问题修复详解
- [📦 部署文档](./DEPLOYMENT.md) - 生产环境部署
- [🗄️ 数据库修复](./DATABASE_FIX_SUMMARY.md) - 数据库问题解决
- [🌐 网络修复](./SYNC_FIX_COMPLETED.md) - 网络连接问题
- [🔄 同步指南](./SYNC_FIX_GUIDE.md) - 数据同步说明

## 🤝 贡献指南

欢迎提交 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### Commit 规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` - 新功能
- `fix:` - 错误修复
- `refactor:` - 代码重构
- `chore:` - 构建/配置变更
- `docs:` - 文档更新
- `style:` - 代码格式
- `test:` - 测试相关

## 📄 开源协议

本项目采用 [MIT License](./LICENSE) 开源协议。

## 👨‍💻 作者

- **开发者**: 朱驰宇
- **邮箱**: zhu.cy@outlook.com

## 🙏 致谢

感谢以下开源项目：

- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [Express.js](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/)

## 📊 项目状态

- ✅ 核心功能完成（喂养、睡眠、尿布、挤奶）
- ✅ 成长追踪完成（身高、体重、头围、体温）
- ✅ 健康管理完成（疫苗、就医、用药）
- ✅ 里程碑记录完成（8大类、60+项目）
- ✅ 数据同步完成（离线优先、自动同步）
- ✅ 用户认证完成（JWT、密码加密）
- ✅ 智能提醒完成（疫苗提醒、用药提醒）
- ✅ 数据导出完成（10种类型、CSV/JSON）
- 🚧 多语言支持（部分完成）
- 📅 计划优化UI/UX性能

---

**⭐ 如果这个项目对你有帮助，请给个 Star！**
