#!/bin/bash

# Expo Tunnel 远程调试模式
# 不需要手机和电脑在同一网络

echo "🌐 启动 Expo Tunnel 远程调试"
echo "================================"
echo ""

# 1. 停止旧服务
echo "1️⃣  停止旧服务..."
lsof -ti:8081,8082 | xargs kill -9 2>/dev/null || true
sleep 2
echo "✅ 完成"
echo ""

# 2. 清理缓存
echo "2️⃣  清理缓存..."
rm -rf .expo node_modules/.cache
echo "✅ 完成"
echo ""

# 3. 检查登录状态
echo "3️⃣  检查 Expo 登录状态..."
EXPO_USER=$(npx expo whoami 2>/dev/null)
if [ "$EXPO_USER" = "Not logged in" ] || [ -z "$EXPO_USER" ]; then
    echo "⚠️  未登录 Expo 账号"
    echo ""
    echo "请运行以下命令登录："
    echo "npx expo login"
    echo ""
    echo "账号: zhu.cy@outlook.com"
    echo "密码: zhuchiyu"
    echo ""
    exit 1
else
    echo "✅ 已登录为: $EXPO_USER"
fi
echo ""

# 4. 启动说明
echo "================================"
echo "🌐 Tunnel 远程调试模式"
echo ""
echo "✨ 优点："
echo "   • 不需要同一 WiFi 网络"
echo "   • 可以在任何地方调试"
echo "   • 通过 Expo 服务器中转"
echo ""
echo "⚠️  注意："
echo "   • 首次启动需要 1-2 分钟建立隧道"
echo "   • 速度比 LAN 模式慢"
echo "   • 需要良好的网络连接"
echo ""
echo "📱 使用步骤："
echo "   1. 在手机上打开 Expo Go"
echo "   2. 扫描下方二维码"
echo "   3. 等待加载（可能较慢）"
echo ""
echo "================================"
echo ""

# 5. 启动 Tunnel 模式
export EXPO_USE_DEV_CLIENT=false
npx expo start --tunnel --clear

echo ""
echo "================================"
echo "👋 服务已停止"
echo "================================"

