# BabyBeats - 宝宝成长记录 App

一款基于 Expo + React Native 开发的跨平台宝宝成长记录应用。

## 功能特性

### ✅ 已实现

- 📱 **基础架构**
  - Expo + React Native + TypeScript
  - SQLite 本地数据库
  - Zustand 状态管理
  - React Navigation 导航

- 👶 **多宝宝管理**
  - 宝宝档案创建和管理
  - 多宝宝切换

- 🍼 **喂养记录**
  - 亲喂母乳（实时计时器）
  - 瓶喂母乳（记录奶量）
  - 配方奶（记录奶量和品牌）
  - 今日喂养统计

- 💤 **睡眠记录**
  - 睡眠开始/结束时间记录
  - 自动计算睡眠时长
  - 今日睡眠统计

- 🏠 **首页概览**
  - 今日喂养、睡眠、尿布统计
  - 快速查看宝宝状态

### 🚧 开发中

- 尿布记录
- 挤奶记录
- 成长记录
- 医疗记录
- 数据统计图表
- 数据导入导出

## 技术栈

- **框架**: Expo SDK 54
- **语言**: TypeScript
- **UI**: React Native
- **导航**: React Navigation (Native Stack + Bottom Tabs)
- **状态管理**: Zustand
- **数据库**: SQLite (expo-sqlite)
- **日期处理**: date-fns
- **图标**: Expo Vector Icons (Ionicons)

## 项目结构

```
baby-beats-app/
├── src/
│   ├── components/       # UI组件
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Timer.tsx
│   ├── screens/          # 页面
│   │   ├── TodayScreen.tsx
│   │   ├── LogScreen.tsx
│   │   ├── StatsScreen.tsx
│   │   ├── GrowthScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── AddFeedingScreen.tsx
│   ├── navigation/       # 导航
│   │   ├── TabNavigator.tsx
│   │   └── types.ts
│   ├── services/         # 数据服务
│   │   ├── babyService.ts
│   │   ├── feedingService.ts
│   │   └── sleepService.ts
│   ├── store/            # 状态管理
│   │   ├── babyStore.ts
│   │   └── timerStore.ts
│   ├── database/         # 数据库
│   │   ├── index.ts
│   │   └── schema.ts
│   ├── types/            # 类型定义
│   │   └── index.ts
│   └── utils/            # 工具函数
├── App.tsx               # 应用入口
└── package.json
```

## 开始开发

### 环境要求

- Node.js >= 18
- npm 或 yarn
- iOS Simulator (macOS) 或 Android Emulator

### 安装依赖

```bash
cd baby-beats-app
npm install
```

### 运行项目

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

### 开发工具

```bash
# 启动开发服务器
npm start

# 清除缓存
npm run clear
```

## 数据库设计

应用使用 SQLite 存储所有数据，主要表包括：

- `babies` - 宝宝档案
- `feedings` - 喂养记录
- `sleeps` - 睡眠记录
- `diapers` - 尿布记录
- `pumpings` - 挤奶记录
- `growth_records` - 成长记录
- `milestones` - 里程碑
- `medical_visits` - 就诊记录
- `medications` - 用药记录
- `vaccines` - 疫苗记录

## 核心功能说明

### 喂养记录

1. **亲喂母乳**
   - 支持左右侧独立计时
   - 实时显示哺乳时长
   - 后台计时支持

2. **瓶喂母乳**
   - 记录奶量(ml)
   - 可与挤奶记录关联分析

3. **配方奶**
   - 记录奶量和品牌
   - 统计奶粉消耗量

### 睡眠记录

- 选择开始和结束时间
- 自动计算睡眠时长
- 区分白天小睡和夜间睡眠
- 智能建议睡眠类型

## 下一步计划

1. 完善尿布和挤奶记录功能
2. 实现数据统计图表
3. 添加成长曲线
4. 实现用户认证和云端同步
5. 添加数据导入导出功能
6. 实现提醒通知功能
7. 适老化优化（大字体模式）

## 开发文档

详细的设计文档请参考项目根目录下的：
- 需求设计文档（V1.0）.md
- 项目设计文档（V1.0）.md

## License

MIT

