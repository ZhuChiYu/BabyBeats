#!/bin/bash

# 启动 Expo Go 模式（真机调试）

echo "📱 启动 Expo Go 模式"
echo "================================"
echo ""

# 1. 清理端口
echo "1️⃣  清理端口..."
lsof -ti:8081,8082 | xargs kill -9 2>/dev/null || true
sleep 2
echo "✅ 完成"
echo ""

# 2. 清理缓存
echo "2️⃣  清理缓存..."
rm -rf .expo node_modules/.cache
echo "✅ 完成"
echo ""

# 3. 获取本机 IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
echo "3️⃣  本机 IP: $LOCAL_IP"
echo ""

# 4. 重要提示
echo "================================"
echo "📱 Expo Go 真机调试步骤："
echo ""
echo "1️⃣  在手机上打开 Expo Go App"
echo "   （不是手机相机！）"
echo ""
echo "2️⃣  点击 'Scan QR code'"
echo ""
echo "3️⃣  扫描下方二维码"
echo ""
echo "⚠️  如果显示 'development build':"
echo "   按 's' 键切换到 Expo Go"
echo ""
echo "================================"
echo ""

# 5. 启动（强制 Expo Go 模式）
export EXPO_USE_DEV_CLIENT=false
npx expo start --go --clear

echo ""
echo "================================"
echo "👋 服务已停止"
echo "================================"

