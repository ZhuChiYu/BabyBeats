-- 迁移脚本：扩展尿布记录的大便颜色类型
-- 使用场景：如果您已有旧数据，需要手动执行此脚本一次
-- 执行方式：在数据库工具中执行，或通过 expo-sqlite 执行

-- 1. 创建新表（带扩展的颜色支持）
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

-- 2. 复制旧数据到新表
INSERT INTO diapers_new 
SELECT * FROM diapers;

-- 3. 删除旧表
DROP TABLE diapers;

-- 4. 重命名新表
ALTER TABLE diapers_new RENAME TO diapers;

-- 5. 重建索引
CREATE INDEX IF NOT EXISTS idx_diapers_baby_id ON diapers(baby_id);
CREATE INDEX IF NOT EXISTS idx_diapers_time ON diapers(time);

-- 迁移完成
-- 新颜色类型：yellow, green, dark, black, red, brown, white, orange, other

