# 数据库迁移脚本

## 使用说明

### 方案一：清空数据库（推荐用于开发/测试环境）

**最简单的方式**：直接删除应用数据

```bash
# iOS 模拟器
rm -rf ~/Library/Developer/CoreSimulator/Devices/*/data/Containers/Data/Application/*/Library/SQLite/babybeats.db

# Android 模拟器
adb shell run-as com.babybeats rm /data/data/com.babybeats/databases/babybeats.db

# 或者直接卸载重装应用
```

重新启动应用后，会自动创建包含新字段定义的数据库。

### 方案二：保留数据迁移（用于生产环境）

如果您有重要的历史数据需要保留，请使用以下步骤：

#### 在代码中执行迁移

在 `App.tsx` 或启动文件中临时添加以下代码（**只需执行一次**）：

```typescript
import { getDatabase } from './src/database';

// 在应用启动时执行一次
const runMigration = async () => {
  const db = await getDatabase();
  
  try {
    console.log('开始迁移 diapers 表...');
    
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS diapers_new (
        id TEXT PRIMARY KEY,
        baby_id TEXT NOT NULL,
        time INTEGER NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('poop', 'pee', 'both')),
        poop_consistency TEXT CHECK(poop_consistency IN ('loose', 'normal', 'hard', 'other')),
        poop_color TEXT CHECK(poop_color IN ('yellow', 'green', 'dark', 'black', 'red', 'brown', 'white', 'orange', 'other')),
        poop_amount TEXT CHECK(poop_amount IN ('small', 'medium', 'large')),
        pee_amount TEXT CHECK(pee_amount IN ('small', 'medium', 'large')),
        has_abnormality INTEGER DEFAULT 0,
        notes TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        synced_at INTEGER,
        FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE
      );
      
      INSERT INTO diapers_new SELECT * FROM diapers;
      DROP TABLE diapers;
      ALTER TABLE diapers_new RENAME TO diapers;
      
      CREATE INDEX IF NOT EXISTS idx_diapers_baby_id ON diapers(baby_id);
      CREATE INDEX IF NOT EXISTS idx_diapers_time ON diapers(time);
    `);
    
    console.log('迁移完成！');
  } catch (error) {
    console.error('迁移失败:', error);
  }
};

// 在 useEffect 中调用
useEffect(() => {
  runMigration();
}, []);
```

**重要**：迁移成功后，请删除这段代码，避免重复执行。

## 变更说明

### diapers 表 - poop_color 字段扩展

**原有颜色类型（4种）**：
- yellow（黄色）
- green（绿色）
- dark（深色）
- other（其他）

**新增颜色类型（5种）**：
- black（黑色）⭐ 新增
- red（红色）⭐ 新增
- brown（褐色）⭐ 新增
- white（白色）⭐ 新增
- orange（橙色）⭐ 新增

**共计 9 种颜色类型**

## 技术说明

- 使用 `CREATE TABLE + INSERT + DROP + RENAME` 模式绕过 SQLite 的 ALTER TABLE 限制
- SQLite 不支持直接修改 CHECK 约束，需要重建表
- 数据迁移过程中保留所有字段和索引
- 旧数据的颜色值不受影响，仍然有效

## 疑难排查

如果遇到 "CHECK constraint failed" 错误：
1. 确认已执行迁移脚本
2. 尝试方案一（清空数据库）
3. 检查是否有代码缓存，完全重启应用

