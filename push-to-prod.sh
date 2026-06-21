#!/bin/bash
# 本地直推生产 — 不经过GitHub
SERVER="43.132.171.203"
PORT=22

echo "📦 打包项目中..."
cd /Users/michaelwang188/WorkBuddy/2026-06-19-11-15-05/expert-network

# 只传源代码和核心配置，不传node_modules和.next
tar czf /tmp/prolink.tar.gz \
  --exclude='node_modules' --exclude='.next' --exclude='.git' \
  src/ prisma/ public/ package.json package-lock.json tsconfig.json next.config.js postcss.config.js tailwind.config.js .env.production 2>/dev/null

echo "📤 上传到服务器..."
scp -o StrictHostKeyChecking=no /tmp/prolink.tar.gz root@$SERVER:/tmp/

echo "🚀 服务器部署..."
ssh -o StrictHostKeyChecking=no root@$SERVER << 'DEPLOYEOF'
cd /opt/prolink
pm2 stop prolink 2>/dev/null
tar xzf /tmp/prolink.tar.gz 2>/dev/null
rm -rf .next
npm run build 2>&1 | tail -3
pm2 start ecosystem.config.js
pm2 save
echo "✅ 部署完成"
DEPLOYEOF
