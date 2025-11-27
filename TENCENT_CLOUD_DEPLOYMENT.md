# 腾讯云服务器部署指南

## 📋 服务器信息

- **操作系统**: Ubuntu 22.04 (Docker预装)
- **公网IP**: 111.230.110.95
- **内网IP**: 10.1.24.5
- **域名**: englishpartner.cn / www.englishpartner.cn

## 🚀 快速部署步骤

### 步骤 1: 连接服务器

```bash
# SSH 连接到服务器
ssh root@111.230.110.95

# 或者如果配置了密钥
ssh -i /path/to/your/key.pem root@111.230.110.95
```

### 步骤 2: 安装必要工具

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker Compose (如果未安装)
sudo apt install docker-compose -y

# 验证 Docker 和 Docker Compose
docker --version
docker-compose --version

# 安装 git (如果未安装)
sudo apt install git -y
```

### 步骤 3: 部署代码

```bash
# 创建项目目录
mkdir -p /opt/babybeats
cd /opt/babybeats

# 克隆代码仓库（方式1：使用 git）
git clone <your-repository-url> .

# 或者方式2：手动上传代码
# 在本地执行：
# scp -r backend root@111.230.110.95:/opt/babybeats/
```

### 步骤 4: 配置环境变量

```bash
cd /opt/babybeats/backend

# 创建 .env 文件
cat > .env << 'EOF'
# 环境配置
NODE_ENV=production

# 服务端口
PORT=3000

# API 版本
API_VERSION=v1

# 数据库配置
DB_HOST=postgres
DB_PORT=5432
DB_NAME=babybeats
DB_USER=babybeats_user
DB_PASSWORD=YourStrongPassword123!

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d

# CORS 配置（允许你的前端域名）
CORS_ORIGIN=*

# 限流配置
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# pgAdmin 配置（可选）
PGADMIN_EMAIL=admin@babybeats.local
PGADMIN_PASSWORD=AdminPassword123!
PGADMIN_PORT=5050
EOF

# 设置文件权限
chmod 600 .env
```

### 步骤 5: 启动服务

```bash
# 确保在 backend 目录
cd /opt/babybeats/backend

# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 步骤 6: 验证部署

```bash
# 检查服务健康状态
curl http://localhost:3000/health

# 应该返回类似：
# {"status":"ok","timestamp":"..."}

# 从外网测试
curl http://111.230.110.95:3000/health
```

## 🔧 配置防火墙

### 腾讯云安全组配置

在腾讯云控制台配置安全组规则：

```
入站规则：
- 协议: TCP, 端口: 3000, 来源: 0.0.0.0/0  (API服务)
- 协议: TCP, 端口: 80, 来源: 0.0.0.0/0    (HTTP)
- 协议: TCP, 端口: 443, 来源: 0.0.0.0/0   (HTTPS)
- 协议: TCP, 端口: 22, 来源: 你的IP       (SSH，限制IP更安全)
- 协议: TCP, 端口: 5050, 来源: 你的IP     (pgAdmin，可选)
```

### UFW 防火墙配置（服务器内部）

```bash
# 启用 UFW
sudo ufw enable

# 允许 SSH
sudo ufw allow 22/tcp

# 允许 API 服务
sudo ufw allow 3000/tcp

# 允许 HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 查看状态
sudo ufw status
```

## 🌐 配置域名和 Nginx（推荐）

### 安装 Nginx

```bash
# 安装 Nginx
sudo apt install nginx -y

# 创建 Nginx 配置
sudo nano /etc/nginx/sites-available/babybeats
```

### Nginx 配置文件

```nginx
server {
    listen 80;
    server_name englishpartner.cn www.englishpartner.cn;

    # API 代理
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 健康检查
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }

    # 根路径返回 API 信息
    location / {
        return 200 '{"message":"BabyBeats API Server","version":"1.0.0"}';
        add_header Content-Type application/json;
    }
}
```

### 启用 Nginx 配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/babybeats /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx

# 设置开机自启
sudo systemctl enable nginx
```

### 配置 SSL 证书（推荐使用 Let's Encrypt）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书并自动配置
sudo certbot --nginx -d englishpartner.cn -d www.englishpartner.cn

# 自动续期（Certbot 会自动设置 cron job）
sudo certbot renew --dry-run
```

## 📊 管理和监控

### Docker 容器管理

```bash
# 查看运行中的容器
docker-compose ps

# 查看日志
docker-compose logs -f api      # API 服务日志
docker-compose logs -f postgres # 数据库日志

# 重启服务
docker-compose restart api

# 停止所有服务
docker-compose down

# 停止并删除数据
docker-compose down -v

# 更新代码后重新构建
docker-compose up -d --build
```

### 数据库管理

```bash
# 进入数据库容器
docker exec -it babybeats-postgres psql -U babybeats_user -d babybeats

# 备份数据库
docker exec babybeats-postgres pg_dump -U babybeats_user babybeats > backup_$(date +%Y%m%d).sql

# 恢复数据库
docker exec -i babybeats-postgres psql -U babybeats_user babybeats < backup_20240101.sql
```

### 使用 pgAdmin（可选）

```bash
# 启动 pgAdmin
docker-compose --profile tools up -d pgadmin

# 访问 pgAdmin
# http://111.230.110.95:5050
# 邮箱: admin@babybeats.local
# 密码: AdminPassword123!
```

### 查看系统资源

```bash
# 查看 Docker 资源使用
docker stats

# 查看磁盘使用
df -h

# 查看内存使用
free -h

# 查看 CPU 使用
top
```

## 🔄 更新部署

### 更新代码

```bash
cd /opt/babybeats/backend

# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build

# 查看日志确认
docker-compose logs -f api
```

### 更新环境变量

```bash
# 编辑 .env 文件
nano .env

# 重启服务使配置生效
docker-compose restart api
```

## 🛡️ 安全建议

1. **修改默认密码**
   - 数据库密码
   - pgAdmin 密码
   - JWT Secret

2. **限制访问**
   - SSH 只允许密钥登录
   - 数据库端口不对外开放
   - pgAdmin 限制 IP 访问

3. **定期备份**
   ```bash
   # 创建备份脚本
   cat > /opt/babybeats/backup.sh << 'EOF'
   #!/bin/bash
   BACKUP_DIR="/opt/babybeats/backups"
   DATE=$(date +%Y%m%d_%H%M%S)
   
   mkdir -p $BACKUP_DIR
   docker exec babybeats-postgres pg_dump -U babybeats_user babybeats > $BACKUP_DIR/backup_$DATE.sql
   
   # 保留最近 7 天的备份
   find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
   EOF
   
   chmod +x /opt/babybeats/backup.sh
   
   # 设置定时任务（每天凌晨2点）
   (crontab -l 2>/dev/null; echo "0 2 * * * /opt/babybeats/backup.sh") | crontab -
   ```

4. **监控日志**
   ```bash
   # 设置日志轮转
   cat > /etc/logrotate.d/docker-compose << 'EOF'
   /var/lib/docker/containers/*/*.log {
       rotate 7
       daily
       compress
       size=10M
       missingok
       delaycompress
       copytruncate
   }
   EOF
   ```

## 📱 前端配置

更新前端应用的 API 地址：

### 使用域名（推荐）
```typescript
// baby-beats-app/src/services/api/config.ts
export const API_BASE_URL = 'https://englishpartner.cn/api';
```

### 使用 IP 地址
```typescript
// baby-beats-app/src/services/api/config.ts
export const API_BASE_URL = 'http://111.230.110.95:3000';
```

## 🐛 故障排查

### 服务无法启动

```bash
# 查看详细日志
docker-compose logs api

# 检查端口占用
sudo netstat -tulpn | grep 3000

# 检查 Docker 状态
sudo systemctl status docker
```

### 数据库连接失败

```bash
# 检查数据库容器状态
docker-compose ps postgres

# 查看数据库日志
docker-compose logs postgres

# 测试数据库连接
docker exec babybeats-postgres pg_isready -U babybeats_user
```

### 502 Bad Gateway

```bash
# 检查 API 服务状态
docker-compose ps api

# 检查 Nginx 配置
sudo nginx -t

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

## 📞 测试 API

```bash
# 健康检查
curl http://111.230.110.95:3000/health

# 注册测试
curl -X POST http://111.230.110.95:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456","name":"Test User"}'

# 登录测试
curl -X POST http://111.230.110.95:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}'
```

## 🎯 完成清单

- [ ] SSH 连接服务器成功
- [ ] Docker 和 Docker Compose 正常工作
- [ ] 代码已上传到服务器
- [ ] .env 配置文件已创建
- [ ] Docker 服务启动成功
- [ ] API 健康检查通过
- [ ] 防火墙规则配置完成
- [ ] Nginx 配置完成（可选）
- [ ] SSL 证书配置完成（可选）
- [ ] 前端 API 地址更新
- [ ] 备份脚本设置完成

## 🔗 相关链接

- 腾讯云控制台: https://console.cloud.tencent.com/
- API 地址: http://111.230.110.95:3000
- pgAdmin: http://111.230.110.95:5050 (如果启用)

---

**部署完成后记得测试所有 API 端点！** 🎉

