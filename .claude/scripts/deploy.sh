#!/bin/bash
# deploy.sh — Expert Network 一键部署
# Usage: bash .claude/scripts/deploy.sh
set -e

PROJ="/Users/michaelwang188/WorkBuddy/2026-06-19-11-15-05/expert-network"
TOKEN="${VERCEL_TOKEN}"

echo "=== Step 1/4: TypeScript check ==="
cd "$PROJ"
npx tsc --noEmit && echo "✅ 0 errors" || { echo "❌ TypeScript errors"; exit 1; }

echo "=== Step 2/4: Git push ==="
git push origin main

echo "=== Step 3/4: Vercel deploy ==="
https_proxy=http://127.0.0.1:12334 http_proxy=http://127.0.0.1:12334 \
  vercel --prod --cwd "$PROJ" --token "$TOKEN" --yes

echo "=== Step 4/4: Verify ==="
sleep 3
https_proxy=http://127.0.0.1:12334 curl -sI https://expert-network-sooty.vercel.app | head -3
echo ""
echo "✅ Deploy complete: https://expert-network-sooty.vercel.app"
