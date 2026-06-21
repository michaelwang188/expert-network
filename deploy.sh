#!/bin/bash
cd /opt/prolink
echo "[$(date)] 🚀 Deploy triggered"
git checkout -- . 2>/dev/null
git pull origin main
rm -rf .next
npm run build 2>&1 | tail -2
pm2 restart prolink
echo "[$(date)] ✅ Deploy complete"
