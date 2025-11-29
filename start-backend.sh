#!/bin/bash

# BabyBeats 一键启动脚本（腾讯云服务器）
# 此脚本用于快速检查和启动 BabyBeats 后端服务

set -e

echo "🚀 BabyBeats 快速启动脚本"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 进入后端目录
cd "$(dirname "$0")/backend"

echo -e "${BLUE}📁 当前目录: $(pwd)${NC}"
echo ""

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker 未运行，正在启动 Docker...${NC}"
    sudo systemctl start docker
    sleep 3
fi

echo -e "${GREEN}✅ Docker 正在运行${NC}"
echo ""

# 检查服务是否已经运行
if docker-compose -f docker-compose.production.yml ps | grep -q "Up"; then
    echo -e "${YELLOW}⚠️  服务已经在运行中${NC}"
    echo ""
    echo "当前服务状态："
    docker-compose -f docker-compose.production.yml ps
    echo ""
    
    read -p "是否重启服务？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🔄 重启服务...${NC}"
        docker-compose -f docker-compose.production.yml restart
        echo -e "${GREEN}✅ 服务已重启${NC}"
    fi
else
    echo -e "${BLUE}🚀 启动服务...${NC}"
    docker-compose -f docker-compose.production.yml up -d
    
    echo ""
    echo -e "${YELLOW}⏳ 等待服务启动...${NC}"
    sleep 10
    
    # 检查健康状态
    max_attempts=30
    attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if curl -f http://localhost:4100/health &> /dev/null; then
            echo -e "${GREEN}✅ 服务启动成功！${NC}"
            break
        fi
        attempt=$((attempt + 1))
        echo "等待中... ($attempt/$max_attempts)"
        sleep 2
    done
    
    if [ $attempt -eq $max_attempts ]; then
        echo -e "${RED}❌ 服务启动超时，请检查日志${NC}"
        docker-compose -f docker-compose.production.yml logs --tail 50
        exit 1
    fi
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ BabyBeats 后端服务运行中${NC}"
echo "================================"
echo ""
echo "📊 服务状态："
docker-compose -f docker-compose.production.yml ps
echo ""
echo "📍 服务地址："
echo -e "  ${BLUE}API 服务:${NC} http://111.230.110.95:4100"
echo -e "  ${BLUE}健康检查:${NC} http://111.230.110.95:4100/health"
echo -e "  ${BLUE}API Base:${NC} http://111.230.110.95:4100/api/v1"
echo ""
echo "📝 常用命令："
echo "  查看日志: docker-compose -f docker-compose.production.yml logs -f"
echo "  停止服务: docker-compose -f docker-compose.production.yml down"
echo "  重启服务: docker-compose -f docker-compose.production.yml restart"
echo ""

# 测试 API
echo -e "${BLUE}🔍 测试 API 连接...${NC}"
if curl -s http://localhost:4100/health | grep -q "ok"; then
    echo -e "${GREEN}✅ API 健康检查通过${NC}"
else
    echo -e "${YELLOW}⚠️  API 健康检查失败，请查看日志${NC}"
fi

echo ""
echo -e "${GREEN}🎉 启动完成！${NC}"

