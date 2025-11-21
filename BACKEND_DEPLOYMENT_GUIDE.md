# BabyBeats 后端部署完整指南

## 目录
1. [服务器选购指南](#1-服务器选购指南)
2. [服务器初始化配置](#2-服务器初始化配置)
3. [Docker 部署方式](#3-docker-部署方式)
4. [传统部署方式](#4-传统部署方式)
5. [数据库管理](#5-数据库管理)
6. [域名和 SSL 证书](#6-域名和-ssl-证书)
7. [监控和日志](#7-监控和日志)
8. [备份策略](#8-备份策略)
9. [性能优化](#9-性能优化)

---

## 1. 服务器选购指南

### 1.1 云服务器提供商对比

#### 国内服务商

| 提供商 | 优势 | 劣势 | 推荐场景 |
|--------|------|------|----------|
| **阿里云 ECS** | • 国内访问速度快<br>• 生态完善<br>• 稳定性好 | • 价格较高<br>• 需要备案 | 主要用户在国内 |
| **腾讯云 CVM** | • 价格相对优惠<br>• 新用户优惠大<br>• 与微信生态集成好 | • 需要备案 | 预算有限，用户在国内 |
| **华为云 ECS** | • 技术支持好<br>• 企业级服务 | • 价格较高<br>• 需要备案 | 企业用户 |

#### 国际服务商

| 提供商 | 优势 | 劣势 | 推荐场景 |
|--------|------|------|----------|
| **AWS EC2** | • 全球化部署<br>• 服务最完善<br>• 免费套餐（12个月） | • 价格较高<br>• 国内访问较慢 | 国际化应用 |
| **DigitalOcean** | • 价格实惠<br>• 界面简洁<br>• 文档详细 | • 国内访问速度一般 | 初创项目 |
| **Vultr** | • 价格便宜<br>• 多机房选择 | • 稳定性一般 | 测试和开发 |
| **Linode** | • 性价比高<br>• 性能稳定 | • 知名度相对较低 | 中小型项目 |

### 1.2 配置推荐

#### 初始阶段（0-1000 用户）

**基础配置**：
```
CPU: 2 核
内存: 4GB
存储: 40GB SSD
带宽: 3-5 Mbps
操作系统: Ubuntu 22.04 LTS / CentOS 8

预估费用: ¥200-400/月（国内）或 $10-20/月（国际）
```

**推荐服务器**：
- 阿里云：ecs.t6-c1m2.large
- 腾讯云：标准型 S5.MEDIUM4
- DigitalOcean：Regular Intel $18/mo
- AWS：t3.medium

#### 成长阶段（1000-10000 用户）

**标准配置**：
```
CPU: 4 核
内存: 8GB
存储: 100GB SSD
带宽: 5-10 Mbps
操作系统: Ubuntu 22.04 LTS

预估费用: ¥500-800/月（国内）或 $40-60/月（国际）
```

**推荐架构**：
- Web 服务器：2 核 4GB x 2（负载均衡）
- 数据库服务器：4 核 8GB x 1
- Redis 缓存：2 核 4GB x 1

#### 成熟阶段（10000+ 用户）

**企业配置**：
```
应用服务器: 8 核 16GB x 3+（集群）
数据库服务器: 16 核 32GB x 1（主）+ 1（从）
缓存服务器: 4 核 8GB x 2
对象存储: OSS/S3
CDN: 全站加速

预估费用: ¥3000+/月
```

### 1.3 购买建议

#### 阿里云采购流程（推荐国内用户）

**Step 1: 注册账号**
1. 访问 [阿里云官网](https://www.aliyun.com/)
2. 注册账号并实名认证
3. 查看新用户优惠

**Step 2: 选择 ECS 实例**
1. 产品 → 云服务器 ECS
2. 立即购买
3. 选择配置：
   ```
   计费模式: 包年包月（首次推荐，有优惠）
   地域: 华东 2（上海）或华北 2（北京）
   实例规格: 
     - 规格族: 计算型 c6 或通用型 g6
     - 实例规格: 2vCPU 4GiB (ecs.c6.large)
   镜像: Ubuntu 22.04 64位
   存储: 40GB ESSD PL0
   网络: 
     - 专有网络 VPC
     - 分配公网 IPv4 地址
     - 带宽计费模式: 按使用流量
     - 峰值带宽: 5 Mbps
   ```

4. 安全组配置：
   ```
   开放端口:
   - 22 (SSH)
   - 80 (HTTP)
   - 443 (HTTPS)
   - 3000 (API, 可选)
   ```

5. 系统配置：
   - 登录凭证：自定义密码（建议使用 SSH 密钥）
   - 实例名称：babybeats-prod
   - 主机名：babybeats-prod

**Step 3: 完成购买**
- 确认订单
- 选择购买时长（首次建议 3 个月或 6 个月）
- 使用优惠券
- 支付

**首次优惠参考**（2025年）：
- 2核4G 3个月：约 ¥300-400
- 2核4G 1年：约 ¥800-1200

#### DigitalOcean 采购流程（推荐国际用户）

**Step 1: 注册账号**
1. 访问 [DigitalOcean](https://www.digitalocean.com/)
2. 注册账号（可使用 GitHub 登录）
3. 绑定支付方式（信用卡或 PayPal）
4. 使用推广链接获取 $200 免费额度（60天有效）

**Step 2: 创建 Droplet**
1. Create → Droplets
2. 选择配置：
   ```
   Choose Region: Singapore（亚洲用户）
   Choose an image: Ubuntu 22.04 (LTS) x64
   Choose Size: Regular Intel
     - 2 GB / 1 CPU
     - 50 GB SSD
     - 2 TB transfer
     - $18/mo
   ```

3. 认证方式：
   - SSH Keys（推荐）
   - Password

4. 其他选项：
   - 启用 Monitoring（免费）
   - 启用 IPv6
   - 主机名：babybeats-prod

**Step 3: 创建并等待**
- 点击 Create Droplet
- 约 1-2 分钟创建完成
- 记录服务器 IP 地址

### 1.4 域名购买

#### 推荐域名注册商

| 注册商 | 优势 | 首年价格 |
|--------|------|----------|
| **阿里云万网** | 国内访问快，操作简单 | ¥55/年 (.com) |
| **腾讯云** | 价格优惠，新用户有折扣 | ¥55/年 (.com) |
| **Namecheap** | 国际知名，价格实惠 | $8.88/年 (.com) |
| **GoDaddy** | 全球最大，服务完善 | $11.99/年 (.com) |

**域名选择建议**：
- 首选 .com 域名
- 简短易记
- 与品牌相关
- 示例：`babybeats.com`, `babybeats.app`

---

## 2. 服务器初始化配置

### 2.1 连接服务器

```bash
# 使用密码登录
ssh root@YOUR_SERVER_IP

# 使用密钥登录（推荐）
ssh -i ~/.ssh/id_rsa root@YOUR_SERVER_IP
```

### 2.2 基础安全配置

#### Step 1: 更新系统
```bash
# Ubuntu/Debian
apt update && apt upgrade -y

# CentOS/RHEL
yum update -y
```

#### Step 2: 创建新用户（不使用 root）
```bash
# 创建用户
adduser babybeats

# 添加到 sudo 组
usermod -aG sudo babybeats

# 测试切换用户
su - babybeats
```

#### Step 3: 配置 SSH 密钥
```bash
# 在本地生成密钥（如果还没有）
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 复制公钥到服务器
ssh-copy-id babybeats@YOUR_SERVER_IP

# 或手动复制
mkdir -p ~/.ssh
echo "YOUR_PUBLIC_KEY" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

#### Step 4: 加固 SSH 配置
```bash
# 编辑 SSH 配置
sudo nano /etc/ssh/sshd_config

# 修改以下内容：
Port 2222                    # 修改默认端口（可选）
PermitRootLogin no           # 禁止 root 登录
PasswordAuthentication no    # 禁用密码登录（只允许密钥）
PubkeyAuthentication yes
AllowUsers babybeats         # 只允许特定用户

# 重启 SSH 服务
sudo systemctl restart sshd

# ⚠️ 重启前确保密钥登录可用，否则会被锁定
```

#### Step 5: 配置防火墙
```bash
# 使用 UFW（Ubuntu）
sudo apt install ufw -y

# 默认策略
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 开放必要端口
sudo ufw allow 2222/tcp    # SSH（如果改了端口）
sudo ufw allow 22/tcp      # SSH（默认端口）
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS

# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status
```

### 2.3 安装必要软件

#### 安装 Docker 和 Docker Compose

**Ubuntu/Debian**:
```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 添加当前用户到 docker 组
sudo usermod -aG docker $USER

# 重新登录或运行
newgrp docker

# 验证安装
docker --version

# 安装 Docker Compose
sudo apt install docker-compose-plugin -y

# 验证
docker compose version
```

**CentOS/RHEL**:
```bash
# 安装 Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 添加用户到 docker 组
sudo usermod -aG docker $USER
```

#### 安装其他工具
```bash
# Git
sudo apt install git -y

# Nginx（如果不使用 Docker）
sudo apt install nginx -y

# Certbot（SSL 证书）
sudo apt install certbot python3-certbot-nginx -y

# 监控工具
sudo apt install htop iotop nethogs -y
```

---

## 3. Docker 部署方式（推荐）

### 3.1 准备部署文件

#### Step 1: 克隆代码仓库
```bash
# 在服务器上
cd /home/babybeats
git clone https://github.com/yourusername/BabyBeats.git
cd BabyBeats/backend
```

#### Step 2: 创建环境变量文件
```bash
# 创建 .env 文件
nano .env
```

**生产环境配置 (.env)**:
```bash
# 应用配置
NODE_ENV=production
PORT=3000
API_VERSION=v1

# 数据库配置
DB_HOST=postgres
DB_PORT=5432
DB_NAME=babybeats
DB_USER=babybeats_user
DB_PASSWORD=CHANGE_THIS_STRONG_PASSWORD_123!@#

# JWT 配置
JWT_SECRET=CHANGE_THIS_TO_VERY_LONG_RANDOM_STRING_AT_LEAST_64_CHARS
JWT_EXPIRES_IN=7d

# CORS 配置
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# 速率限制
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# PostgreSQL 管理工具（可选）
PGADMIN_EMAIL=admin@yourdomain.com
PGADMIN_PASSWORD=CHANGE_THIS_ADMIN_PASSWORD
PGADMIN_PORT=5050
```

**生成强密码**:
```bash
# 生成 JWT Secret
openssl rand -base64 64

# 生成数据库密码
openssl rand -base64 32
```

#### Step 3: 配置 Docker Compose（已有）

确认 `docker-compose.yml` 配置正确：
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: babybeats-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME:-babybeats}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./src/database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - babybeats-network

  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: babybeats-api
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3000
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN}
      CORS_ORIGIN: ${CORS_ORIGIN}
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - babybeats-network

volumes:
  postgres_data:

networks:
  babybeats-network:
    driver: bridge
```

### 3.2 启动服务

```bash
# 构建并启动服务
docker compose up -d --build

# 查看日志
docker compose logs -f

# 查看服务状态
docker compose ps

# 检查健康状态
curl http://localhost:3000/health
```

**预期输出**:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-17T10:30:00.000Z",
  "uptime": 123.45,
  "database": "connected"
}
```

### 3.3 验证部署

```bash
# 测试 API 连接
curl http://localhost:3000/api/v1/health

# 测试注册接口
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!",
    "name": "Test User"
  }'

# 查看数据库
docker exec -it babybeats-postgres psql -U babybeats_user -d babybeats

# 在 psql 中
\dt  # 查看所有表
SELECT * FROM users;
\q   # 退出
```

### 3.4 Docker 管理命令

```bash
# 重启服务
docker compose restart

# 停止服务
docker compose stop

# 停止并删除容器
docker compose down

# 查看日志（最近 100 行）
docker compose logs --tail=100 api

# 进入容器
docker exec -it babybeats-api sh

# 查看资源占用
docker stats

# 清理未使用的镜像和容器
docker system prune -a
```

---

## 4. 传统部署方式（不使用 Docker）

### 4.1 安装 Node.js

```bash
# 使用 nvm 安装（推荐）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# 安装 Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# 验证
node --version
npm --version
```

### 4.2 安装 PostgreSQL

```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib -y

# 启动服务
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 创建数据库和用户
sudo -u postgres psql

# 在 psql 中执行
CREATE DATABASE babybeats;
CREATE USER babybeats_user WITH ENCRYPTED PASSWORD 'YOUR_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE babybeats TO babybeats_user;
\q
```

### 4.3 部署应用

```bash
# 克隆代码
cd /var/www
sudo git clone https://github.com/yourusername/BabyBeats.git
cd BabyBeats/backend

# 安装依赖
npm ci --only=production

# 创建 .env 文件
sudo nano .env
# 填入配置（参考上面的环境变量）

# 初始化数据库
sudo -u postgres psql -d babybeats -f src/database/schema.sql

# 构建应用
npm run build

# 测试运行
npm start
```

### 4.4 使用 PM2 管理进程

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start dist/server.js --name babybeats-api

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs babybeats-api

# 其他命令
pm2 restart babybeats-api
pm2 stop babybeats-api
pm2 delete babybeats-api

# 监控
pm2 monit
```

**PM2 配置文件** (ecosystem.config.js):
```javascript
module.exports = {
  apps: [{
    name: 'babybeats-api',
    script: './dist/server.js',
    instances: 2,  // 使用 2 个实例（负载均衡）
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    autorestart: true,
    watch: false
  }]
}

// 使用配置文件启动
pm2 start ecosystem.config.js
```

---

## 5. 数据库管理

### 5.1 数据库备份

#### 自动备份脚本
```bash
# 创建备份目录
mkdir -p /home/babybeats/backups

# 创建备份脚本
nano /home/babybeats/backup-database.sh
```

**备份脚本内容**:
```bash
#!/bin/bash

# 配置
BACKUP_DIR="/home/babybeats/backups"
DB_NAME="babybeats"
DB_USER="babybeats_user"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/babybeats_$DATE.sql.gz"
KEEP_DAYS=30

# 备份数据库
docker exec babybeats-postgres pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_FILE

# 删除旧备份
find $BACKUP_DIR -name "babybeats_*.sql.gz" -mtime +$KEEP_DAYS -delete

# 记录日志
echo "$(date): Backup completed - $BACKUP_FILE" >> $BACKUP_DIR/backup.log

# 可选：上传到云存储（阿里云 OSS/AWS S3）
# aliyun oss cp $BACKUP_FILE oss://your-bucket/backups/
```

```bash
# 设置执行权限
chmod +x /home/babybeats/backup-database.sh

# 测试备份
./backup-database.sh
```

#### 设置定时备份
```bash
# 编辑 crontab
crontab -e

# 每天凌晨 2 点备份
0 2 * * * /home/babybeats/backup-database.sh

# 每 6 小时备份一次
0 */6 * * * /home/babybeats/backup-database.sh
```

### 5.2 数据库恢复

```bash
# 恢复备份
gunzip -c /home/babybeats/backups/babybeats_20250117_020000.sql.gz | \
  docker exec -i babybeats-postgres psql -U babybeats_user -d babybeats
```

### 5.3 数据库监控

```bash
# 查看数据库大小
docker exec babybeats-postgres psql -U babybeats_user -d babybeats -c "\
  SELECT pg_size_pretty(pg_database_size('babybeats'));"

# 查看表大小
docker exec babybeats-postgres psql -U babybeats_user -d babybeats -c "\
  SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"

# 查看连接数
docker exec babybeats-postgres psql -U babybeats_user -d babybeats -c "\
  SELECT count(*) FROM pg_stat_activity WHERE datname = 'babybeats';"
```

---

## 6. 域名和 SSL 证书

### 6.1 配置 DNS 解析

登录域名注册商（如阿里云）：

1. 域名控制台 → 解析设置
2. 添加记录：

```
记录类型: A
主机记录: @
记录值: YOUR_SERVER_IP
TTL: 10 分钟

记录类型: A
主机记录: www
记录值: YOUR_SERVER_IP
TTL: 10 分钟

记录类型: CNAME
主机记录: api
记录值: yourdomain.com
TTL: 10 分钟
```

3. 等待 DNS 生效（通常 10 分钟）

**验证**:
```bash
# 检查 DNS 解析
ping yourdomain.com
nslookup yourdomain.com
dig yourdomain.com
```

### 6.2 安装 Nginx 反向代理

```bash
# 安装 Nginx
sudo apt install nginx -y

# 创建配置文件
sudo nano /etc/nginx/sites-available/babybeats
```

**Nginx 配置**:
```nginx
# 临时 HTTP 配置（用于申请 SSL）
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /health {
        access_log off;
        proxy_pass http://localhost:3000/health;
    }
}
```

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/babybeats /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx

# 设置开机自启
sudo systemctl enable nginx
```

### 6.3 申请免费 SSL 证书（Let's Encrypt）

```bash
# 使用 Certbot 自动申请
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# 按提示输入：
# 1. 邮箱地址（用于证书到期提醒）
# 2. 同意服务条款
# 3. 选择是否重定向到 HTTPS（建议选择 2 - 重定向）
```

Certbot 会自动修改 Nginx 配置并重启服务。

**最终 Nginx 配置**（自动生成）:
```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com api.yourdomain.com;

    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 日志
    access_log /var/log/nginx/babybeats_access.log;
    error_log /var/log/nginx/babybeats_error.log;

    # 限制请求大小（防止大文件上传攻击）
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /health {
        access_log off;
        proxy_pass http://localhost:3000/health;
    }
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### 6.4 证书自动续期

Let's Encrypt 证书有效期 90 天，Certbot 会自动设置续期任务：

```bash
# 测试自动续期
sudo certbot renew --dry-run

# 查看自动续期任务
sudo systemctl status certbot.timer

# 手动续期（如需要）
sudo certbot renew
```

---

## 7. 监控和日志

### 7.1 应用监控

#### 使用 PM2 监控（非 Docker）
```bash
# 实时监控
pm2 monit

# 查看详细信息
pm2 show babybeats-api

# 安装 PM2 Web 界面
pm2 install pm2-server-monit
```

#### 使用 Docker 监控
```bash
# 实时资源监控
docker stats

# 查看日志
docker compose logs -f --tail=100 api
```

### 7.2 服务器监控

#### 安装 Netdata（推荐）

```bash
# 安装 Netdata
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# 访问 http://YOUR_SERVER_IP:19999
```

**配置防火墙**:
```bash
# 如果只想内网访问，不开放端口
# 使用 SSH 隧道访问
ssh -L 19999:localhost:19999 babybeats@YOUR_SERVER_IP

# 然后在本地浏览器访问 http://localhost:19999
```

#### 基本监控脚本

创建 `/home/babybeats/monitor.sh`:
```bash
#!/bin/bash

# 获取系统信息
echo "=== System Status at $(date) ==="

# CPU 使用率
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1"%"}'

# 内存使用
echo "Memory Usage:"
free -h | awk 'NR==2{printf "Used: %s / %s (%.2f%%)\n", $3,$2,$3*100/$2 }'

# 磁盘使用
echo "Disk Usage:"
df -h | grep '^/dev/' | awk '{print $1 ": " $3 " / " $2 " (" $5 " used)"}'

# Docker 容器状态
echo "Docker Containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 数据库连接
echo "Database Connections:"
docker exec babybeats-postgres psql -U babybeats_user -d babybeats -t -c \
  "SELECT count(*) FROM pg_stat_activity WHERE datname = 'babybeats';"

echo "===================================="
```

```bash
# 设置执行权限
chmod +x /home/babybeats/monitor.sh

# 每小时记录一次
crontab -e
# 添加：
0 * * * * /home/babybeats/monitor.sh >> /home/babybeats/monitor.log 2>&1
```

### 7.3 日志管理

#### 配置日志轮转
```bash
# 创建日志轮转配置
sudo nano /etc/logrotate.d/babybeats
```

```
/var/log/nginx/babybeats_*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}

/home/babybeats/BabyBeats/backend/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    missingok
    create 0640 babybeats babybeats
}
```

#### Docker 日志管理
```bash
# 配置日志大小限制
# 编辑 /etc/docker/daemon.json
sudo nano /etc/docker/daemon.json
```

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

```bash
# 重启 Docker
sudo systemctl restart docker
```

### 7.4 错误告警（可选）

#### 使用邮件告警
```bash
# 安装 mailutils
sudo apt install mailutils -y

# 创建告警脚本
nano /home/babybeats/alert.sh
```

```bash
#!/bin/bash

# 检查 API 健康状态
if ! curl -f -s http://localhost:3000/health > /dev/null; then
    echo "BabyBeats API is down!" | mail -s "Alert: API Down" admin@yourdomain.com
fi

# 检查磁盘空间
DISK_USAGE=$(df -h | grep '^/dev/' | awk '{print $5}' | sed 's/%//' | sort -n | tail -1)
if [ $DISK_USAGE -gt 80 ]; then
    echo "Disk usage is above 80%: ${DISK_USAGE}%" | mail -s "Alert: High Disk Usage" admin@yourdomain.com
fi
```

```bash
# 每 5 分钟检查一次
crontab -e
# 添加：
*/5 * * * * /home/babybeats/alert.sh
```

---

## 8. 备份策略

### 8.1 完整备份方案

#### 1. 数据库备份（每天）
- 已在前面配置
- 保留 30 天

#### 2. 应用代码备份
```bash
# 备份整个应用目录
tar -czf /home/babybeats/backups/app_$(date +%Y%m%d).tar.gz \
  /home/babybeats/BabyBeats \
  --exclude=node_modules \
  --exclude=dist
```

#### 3. 配置文件备份
```bash
# 备份重要配置
mkdir -p /home/babybeats/backups/config
cp /home/babybeats/BabyBeats/backend/.env /home/babybeats/backups/config/
cp /etc/nginx/sites-available/babybeats /home/babybeats/backups/config/
cp /etc/ssl/certs/* /home/babybeats/backups/config/ssl/
```

### 8.2 云端备份（推荐）

#### 使用阿里云 OSS

```bash
# 安装 ossutil
wget http://gosspublic.alicdn.com/ossutil/1.7.15/ossutil64
chmod +x ossutil64
sudo mv ossutil64 /usr/local/bin/ossutil

# 配置
ossutil config

# 上传备份
ossutil cp -r /home/babybeats/backups oss://your-bucket/babybeats-backups/
```

#### 使用 AWS S3

```bash
# 安装 AWS CLI
pip3 install awscli

# 配置
aws configure

# 上传备份
aws s3 sync /home/babybeats/backups s3://your-bucket/babybeats-backups/
```

### 8.3 自动备份脚本（完整版）

创建 `/home/babybeats/full-backup.sh`:
```bash
#!/bin/bash

BACKUP_BASE="/home/babybeats/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$BACKUP_BASE/$DATE"
mkdir -p $BACKUP_DIR

# 1. 数据库备份
echo "Backing up database..."
docker exec babybeats-postgres pg_dump -U babybeats_user babybeats | \
  gzip > $BACKUP_DIR/database.sql.gz

# 2. 应用代码备份
echo "Backing up application..."
tar -czf $BACKUP_DIR/app.tar.gz \
  -C /home/babybeats BabyBeats \
  --exclude=node_modules \
  --exclude=dist

# 3. 配置文件备份
echo "Backing up configurations..."
mkdir -p $BACKUP_DIR/config
cp /home/babybeats/BabyBeats/backend/.env $BACKUP_DIR/config/
cp /etc/nginx/sites-available/babybeats $BACKUP_DIR/config/

# 4. 上传到云端（如果配置了）
if command -v ossutil &> /dev/null; then
    echo "Uploading to OSS..."
    ossutil cp -r $BACKUP_DIR oss://your-bucket/backups/
fi

# 5. 清理旧备份（保留 30 天）
find $BACKUP_BASE -maxdepth 1 -type d -mtime +30 -exec rm -rf {} \;

echo "Backup completed: $BACKUP_DIR"
```

```bash
# 每天凌晨 3 点执行完整备份
crontab -e
# 添加：
0 3 * * * /home/babybeats/full-backup.sh >> /home/babybeats/backup.log 2>&1
```

---

## 9. 性能优化

### 9.1 数据库优化

#### PostgreSQL 配置优化

编辑 `postgresql.conf`（Docker 方式需要挂载配置）:

```bash
# 进入容器
docker exec -it babybeats-postgres sh

# 编辑配置（或在宿主机创建配置文件挂载）
nano /var/lib/postgresql/data/postgresql.conf
```

**优化配置**（2GB 内存服务器）:
```
# 连接
max_connections = 100

# 内存
shared_buffers = 512MB
effective_cache_size = 1536MB
work_mem = 5MB
maintenance_work_mem = 128MB

# 检查点
checkpoint_completion_target = 0.9
wal_buffers = 16MB

# 查询规划
random_page_cost = 1.1  # SSD
effective_io_concurrency = 200

# 日志
log_min_duration_statement = 1000  # 记录慢查询（>1秒）
```

重启 PostgreSQL:
```bash
docker compose restart postgres
```

#### 创建索引

```sql
-- 常用查询的索引
CREATE INDEX idx_feedings_baby_id ON feedings(baby_id);
CREATE INDEX idx_feedings_timestamp ON feedings(timestamp);
CREATE INDEX idx_sleep_baby_id ON sleep(baby_id);
CREATE INDEX idx_diapers_baby_id ON diapers(baby_id);

-- 复合索引
CREATE INDEX idx_feedings_baby_timestamp ON feedings(baby_id, timestamp DESC);
```

### 9.2 应用优化

#### 启用 Gzip 压缩

在 Nginx 配置中添加:
```nginx
# Gzip 压缩
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript 
           application/json application/javascript application/xml+rss 
           application/rss+xml application/atom+xml image/svg+xml 
           text/x-js application/x-javascript application/x-font-ttf 
           application/font-woff application/font-woff2;
```

#### 启用缓存

```nginx
# 静态资源缓存
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# API 缓存（根据需要）
location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 10m;
    proxy_cache_key "$request_method$request_uri";
    add_header X-Cache-Status $upstream_cache_status;
}
```

#### Node.js 集群模式（PM2）

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'babybeats-api',
    script: './dist/server.js',
    instances: 'max',  // 使用所有 CPU 核心
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
}
```

### 9.3 添加 Redis 缓存（高级）

如果需要更高性能：

```yaml
# docker-compose.yml 添加 Redis
redis:
  image: redis:7-alpine
  container_name: babybeats-redis
  restart: unless-stopped
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
  command: redis-server --appendonly yes
  networks:
    - babybeats-network

volumes:
  redis_data:
```

在应用中使用 Redis 缓存频繁查询的数据（如宝宝列表、统计数据等）。

---

## 10. 安全加固

### 10.1 应用安全

- ✅ 使用强密码（JWT Secret, DB Password）
- ✅ 启用 HTTPS（SSL 证书）
- ✅ 配置 CORS（仅允许前端域名）
- ✅ 启用速率限制（防止暴力破解）
- ✅ 输入验证（Joi）
- ✅ SQL 注入防护（参数化查询）
- ✅ XSS 防护（Helmet）

### 10.2 服务器安全

```bash
# 自动安全更新
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades

# 安装 fail2ban（防止 SSH 暴力破解）
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 10.3 定期安全检查

```bash
# 检查开放端口
sudo netstat -tulpn | grep LISTEN

# 检查可疑登录
sudo lastlog
sudo last

# 检查系统日志
sudo journalctl -xe

# 扫描漏洞（可选）
sudo apt install lynis -y
sudo lynis audit system
```

---

## 11. 快速部署检查清单

### 部署前

- [ ] 购买并配置服务器（推荐：阿里云 2C4G）
- [ ] 注册域名并配置 DNS 解析
- [ ] 生成强密码（JWT Secret, DB Password）
- [ ] 准备 .env 配置文件

### 初始化服务器

- [ ] 连接 SSH 并更新系统
- [ ] 创建非 root 用户
- [ ] 配置 SSH 密钥认证
- [ ] 配置防火墙（UFW）
- [ ] 安装 Docker 和 Docker Compose

### 部署应用

- [ ] 克隆代码仓库
- [ ] 创建并配置 .env 文件
- [ ] 启动 Docker Compose
- [ ] 验证服务健康状态
- [ ] 初始化数据库（自动）

### 配置域名和 SSL

- [ ] 安装 Nginx
- [ ] 配置反向代理
- [ ] 申请 SSL 证书（Certbot）
- [ ] 配置 HTTPS 重定向
- [ ] 测试 HTTPS 访问

### 配置监控和备份

- [ ] 设置数据库自动备份
- [ ] 配置日志轮转
- [ ] 安装监控工具（Netdata）
- [ ] 设置告警通知（可选）

### 最终测试

- [ ] 测试 API 接口
- [ ] 测试用户注册登录
- [ ] 测试数据同步
- [ ] 压力测试（可选）
- [ ] 安全扫描（可选）

---

## 12. 故障排查

### 常见问题

#### 问题 1: 无法访问服务器
```bash
# 检查服务器是否在线
ping YOUR_SERVER_IP

# 检查端口是否开放
telnet YOUR_SERVER_IP 80
telnet YOUR_SERVER_IP 443

# 检查防火墙
sudo ufw status
```

#### 问题 2: Docker 容器无法启动
```bash
# 查看容器状态
docker compose ps

# 查看详细日志
docker compose logs api

# 检查配置
docker compose config

# 重新构建
docker compose down
docker compose up -d --build
```

#### 问题 3: 数据库连接失败
```bash
# 检查数据库容器
docker exec -it babybeats-postgres psql -U babybeats_user -d babybeats

# 检查密码是否正确
cat .env | grep DB_PASSWORD

# 检查网络连接
docker network ls
docker network inspect babybeats_babybeats-network
```

#### 问题 4: SSL 证书申请失败
```bash
# 检查 DNS 解析
nslookup yourdomain.com

# 检查 80 端口是否开放
sudo netstat -tulpn | grep :80

# 查看 Certbot 日志
sudo cat /var/log/letsencrypt/letsencrypt.log

# 手动申请（调试模式）
sudo certbot --nginx --dry-run -d yourdomain.com
```

---

## 总结

完成本指南后，您将拥有：

1. ✅ 生产级后端 API 服务
2. ✅ 安全的 HTTPS 访问
3. ✅ 自动备份机制
4. ✅ 完善的监控和日志
5. ✅ 高可用性配置

**下一步**：
- 更新前端 App 的 API 地址为您的域名
- 在 App Store Connect 中更新隐私政策 URL
- 开始 TestFlight 测试
- 发布到 App Store

**需要帮助？**
- 查看日志：`docker compose logs -f`
- 监控状态：`docker stats`
- 数据库管理：访问 http://YOUR_SERVER_IP:5050 (pgAdmin)

祝部署顺利！🚀

