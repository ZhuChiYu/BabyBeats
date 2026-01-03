-- 添加尿布记录的尿量相关字段
-- 迁移脚本：添加湿重、干重、尿量字段

-- 添加湿尿布重量字段（克）
ALTER TABLE diapers ADD COLUMN wet_weight REAL;

-- 添加干尿布重量字段（克）
ALTER TABLE diapers ADD COLUMN dry_weight REAL;

-- 添加尿量字段（克，计算得出）
ALTER TABLE diapers ADD COLUMN urine_amount REAL;

-- 创建索引以优化尿量查询
CREATE INDEX IF NOT EXISTS idx_diapers_urine_amount ON diapers(baby_id, time, urine_amount);

