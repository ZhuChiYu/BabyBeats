#!/bin/bash
# 使用开发构建启动（支持后台音频等原生功能）

echo "🚀 启动 BabyBeats 开发构建（支持后台播放）"
echo "================================================"
echo ""

# 清理旧进程
echo "1️⃣  清理旧进程..."
killall -9 node Metro 2>/dev/null || true
pkill -f "expo start" 2>/dev/null || true
sleep 1
echo "✅ 完成"
echo ""

# 清理缓存
echo "2️⃣  清理缓存..."
rm -rf .expo node_modules/.cache
echo "✅ 完成"
echo ""

# 提示信息
echo "3️⃣  启动开发构建..."
echo ""
echo "⚠️  注意："
echo "   - 这将使用开发构建而不是 Expo Go"
echo "   - 支持后台音频播放等原生功能"
echo "   - 首次运行可能需要较长时间编译"
echo ""
echo "================================================"
echo ""

# 运行开发构建
npx expo run:ios --device

echo ""
echo "================================================"
echo "👋 服务已停止"
echo "================================================"










