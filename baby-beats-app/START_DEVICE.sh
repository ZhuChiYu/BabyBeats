#!/bin/bash

# 真机运行启动脚本

echo "📱 启动 BabyBeats 真机调试"
echo "================================"
echo ""

# 停止旧进程
echo "1️⃣  停止旧进程..."
pkill -f "expo start" 2>/dev/null || true
pkill -f "react-native" 2>/dev/null || true
sleep 1
echo "✅ 完成"
echo ""

# 清理缓存
echo "2️⃣  清理缓存..."
rm -rf .expo node_modules/.cache
echo "✅ 完成"
echo ""

# 获取本机 IP
echo "3️⃣  检查网络配置..."
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
echo "本机 IP: $LOCAL_IP"
echo ""

# 启动提示
echo "4️⃣  准备启动开发服务器..."
echo ""
echo "📱 真机调试步骤："
echo "   1. 确保手机和电脑连接到同一 WiFi"
echo "   2. 在手机上安装 Expo Go App"
echo "   3. 打开 Expo Go，点击 'Scan QR Code'"
echo "   4. 扫描下方显示的二维码"
echo ""
echo "⚠️  如果无法连接，尝试："
echo "   - 关闭 VPN"
echo "   - 检查防火墙设置"
echo "   - 使用 tunnel 模式: Ctrl+C 后运行 'npx expo start --tunnel'"
echo ""
echo "================================"
echo ""

# 启动开发服务器（LAN 模式）
npx expo start --lan --clear

echo ""
echo "================================"
echo "👋 服务已停止"
echo "================================"

