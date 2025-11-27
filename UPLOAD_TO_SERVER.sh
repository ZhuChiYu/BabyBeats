#!/bin/bash

###############################################################################
# 上传代码到腾讯云服务器脚本
# 使用方法: bash UPLOAD_TO_SERVER.sh
###############################################################################

# 配置
SERVER_IP="111.230.110.95"
SERVER_USER="root"
REMOTE_PATH="/opt/babybeats"
LOCAL_BACKEND="./backend"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "================================================"
echo "  上传 BabyBeats 后端代码到腾讯云服务器"
echo "================================================"
echo -e "${NC}"

# 检查本地 backend 目录是否存在
if [ ! -d "$LOCAL_BACKEND" ]; then
    echo -e "${RED}错误: backend 目录不存在${NC}"
    exit 1
fi

echo -e "${GREEN}[1/4]${NC} 准备上传代码..."
echo "  服务器: ${SERVER_USER}@${SERVER_IP}"
echo "  目标路径: ${REMOTE_PATH}/backend"
echo ""

# 询问是否继续
read -p "是否继续? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}已取消${NC}"
    exit 0
fi

echo -e "${GREEN}[2/4]${NC} 在服务器上创建目录..."
ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p ${REMOTE_PATH}/backend"

if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 无法连接到服务器${NC}"
    echo "请检查："
    echo "  1. 服务器 IP 是否正确"
    echo "  2. SSH 密钥是否配置正确"
    echo "  3. 网络连接是否正常"
    exit 1
fi

echo -e "${GREEN}[3/4]${NC} 使用 rsync 上传代码..."
echo "  正在上传，请稍候..."

rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.env' \
    --exclude 'dist' \
    --exclude '.git' \
    --exclude '*.log' \
    ${LOCAL_BACKEND}/ ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/backend/

if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 上传失败${NC}"
    echo "如果没有 rsync，可以使用 scp："
    echo "  scp -r ${LOCAL_BACKEND}/* ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/backend/"
    exit 1
fi

echo -e "${GREEN}[4/4]${NC} 上传完成！"
echo ""
echo -e "${BLUE}================================================"
echo "  后续操作"
echo "================================================${NC}"
echo ""
echo "1. 连接到服务器："
echo -e "   ${YELLOW}ssh ${SERVER_USER}@${SERVER_IP}${NC}"
echo ""
echo "2. 进入项目目录："
echo -e "   ${YELLOW}cd ${REMOTE_PATH}/backend${NC}"
echo ""
echo "3. 运行部署脚本："
echo -e "   ${YELLOW}bash deploy-tencent.sh${NC}"
echo ""
echo "或者手动部署："
echo -e "   ${YELLOW}docker-compose up -d --build${NC}"
echo ""
echo -e "${GREEN}✓ 完成！${NC}"

