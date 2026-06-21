#!/bin/bash
# Task #220 服务器排查脚本
# 在腾讯云控制台一键登录后的 root shell 中执行
# 命令: bash task-220-probe.sh

echo "=== 1. nftables 规则 ==="
nft list ruleset 2>/dev/null || echo "nft不可用"

echo ""
echo "=== 2. iptables 规则 ==="
iptables -L -n -v 2>/dev/null || echo "iptables不可用"

echo ""
echo "=== 3. SELinux 状态 ==="
getenforce 2>/dev/null || echo "getenforce不可用"
sestatus 2>/dev/null

echo ""
echo "=== 4. 80端口监听状态 ==="
ss -tlnp | grep ':80 '

echo ""
echo "=== 5. PM2 进程状态 ==="
pm2 list 2>/dev/null || echo "pm2不可用"

echo ""
echo "=== 6. PM2 最近50行日志 ==="
pm2 logs --nostream --lines 50 2>/dev/null || echo "pm2 logs不可用"

echo ""
echo "=== 7. 本地80端口连通性 ==="
curl -s -o /dev/null -w "HTTP状态码: %{http_code}\n" http://127.0.0.1:80 || echo "本地curl失败"

echo ""
echo "=== 8. 外网连通性 ==="
curl -s -o /dev/null -w "HTTP状态码: %{http_code}\n" --connect-timeout 5 http://101.35.148.117:80 || echo "自连公网IP失败"

echo ""
echo "=== 9. 防火墙服务状态 ==="
systemctl is-active firewalld 2>/dev/null || echo "firewalld未运行"
systemctl is-active nftables 2>/dev/null || echo "nftables未运行"

echo ""
echo "=== 10. 网络接口与路由 ==="
ip addr show | grep -E 'inet |state'
ip route show default
echo ""
echo "=== 排查完成 ==="
echo "请将以上全部输出复制给3号AI Mavis分析"
