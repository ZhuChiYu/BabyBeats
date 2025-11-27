# BabyBeats 腾讯云部署完整指南

## 📋 概述

本指南将帮助你将 BabyBeats 后端服务部署到腾讯云服务器。

**服务器信息：**
- 系统：Ubuntu 22.04 (预装 Docker)
- 公网 IP：111.230.110.95
- 内网 IP：10.1.24.5
- 域名：englishpartner.cn / www.englishpartner.cn

## 🚀 快速开始（3步部署）

### 步骤 1: 上传代码到服务器

在本地执行：

```bash
cd /path/to/BabyBeats

# 使用上传脚本
chmod +x UPLOAD_TO_SERVER.sh
bash UPLOAD_TO_SERVER.sh

# 或者手动上传
scp -r backend root@111.230.110.95:/opt/babybeats/
```

### 步骤 2: 连接服务器并部署

```bash
# SSH 连接到服务器
ssh root@111.230.110.95

# 进入项目目录
cd /opt/babybeats/backend

# 运行一键部署脚本
chmod +x deploy-tencent.sh
bash deploy-tencent.sh
```

### 步骤 3: 验证部署

```bash
# 在服务器上测试
curl http://localhost:3000/health

# 从外网测试
curl http://111.230.110.95:3000/health

# 应该返回：{"status":"ok","timestamp":"..."}
```

## 🎯 完成！

部署完成后，API 服务将在以下地址可用：
- **HTTP**: http://111.230.110.95:3000
- **域名** (配置 Nginx 后): https://englishpartner.cn/api

## 📁 已创建的文件清单

### 部署相关文件

```
backend/
├── Dockerfile                      # Docker 镜像构建文件
├── docker-compose.yml              # Docker Compose 配置
├── deploy-tencent.sh              # 一键部署脚本 ⭐
├── nginx-babybeats.conf           # Nginx 配置模板
├── .env.production                # 环境变量模板
├── DEPLOYMENT_COMMANDS.md          # 部署命令速查表
└── package.json                   # Node.js 依赖配置

前端配置:
├── baby-beats-app/
│   ├── src/services/api/apiClient.ts  # API 配置（已更新）
│   └── API_CONFIG.md                   # API 配置说明

部署文档:
├── TENCENT_CLOUD_DEPLOYMENT.md        # 腾讯云详细部署文档 ⭐
├── DEPLOYMENT_GUIDE_CN.md             # 本文档
└── UPLOAD_TO_SERVER.sh                # 代码上传脚本
```

## 📖 详细部署流程

如果快速部署遇到问题，请按以下详细步骤操作：

### 1. 准备工作

#### 1.1 检查本地环境

```bash
# 确保在项目根目录
cd /path/to/BabyBeats

# 查看文件结构
ls -la backend/
```

#### 1.2 配置 SSH 密钥（可选，提高安全性）

```bash
# 生成 SSH 密钥（如果还没有）
ssh-keygen -t rsa -b 4096

# 将公钥复制到服务器
ssh-copy-id root@111.230.110.95

# 测试连接
ssh root@111.230.110.95
```

### 2. 上传代码

#### 方式 A: 使用上传脚本（推荐）

```bash
chmod +x UPLOAD_TO_SERVER.sh
bash UPLOAD_TO_SERVER.sh
```

#### 方式 B: 使用 SCP

```bash
scp -r backend root@111.230.110.95:/opt/babybeats/
```

#### 方式 C: 使用 rsync

```bash
rsync -avz --exclude 'node_modules' --exclude '.env' \
  backend/ root@111.230.110.95:/opt/babybeats/backend/
```

#### 方式 D: 使用 Git

```bash
# 在服务器上
ssh root@111.230.110.95
cd /opt/babybeats
git clone <your-repository-url> backend
```

### 3. 服务器配置

#### 3.1 连接服务器

```bash
ssh root@111.230.110.95
```

#### 3.2 检查 Docker

```bash
# 检查 Docker 版本
docker --version
docker-compose --version

# 如果未安装 Docker Compose
sudo apt install docker-compose -y
```

#### 3.3 创建目录结构

```bash
mkdir -p /opt/babybeats/{backend,backups,logs}
```

### 4. 配置环境变量

#### 4.1 进入项目目录

```bash
cd /opt/babybeats/backend
```

#### 4.2 创建 .env 文件

```bash
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

# 保存密码
echo "=== 请保存以下密码 ===" > ~/babybeats_passwords.txt
echo "数据库密码: ${DB_PASSWORD}" >> ~/babybeats_passwords.txt
echo "JWT Secret: ${JWT_SECRET}" >> ~/babybeats_passwords.txt
echo "pgAdmin 密码: ${PGADMIN_PASSWORD}" >> ~/babybeats_passwords.txt
cat ~/babybeats_passwords.txt
```

### 5. 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看启动日志
docker-compose logs -f

# 等待服务启动（约 30 秒）
# 按 Ctrl+C 退出日志查看
```

### 6. 验证部署

```bash
# 检查容器状态
docker-compose ps

# 应该看到两个运行中的容器：
# - babybeats-postgres (healthy)
# - babybeats-api (healthy)

# 健康检查
curl http://localhost:3000/health

# 测试注册 API
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "name": "Test User"
  }'
```

### 7. 配置防火墙

```bash
# 在腾讯云控制台配置安全组
# 入站规则添加：
# - 端口 3000，协议 TCP，来源 0.0.0.0/0
# - 端口 80，协议 TCP，来源 0.0.0.0/0
# - 端口 443，协议 TCP，来源 0.0.0.0/0

# 服务器端 UFW 配置
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw enable
sudo ufw status
```

### 8. 配置 Nginx（可选但推荐）

```bash
# 安装 Nginx
sudo apt install nginx -y

# 创建配置文件
sudo cp nginx-babybeats.conf /etc/nginx/sites-available/babybeats

# 启用配置
sudo ln -s /etc/nginx/sites-available/babybeats /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 9. 配置 SSL（可选但推荐）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d englishpartner.cn -d www.englishpartner.cn

# 测试自动续期
sudo certbot renew --dry-run
```

### 10. 配置自动备份

```bash
# 备份脚本已由 deploy-tencent.sh 创建
# 手动执行备份
/opt/babybeats/backup.sh

# 查看定时任务
crontab -l

# 应该看到：0 2 * * * /opt/babybeats/backup.sh
```

## 🔧 前端配置

### 更新 API 地址

编辑文件：`baby-beats-app/src/services/api/apiClient.ts`

#### 生产环境使用域名（推荐）

```typescript
if (!__DEV__) {
  return 'https://englishpartner.cn/api/v1';
}
```

#### 或使用 IP 地址

```typescript
if (!__DEV__) {
  return 'http://111.230.110.95:3000/api/v1';
}
```

### 重新构建应用

```bash
cd baby-beats-app

# iOS
npx expo run:ios

# Android
npx expo run:android
```

## 🧪 测试

### 1. API 健康检查

```bash
curl http://111.230.110.95:3000/health
```

### 2. 注册测试用户

```bash
curl -X POST http://111.230.110.95:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "name": "Test User"
  }'
```

### 3. 登录测试

```bash
curl -X POST http://111.230.110.95:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

## 📊 监控和管理

### 查看日志

```bash
# API 日志
docker-compose logs -f api

# 数据库日志
docker-compose logs -f postgres

# 查看最近 100 行
docker-compose logs --tail=100 api
```

### 查看资源使用

```bash
# Docker 容器资源
docker stats

# 系统资源
htop

# 磁盘使用
df -h

# 内存使用
free -h
```

### 重启服务

```bash
# 重启 API
docker-compose restart api

# 重启所有
docker-compose restart

# 重新构建
docker-compose up -d --build
```

### 停止服务

```bash
# 停止所有服务
docker-compose down

# 停止并删除数据（谨慎）
docker-compose down -v
```

## 🐛 故障排查

### 问题 1: 无法连接服务器

```bash
# 检查网络
ping 111.230.110.95

# 检查 SSH
ssh -v root@111.230.110.95
```

### 问题 2: Docker 服务启动失败

```bash
# 查看详细日志
docker-compose logs api

# 检查端口占用
sudo netstat -tulpn | grep 3000

# 重启 Docker
sudo systemctl restart docker
```

### 问题 3: 数据库连接失败

```bash
# 检查数据库容器
docker-compose ps postgres

# 查看数据库日志
docker-compose logs postgres

# 进入数据库测试
docker exec -it babybeats-postgres psql -U babybeats_user -d babybeats
```

### 问题 4: API 返回 502

```bash
# 检查 API 容器
docker-compose ps api

# 检查 Nginx 配置
sudo nginx -t

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/error.log
```

## 🔄 更新部署

```bash
# 1. 在本地更新代码
cd /path/to/BabyBeats
git pull

# 2. 上传到服务器
bash UPLOAD_TO_SERVER.sh

# 3. 在服务器上重新构建
ssh root@111.230.110.95
cd /opt/babybeats/backend
docker-compose up -d --build

# 4. 查看日志确认
docker-compose logs -f api
```

## ✅ 部署清单

完成部署后，请确认：

- [ ] 代码已上传到服务器
- [ ] .env 配置文件已创建
- [ ] Docker 容器正常运行
- [ ] 健康检查通过
- [ ] 防火墙配置完成
- [ ] Nginx 配置完成（如使用）
- [ ] SSL 证书配置完成（如使用）
- [ ] 备份脚本配置完成
- [ ] 前端 API 地址已更新
- [ ] API 测试通过
- [ ] 密码已安全保存

## 📚 相关文档

- **详细部署文档**: `TENCENT_CLOUD_DEPLOYMENT.md`
- **命令速查表**: `backend/DEPLOYMENT_COMMANDS.md`
- **前端 API 配置**: `baby-beats-app/API_CONFIG.md`

## 🆘 获取帮助

如果遇到问题：

1. 查看日志：`docker-compose logs -f`
2. 检查文档：`TENCENT_CLOUD_DEPLOYMENT.md`
3. 查看命令：`backend/DEPLOYMENT_COMMANDS.md`

## 🎉 部署完成！

恭喜！你的 BabyBeats 后端服务已成功部署到腾讯云！

**API 地址：**
- HTTP: http://111.230.110.95:3000
- 域名: https://englishpartner.cn/api (配置 Nginx 后)

**下一步：**
1. 更新前端 API 配置
2. 测试所有 API 端点
3. 配置域名和 SSL (推荐)
4. 设置监控和告警

祝使用愉快！🚀

