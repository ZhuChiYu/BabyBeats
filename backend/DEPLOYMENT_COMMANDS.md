# 部署命令速查表

## 🚀 快速部署（推荐）

### 方式一：使用一键部署脚本

```bash
# 1. 连接服务器
ssh root@111.230.110.95

# 2. 上传代码（在本地执行）
cd /path/to/BabyBeats
scp -r backend root@111.230.110.95:/opt/babybeats/

# 3. 在服务器上执行部署脚本
cd /opt/babybeats/backend
chmod +x deploy-tencent.sh
bash deploy-tencent.sh
```

## 📦 手动部署步骤

### 第一步：准备环境

```bash
# 连接服务器
ssh root@111.230.110.95

# 创建目录
mkdir -p /opt/babybeats/backend
mkdir -p /opt/babybeats/backups
mkdir -p /opt/babybeats/logs

# 进入目录
cd /opt/babybeats/backend
```

### 第二步：上传代码

```bash
# 方式 1: 使用 SCP（在本地执行）
cd /path/to/BabyBeats
scp -r backend/* root@111.230.110.95:/opt/babybeats/backend/

# 方式 2: 使用 Git
cd /opt/babybeats/backend
git clone <your-repo-url> .

# 方式 3: 使用 rsync（在本地执行）
rsync -avz --exclude 'node_modules' --exclude '.env' \
  backend/ root@111.230.110.95:/opt/babybeats/backend/
```

### 第三步：配置环境变量

```bash
cd /opt/babybeats/backend

# 生成强密码
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
JWT_SECRET=$(openssl rand -hex 32)
PGADMIN_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)

# 创建 .env 文件
cat > .env << EOF
NODE_ENV=production
PORT=3000
API_VERSION=v1
DB_HOST=postgres
DB_PORT=5432
DB_NAME=babybeats
DB_USER=babybeats_user
DB_PASSWORD=${DB_PASSWORD}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
PGADMIN_EMAIL=admin@babybeats.local
PGADMIN_PASSWORD=${PGADMIN_PASSWORD}
PGADMIN_PORT=5050
EOF

# 设置权限
chmod 600 .env

# 显示密码（请记录）
echo "数据库密码: ${DB_PASSWORD}"
echo "pgAdmin 密码: ${PGADMIN_PASSWORD}"
```

### 第四步：启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 第五步：验证部署

```bash
# 等待服务启动
sleep 10

# 健康检查
curl http://localhost:3000/health

# 应该返回: {"status":"ok","timestamp":"..."}

# 从外网测试
curl http://111.230.110.95:3000/health
```

## 🌐 配置 Nginx（推荐）

```bash
# 安装 Nginx
sudo apt update
sudo apt install nginx -y

# 上传配置文件（在本地执行）
scp backend/nginx-babybeats.conf root@111.230.110.95:/etc/nginx/sites-available/babybeats

# 或在服务器上直接创建
sudo nano /etc/nginx/sites-available/babybeats
# 粘贴 nginx-babybeats.conf 的内容

# 启用配置
sudo ln -s /etc/nginx/sites-available/babybeats /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# 查看状态
sudo systemctl status nginx
```

## 🔒 配置 SSL（推荐）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d englishpartner.cn -d www.englishpartner.cn

# 测试自动续期
sudo certbot renew --dry-run
```

## 🛡️ 配置防火墙

```bash
# 启用 UFW
sudo ufw enable

# 允许必要端口
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw allow 3000/tcp   # API（如果不使用 Nginx 反向代理）

# 查看状态
sudo ufw status
```

## 📊 管理命令

### Docker 容器管理

```bash
# 查看所有容器
docker-compose ps

# 查看日志
docker-compose logs -f              # 所有服务
docker-compose logs -f api          # API 服务
docker-compose logs -f postgres     # 数据库

# 重启服务
docker-compose restart              # 重启所有
docker-compose restart api          # 重启 API

# 停止服务
docker-compose stop                 # 停止所有
docker-compose stop api             # 停止 API

# 启动服务
docker-compose start                # 启动所有
docker-compose up -d                # 启动所有（后台）

# 停止并删除
docker-compose down                 # 保留数据
docker-compose down -v              # 删除数据卷

# 重新构建
docker-compose up -d --build        # 重新构建并启动
docker-compose build --no-cache     # 清除缓存重新构建

# 查看资源使用
docker stats
```

### 数据库管理

```bash
# 进入数据库容器
docker exec -it babybeats-postgres bash

# 连接数据库
docker exec -it babybeats-postgres psql -U babybeats_user -d babybeats

# 常用 SQL 命令
\l                    # 列出所有数据库
\dt                   # 列出所有表
\d table_name         # 查看表结构
SELECT * FROM users;  # 查询数据
\q                    # 退出

# 备份数据库
docker exec babybeats-postgres pg_dump -U babybeats_user babybeats > backup_$(date +%Y%m%d).sql

# 恢复数据库
docker exec -i babybeats-postgres psql -U babybeats_user babybeats < backup_20240101.sql

# 查看数据库大小
docker exec babybeats-postgres psql -U babybeats_user -d babybeats -c "SELECT pg_size_pretty(pg_database_size('babybeats'));"
```

### 日志管理

```bash
# 查看最近的日志
docker-compose logs --tail=100 api

# 实时查看日志
docker-compose logs -f api

# 查看特定时间的日志
docker-compose logs --since="2024-01-01T00:00:00" api

# 导出日志
docker-compose logs api > api_logs_$(date +%Y%m%d).log

# 清理日志
docker-compose logs --no-log-prefix api > /dev/null 2>&1
```

### 备份与恢复

```bash
# 手动备份
/opt/babybeats/backup.sh

# 查看备份文件
ls -lh /opt/babybeats/backups/

# 恢复最新备份
LATEST_BACKUP=$(ls -t /opt/babybeats/backups/backup_*.sql.gz | head -1)
gunzip -c $LATEST_BACKUP | docker exec -i babybeats-postgres psql -U babybeats_user babybeats

# 定时备份任务
crontab -e
# 添加: 0 2 * * * /opt/babybeats/backup.sh
```

## 🔄 更新部署

```bash
# 方式 1: 使用 Git
cd /opt/babybeats/backend
git pull
docker-compose up -d --build

# 方式 2: 手动上传（在本地执行）
cd /path/to/BabyBeats
rsync -avz --exclude 'node_modules' --exclude '.env' \
  backend/ root@111.230.110.95:/opt/babybeats/backend/

# 在服务器上重新构建
cd /opt/babybeats/backend
docker-compose up -d --build

# 查看更新日志
docker-compose logs -f api
```

## 🐛 故障排查

### 检查服务状态

```bash
# Docker 服务
sudo systemctl status docker

# API 容器
docker-compose ps api

# 数据库容器
docker-compose ps postgres

# Nginx 服务
sudo systemctl status nginx
```

### 检查端口占用

```bash
# 检查端口
sudo netstat -tulpn | grep 3000
sudo netstat -tulpn | grep 5432
sudo netstat -tulpn | grep 80

# 或使用 ss
sudo ss -tulpn | grep 3000
```

### 检查日志

```bash
# API 日志
docker-compose logs --tail=50 api

# 数据库日志
docker-compose logs --tail=50 postgres

# Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# Nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# 系统日志
sudo journalctl -u docker -f
```

### 重启所有服务

```bash
# 重启 Docker
sudo systemctl restart docker

# 重启应用
cd /opt/babybeats/backend
docker-compose restart

# 重启 Nginx
sudo systemctl restart nginx
```

## 🧪 测试 API

```bash
# 健康检查
curl http://localhost:3000/health

# 注册用户
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "name": "Test User"
  }'

# 登录
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'

# 获取用户信息（需要 token）
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📱 配置前端

更新前端 API 地址：

```typescript
// baby-beats-app/src/services/api/config.ts

// 使用域名（推荐）
export const API_BASE_URL = 'https://englishpartner.cn/api/v1';

// 或使用 IP
export const API_BASE_URL = 'http://111.230.110.95:3000/api/v1';
```

## 🎯 完整部署检查清单

- [ ] 服务器 SSH 连接正常
- [ ] Docker 和 Docker Compose 已安装
- [ ] 代码已上传到服务器
- [ ] .env 配置文件已创建
- [ ] Docker 容器启动成功
- [ ] 健康检查通过
- [ ] 防火墙配置完成
- [ ] Nginx 配置完成（可选）
- [ ] SSL 证书配置完成（可选）
- [ ] 备份脚本配置完成
- [ ] 前端 API 地址已更新
- [ ] API 测试通过

## 📞 需要帮助？

查看详细文档：`TENCENT_CLOUD_DEPLOYMENT.md`

