#!/bin/bash

# BabyBeats 数据库备份脚本
# 定时任务：0 2 * * * /opt/BabyBeats/backup-database.sh

set -e

# 配置
BACKUP_DIR="/opt/BabyBeats/backups"
CONTAINER_NAME="babybeats-postgres"
DB_USER="babybeats_user"
DB_NAME="babybeats"
RETENTION_DAYS=7  # 保留7天的备份

# 颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🗄️  BabyBeats 数据库备份"
echo "================================"
echo ""

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 备份文件名（包含日期时间）
BACKUP_FILE="$BACKUP_DIR/babybeats_backup_$(date +%Y%m%d_%H%M%S).sql"

echo "开始备份..."
echo "备份文件: $BACKUP_FILE"

# 执行备份
if docker exec $CONTAINER_NAME pg_dump -U $DB_USER $DB_NAME > "$BACKUP_FILE"; then
    echo -e "${GREEN}✅ 备份成功${NC}"
    
    # 压缩备份文件
    gzip "$BACKUP_FILE"
    echo -e "${GREEN}✅ 压缩完成: ${BACKUP_FILE}.gz${NC}"
    
    # 删除旧备份
    echo "清理旧备份（保留 $RETENTION_DAYS 天）..."
    find "$BACKUP_DIR" -name "babybeats_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    
    # 显示当前备份列表
    echo ""
    echo "当前备份列表："
    ls -lh "$BACKUP_DIR"
    
    # 备份大小
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
    echo ""
    echo "备份大小: $BACKUP_SIZE"
else
    echo -e "${RED}❌ 备份失败${NC}"
    exit 1
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ 备份完成${NC}"
echo "================================"

