# BabyBeats 快速部署指南

> 30 分钟快速部署 BabyBeats 到生产环境

## 🚀 前提条件

在开始之前，确保你已经：

- ✅ 拥有 Apple 开发者账号（$99/年）
- ✅ 购买了服务器（推荐阿里云 2核4G）
- ✅ 注册了域名
- ✅ 有基本的命令行操作经验

## 📦 三步部署法

### Step 1: 部署后端（10 分钟）

```bash
# 1. SSH 登录服务器
ssh root@YOUR_SERVER_IP

# 2. 运行一键安装脚本
wget -O setup-server.sh https://raw.githubusercontent.com/yourusername/BabyBeats/main/backend/setup-server.sh
sudo bash setup-server.sh

# 3. 切换到应用用户
su - babybeats

# 4. 克隆项目
git clone https://github.com/yourusername/BabyBeats.git
cd BabyBeats/backend

# 5. 配置环境变量
cp ENV_TEMPLATE.md .env
nano .env

# 修改以下内容：
# - DB_PASSWORD=你的强密码
# - JWT_SECRET=生成的64位随机字符串
# - CORS_ORIGIN=https://yourdomain.com

# 生成强密码：
openssl rand -base64 64  # JWT Secret
openssl rand -base64 32  # DB Password

# 6. 一键部署
chmod +x deploy.sh
./deploy.sh production

# 7. 验证
curl http://localhost:3000/health
```

### Step 2: 配置域名和 SSL（10 分钟）

```bash
# 1. 配置 DNS（在域名管理后台）
# A 记录: @ → YOUR_SERVER_IP
# A 记录: www → YOUR_SERVER_IP
# A 记录: api → YOUR_SERVER_IP

# 2. 配置 Nginx
sudo nano /etc/nginx/sites-available/babybeats

# 复制以下内容：
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# 3. 启用配置
sudo ln -s /etc/nginx/sites-available/babybeats /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 4. 申请 SSL 证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# 5. 验证 HTTPS
curl https://yourdomain.com/api/v1/health
```

### Step 3: 发布 iOS 应用（10 分钟操作 + 等待）

```bash
# 1. 本地机器操作
cd baby-beats-app

# 2. 安装 EAS CLI
npm install -g eas-cli

# 3. 登录 Expo
eas login

# 4. 更新 API 地址
nano app.json
# 更新配置中的 API URL 为 https://yourdomain.com

# 5. 配置 EAS
eas build:configure

# 6. 连接 Apple 账号
eas credentials

# 7. 构建并提交
chmod +x deploy-ios.sh
./deploy-ios.sh production

# 或手动执行：
eas build --platform ios --profile production

# 8. 等待构建完成（30-60分钟）
# 构建完成后会自动上传到 App Store Connect
```

---

## 📱 后续步骤

### TestFlight 测试（1-2 周）

1. 登录 [App Store Connect](https://appstoreconnect.apple.com)
2. TestFlight → 选择构建
3. 添加内部测试人员
4. 测试并收集反馈

### App Store 发布（3-5 天）

1. 准备截图和描述
2. 填写 App Store 信息
3. 提交审核
4. 等待审核通过（2-4 天）
5. 🎉 发布！

---

## ⚡ 快速命令参考

### 后端管理

```bash
# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f

# 重启服务
docker compose restart

# 备份数据库
~/backup-database.sh

# 健康检查
~/health-check.sh
```

### iOS 构建

```bash
# 查看构建列表
eas build:list

# 查看构建详情
eas build:view [build-id]

# 提交到 App Store
eas submit -p ios

# OTA 更新（无需审核）
eas update --branch production
```

---

## 🔧 故障排查

### 后端问题

**问题**: 容器无法启动
```bash
# 查看详细日志
docker compose logs api

# 检查配置
docker compose config

# 重新构建
docker compose down
docker compose up -d --build
```

**问题**: API 无法访问
```bash
# 检查防火墙
sudo ufw status

# 检查 Nginx
sudo nginx -t
sudo systemctl status nginx

# 检查端口
sudo netstat -tulpn | grep 3000
```

### iOS 构建问题

**问题**: 构建失败
```bash
# 查看构建日志
eas build:view [build-id]

# 清除缓存重试
eas build --platform ios --clear-cache
```

**问题**: 证书问题
```bash
# 重置证书
eas credentials
# 选择 "Remove all credentials"
# 重新构建会自动创建新证书
```

---

## 📊 成本速览

| 项目 | 费用 | 周期 |
|------|------|------|
| Apple 开发者账号 | $99 | 年 |
| 服务器（2核4G） | ¥200-300 | 月 |
| 域名 | ¥55 | 年 |
| SSL 证书 | 免费 | - |
| **首年总计** | **¥3,155** | - |

💡 **省钱技巧**: 使用云服务商新用户优惠，可节省 30-50%

---

## ⏱️ 时间线

| 阶段 | 预计时间 |
|------|---------|
| 后端部署 | 30 分钟 |
| iOS 配置和构建 | 30 分钟 + 1 小时等待 |
| TestFlight 测试 | 1-2 周 |
| App Store 审核 | 2-4 天 |
| **最快上线时间** | **2-3 周** |

---

## 🎯 检查清单

部署完成后，确保：

- [ ] 后端 API 可通过 HTTPS 访问
- [ ] 数据库自动备份已配置
- [ ] iOS 应用已上传到 TestFlight
- [ ] 至少完成内部测试
- [ ] App Store 资料准备完整
- [ ] 监控和日志已配置

---

## 📚 详细文档

如需详细说明，请查阅：

- **总体规划**: [DEPLOYMENT_OVERVIEW.md](./DEPLOYMENT_OVERVIEW.md)
- **后端部署**: [BACKEND_DEPLOYMENT_GUIDE.md](./BACKEND_DEPLOYMENT_GUIDE.md)
- **iOS 发布**: [IOS_DEPLOYMENT_GUIDE.md](./IOS_DEPLOYMENT_GUIDE.md)
- **完整清单**: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

---

## 🆘 需要帮助？

- 查看日志: `docker compose logs -f`
- 检查状态: `docker compose ps`
- 测试 API: `curl https://yourdomain.com/health`
- EAS 文档: https://docs.expo.dev/eas/

---

**祝部署顺利！** 🚀

*如有问题，请参考详细文档或提交 Issue*

