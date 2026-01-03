#!/bin/bash
# 一键启动 iOS 应用

echo "🚀 启动 BabyBeats iOS 应用"
echo ""

# 清理旧进程
killall -9 node Metro 2>/dev/null || true

# 清理缓存
rm -rf .expo node_modules/.cache

# 启动应用（会自动打开 iOS 模拟器）
npx expo start --ios --clear

