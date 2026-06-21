#!/bin/bash
# Task #220 套餐端口验证脚本
# 在腾讯云控制台一键登录后执行

echo "=== 1. 当前80端口占用 ==="
ss -tlnp | grep -E ':80 |:8080 |:3000 '

echo ""
echo "=== 2. PM2状态 ==="
pm2 status

echo ""
echo "=== 3. 测试非标准端口外网可达性 ==="
echo "启动nc监听22222端口5秒..."
timeout 5 nc -l -p 22222 &
sleep 1
echo "nc监听已启动，请从你本地执行: nc -z -w5 101.35.148.117 22222"
echo "如果连接成功 → 套餐不限端口 → 问题在80端口被占用/转发配置"
echo "如果连接超时 → 套餐限制Web端口 → 需要用Cloudflare Tunnel"
wait 2>/dev/null

echo ""
echo "=== 4. 查看myapp状态（预装App自愈复活机制） ==="
systemctl status myapp 2>/dev/null || echo "myapp不存在"

echo ""
echo "=== 5. 已监听端口汇总 ==="
ss -tlnp
