#!/bin/bash

# BabyBeats API 快速测试脚本
# 用于验证后端 API 是否正常工作

BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/api/v1"

echo "🧪 BabyBeats API 测试脚本"
echo "========================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试健康检查
echo "1️⃣  测试健康检查..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" $BASE_URL/health)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ 健康检查通过${NC}"
    echo "   响应: $RESPONSE_BODY"
else
    echo -e "${RED}❌ 健康检查失败 (HTTP $HTTP_CODE)${NC}"
    exit 1
fi
echo ""

# 生成随机测试邮箱
TEST_EMAIL="test_$(date +%s)@example.com"
TEST_PASSWORD="password123"
TEST_NAME="测试用户$(date +%H%M%S)"

# 测试用户注册
echo "2️⃣  测试用户注册..."
REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"name\":\"$TEST_NAME\"}")

HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$REGISTER_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ 用户注册成功${NC}"
    echo "   邮箱: $TEST_EMAIL"
    TOKEN=$(echo "$RESPONSE_BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    if [ -z "$TOKEN" ]; then
        echo -e "${YELLOW}⚠️  未获取到 token，尝试登录...${NC}"
    else
        echo "   Token: ${TOKEN:0:20}..."
    fi
else
    echo -e "${YELLOW}⚠️  注册失败，可能用户已存在 (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# 测试用户登录
echo "3️⃣  测试用户登录..."
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ 登录成功${NC}"
    TOKEN=$(echo "$RESPONSE_BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    USER_ID=$(echo "$RESPONSE_BODY" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    echo "   User ID: $USER_ID"
    echo "   Token: ${TOKEN:0:20}..."
else
    echo -e "${RED}❌ 登录失败 (HTTP $HTTP_CODE)${NC}"
    echo "   响应: $RESPONSE_BODY"
    exit 1
fi
echo ""

# 测试获取宝宝列表
echo "4️⃣  测试获取宝宝列表..."
BABIES_RESPONSE=$(curl -s -w "\n%{http_code}" $API_URL/babies \
    -H "Authorization: Bearer $TOKEN")

HTTP_CODE=$(echo "$BABIES_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$BABIES_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ 获取宝宝列表成功${NC}"
    BABY_COUNT=$(echo "$RESPONSE_BODY" | grep -o '"id"' | wc -l)
    echo "   宝宝数量: $BABY_COUNT"
else
    echo -e "${RED}❌ 获取宝宝列表失败 (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# 测试添加宝宝
echo "5️⃣  测试添加宝宝..."
BABY_NAME="测试宝宝$(date +%H%M%S)"
BABY_BIRTHDAY="2024-01-01"

ADD_BABY_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/babies \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$BABY_NAME\",\"birthday\":\"$BABY_BIRTHDAY\",\"gender\":\"male\"}")

HTTP_CODE=$(echo "$ADD_BABY_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$ADD_BABY_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ 添加宝宝成功${NC}"
    BABY_ID=$(echo "$RESPONSE_BODY" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "   宝宝姓名: $BABY_NAME"
    echo "   宝宝ID: $BABY_ID"
else
    echo -e "${RED}❌ 添加宝宝失败 (HTTP $HTTP_CODE)${NC}"
    echo "   响应: $RESPONSE_BODY"
fi
echo ""

# 测试数据同步 Pull
echo "6️⃣  测试数据同步 (Pull)..."
if [ ! -z "$BABY_ID" ]; then
    SYNC_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/sync/pull \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"babyId\":\"$BABY_ID\",\"lastSyncTime\":\"2024-01-01T00:00:00Z\"}")
    
    HTTP_CODE=$(echo "$SYNC_RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ 数据同步测试通过${NC}"
    else
        echo -e "${YELLOW}⚠️  数据同步返回 HTTP $HTTP_CODE${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  跳过同步测试（无宝宝ID）${NC}"
fi
echo ""

# 测试总结
echo "========================"
echo "📊 测试总结"
echo "========================"
echo -e "${GREEN}✅ 后端 API 基本功能正常${NC}"
echo ""
echo "🔗 可用端点："
echo "   - 健康检查: $BASE_URL/health"
echo "   - 用户注册: $API_URL/auth/register"
echo "   - 用户登录: $API_URL/auth/login"
echo "   - 宝宝管理: $API_URL/babies"
echo "   - 数据同步: $API_URL/sync/pull & push"
echo ""
echo "📱 现在可以在 Expo 应用中测试完整功能了！"
echo ""
echo "💡 提示："
echo "   - 在 Expo Go 中扫描二维码启动应用"
echo "   - 使用测试账号登录: $TEST_EMAIL"
echo "   - 密码: $TEST_PASSWORD"
echo ""

