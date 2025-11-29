#!/bin/bash

# BabyBeats 后端服务一键部署脚本
# 适用于腾讯云服务器 (111.230.110.95)

set -e

echo "🚀 BabyBeats 后端服务一键部署"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置变量
PROJECT_DIR="/opt/BabyBeats"
BACKEND_DIR="$PROJECT_DIR/backend"
GITHUB_REPO="https://github.com/ZhuChiYu/BabyBeats.git"
BRANCH="main"

echo -e "${BLUE}📋 部署配置${NC}"
echo "项目目录: $PROJECT_DIR"
echo "仓库地址: $GITHUB_REPO"
echo "分支: $BRANCH"
echo ""

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ 请使用 root 用户运行此脚本${NC}"
    echo "使用: sudo ./deploy-full.sh"
    exit 1
fi

# ================================
# 步骤 1: 安装依赖
# ================================
echo -e "${YELLOW}📦 步骤 1/6: 检查系统依赖${NC}"

# 检查 Git
if ! command -v git &> /dev/null; then
    echo "安装 Git..."
    apt update && apt install -y git
fi

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "安装 Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl start docker
    systemctl enable docker
fi

# 检查 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "安装 Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

echo -e "${GREEN}✅ 系统依赖检查完成${NC}"
echo ""

# ================================
# 步骤 2: 克隆或更新代码
# ================================
echo -e "${YELLOW}📥 步骤 2/6: 获取项目代码${NC}"

if [ -d "$PROJECT_DIR" ]; then
    echo "项目目录已存在，更新代码..."
    cd $PROJECT_DIR
    git fetch origin
    git reset --hard origin/$BRANCH
    git pull origin $BRANCH
else
    echo "克隆项目代码..."
    mkdir -p /opt
    cd /opt
    git clone $GITHUB_REPO BabyBeats
    cd $PROJECT_DIR
fi

echo -e "${GREEN}✅ 代码已更新${NC}"
echo ""

# ================================
# 步骤 3: 配置环境变量
# ================================
echo -e "${YELLOW}⚙️  步骤 3/6: 配置环境变量${NC}"

cd $BACKEND_DIR

if [ ! -f ".env.production" ]; then
    echo "创建 .env.production 文件..."
    cat > .env.production << 'EOF'
NODE_ENV=production
PORT=3000
API_VERSION=v1

DB_HOST=postgres
DB_PORT=5432
DB_NAME=babybeats
DB_USER=babybeats_user
DB_PASSWORD=CHANGE_THIS_PASSWORD

JWT_SECRET=CHANGE_THIS_SECRET_KEY
JWT_EXPIRES_IN=90d

CORS_ORIGIN=*

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

PGADMIN_EMAIL=admin@babybeats.local
PGADMIN_PASSWORD=CHANGE_THIS_PASSWORD
EOF
    
    echo -e "${RED}⚠️  请编辑 .env.production 修改密码和密钥！${NC}"
    echo "文件位置: $BACKEND_DIR/.env.production"
    read -p "是否现在编辑？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        nano .env.production
    else
        echo -e "${YELLOW}⚠️  请稍后手动修改配置文件！${NC}"
    fi
fi

echo -e "${GREEN}✅ 环境变量配置完成${NC}"
echo ""

# ================================
# 步骤 4: 构建和启动服务
# ================================
echo -e "${YELLOW}🏗️  步骤 4/6: 构建和启动 Docker 服务${NC}"

cd $BACKEND_DIR

# 停止旧服务
echo "停止旧服务..."
docker-compose -f docker-compose.production.yml down || true

# 清理旧镜像
echo "清理旧镜像..."
docker-compose -f docker-compose.production.yml rm -f || true

# 构建新镜像
echo "构建新镜像..."
docker-compose -f docker-compose.production.yml build --no-cache

# 启动服务
echo "启动服务..."
docker-compose -f docker-compose.production.yml up -d

echo -e "${GREEN}✅ 服务已启动${NC}"
echo ""

# ================================
# 步骤 5: 等待服务就绪
# ================================
echo -e "${YELLOW}⏳ 步骤 5/6: 等待服务就绪${NC}"

sleep 10

max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -f http://localhost:4100/health &> /dev/null; then
        echo -e "${GREEN}✅ 服务已就绪！${NC}"
        break
    fi
    attempt=$((attempt + 1))
    echo "等待中... ($attempt/$max_attempts)"
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}❌ 服务启动超时${NC}"
    echo "查看日志:"
    docker-compose -f docker-compose.production.yml logs --tail 50
    exit 1
fi

echo ""

# ================================
# 步骤 6: 配置 Nginx 和 SSL（可选）
# ================================
echo -e "${YELLOW}🔒 步骤 6/6: 配置 Nginx 和 SSL${NC}"

read -p "是否配置 Nginx 和 SSL？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f "$BACKEND_DIR/setup-nginx-ssl.sh" ]; then
        chmod +x $BACKEND_DIR/setup-nginx-ssl.sh
        $BACKEND_DIR/setup-nginx-ssl.sh
    else
        echo -e "${YELLOW}⚠️  未找到 Nginx 配置脚本${NC}"
    fi
else
    echo "跳过 Nginx 配置"
fi

echo ""

# ================================
# 完成
# ================================
echo "================================"
echo -e "${GREEN}✅ 部署完成！${NC}"
echo "================================"
echo ""
echo "📊 服务状态："
docker-compose -f $BACKEND_DIR/docker-compose.production.yml ps
echo ""
echo "📍 服务访问地址："
echo -e "  ${BLUE}API (直接访问):${NC} http://111.230.110.95:4100/api/v1"
echo -e "  ${BLUE}健康检查:${NC} http://111.230.110.95:4100/health"
if command -v nginx &> /dev/null; then
    echo -e "  ${BLUE}域名访问:${NC} https://englishpartner.cn/babybeats/api/v1"
fi
echo ""
echo "📝 常用命令："
echo "  查看日志: docker-compose -f $BACKEND_DIR/docker-compose.production.yml logs -f"
echo "  重启服务: docker-compose -f $BACKEND_DIR/docker-compose.production.yml restart"
echo "  停止服务: docker-compose -f $BACKEND_DIR/docker-compose.production.yml down"
echo ""
echo "🧪 测试 API："
echo "  curl http://111.230.110.95:4100/health"
echo "  curl -X POST http://111.230.110.95:4100/api/v1/auth/register \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"email\":\"test@example.com\",\"password\":\"Test123\",\"name\":\"测试\"}'"
echo ""
echo -e "${GREEN}🎉 BabyBeats 后端部署成功！${NC}"

