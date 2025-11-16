# 🚀 BabyBeats 后端快速启动指南

## ✅ 当前状态

### Docker 部署（已启动）✅

Docker 服务已经成功部署并运行！

**运行中的服务：**
- 🐘 PostgreSQL 数据库: `localhost:5432`
- 🚀 API 服务器: `http://localhost:3000`

**快速测试：**

```bash
# 健康检查
curl http://localhost:3000/health

# 测试注册
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "测试用户"
  }'

# 测试登录
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 📋 Docker 管理命令

### 查看服务状态
```bash
cd backend
docker compose ps
```

### 查看日志
```bash
# 查看 API 日志
docker compose logs api -f

# 查看数据库日志
docker compose logs postgres -f

# 查看所有日志
docker compose logs -f
```

### 停止服务
```bash
docker compose down
```

### 重启服务
```bash
docker compose restart api
docker compose restart postgres
```

### 完全清理（包括数据）
```bash
docker compose down -v
```

---

## 🔄 方式二：PM2 本地运行（备选）

如果你想在本地运行而不是 Docker：

### 1. 停止 Docker 服务
```bash
cd backend
docker compose down
```

### 2. 确保 PostgreSQL 在本地运行
```bash
# macOS
brew services start postgresql

# 或者只用 Docker 运行数据库
docker compose up -d postgres
```

### 3. 使用 PM2 启动 API
```bash
cd backend

# 开发模式
pm2 start ecosystem.config.js

# 生产模式
pm2 start ecosystem.config.js --env production

# 查看状态
pm2 status

# 查看日志
pm2 logs babybeats-api

# 停止
pm2 stop babybeats-api

# 重启
pm2 restart babybeats-api

# 删除
pm2 delete babybeats-api
```

### 4. PM2 开机自启（可选）
```bash
# 保存当前配置
pm2 save

# 生成启动脚本
pm2 startup

# 执行显示的命令（根据你的系统）
```

---

## 🎯 推荐使用方式

**开发环境：** Docker Compose（当前已运行）
- ✅ 一键启动所有服务
- ✅ 环境隔离
- ✅ 易于重置和清理
- ✅ 数据持久化

**生产环境：** PM2 + 系统级 PostgreSQL
- ✅ 更好的性能
- ✅ 进程管理
- ✅ 自动重启
- ✅ 日志管理

---

## 🔍 故障排查

### Docker 容器无法启动
```bash
# 查看详细日志
docker compose logs api --tail 100

# 重新构建
docker compose build --no-cache api

# 清理并重启
docker compose down -v
docker compose up -d
```

### 数据库连接失败
```bash
# 检查 PostgreSQL 状态
docker compose ps postgres

# 进入数据库容器
docker compose exec postgres psql -U postgres -d babybeats

# 查看数据库列表
\l

# 查看表
\dt
```

### 端口被占用
```bash
# 查看占用 3000 端口的进程
lsof -i :3000

# 查看占用 5432 端口的进程
lsof -i :5432

# 停止占用的进程或修改 docker-compose.yml 中的端口映射
```

---

## 📊 监控和维护

### Docker 方式
```bash
# 查看资源使用
docker stats babybeats-api babybeats-postgres

# 清理未使用的资源
docker system prune -a
```

### PM2 方式
```bash
# 监控面板
pm2 monit

# 生成报告
pm2 describe babybeats-api

# 查看资源使用
pm2 list
```

---

## 🔐 安全提醒

在生产环境中，请确保：

1. ✅ 修改 `.env` 中的 `JWT_SECRET` 为强随机字符串
2. ✅ 使用强数据库密码
3. ✅ 配置 `CORS_ORIGIN` 为你的前端域名
4. ✅ 启用 HTTPS
5. ✅ 定期备份数据库
6. ✅ 更新依赖包

---

## 📞 下一步

现在后端已经运行，你可以：

1. **测试 API**：使用上面的 curl 命令
2. **启动前端**：`cd baby-beats-app && npm start`
3. **查看文档**：阅读 `README.md` 和 `DEPLOYMENT.md`
4. **配置前端**：修改前端的 API 地址指向 `http://localhost:3000`

---

**🎉 恭喜！后端服务已成功部署！**

