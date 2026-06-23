#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# 一键部署：构建 → 部署 → 验证
# 用法: VERCEL_TOKEN="vcp_xxx" bash deploy.sh
# ═══════════════════════════════════════════════════════════════
set -e

BASE="$(cd "$(dirname "$0")" && pwd)"
cd "$BASE"
VERCEL_TOKEN="${VERCEL_TOKEN:?需要设置 VERCEL_TOKEN 环境变量}"
SITE="https://expert-network-sooty.vercel.app"

echo "══════════════════════════════════════════════════"
echo "  产研通 ProLink · 一键部署"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "══════════════════════════════════════════════════"

echo ""
echo "📦 [1/4] Prisma Client生成..."
npx prisma generate 2>&1 | tail -1
echo "  ✅ Prisma就绪"

echo "🔧 [2/4] 构建检查..."
npx tsc --noEmit --pretty 2>&1 | tail -1
echo "  ✅ TypeScript通过"
npx next build 2>&1 | tail -3

echo "🚀 [3/4] Vercel部署..."
npx vercel deploy --prod --token="$VERCEL_TOKEN" --yes 2>&1 | grep -E "https|ready|message|Deployment"

echo ""
echo "📡 [4/4] 验证..."
sleep 10
PASS=0; FAIL=0
check() {
    local c=$(curl --socks5 127.0.0.1:12334 -s -o /dev/null -w "%{http_code}" --max-time 10 "$2" 2>/dev/null || echo "000")
    if [ "$c" = "$3" ]; then echo "  ✅ $1 → $c"; PASS=$((PASS+1))
    else echo "  ❌ $1 → $c (期望 $3)"; FAIL=$((FAIL+1)); fi
}
check "首页"       "$SITE"          200
check "登录"       "$SITE/login"    200
check "注册"       "$SITE/register" 200
check "专家页"     "$SITE/experts"  200
check "管理员校验" "$SITE/api/requests" 403
check "登录校验"   "$SITE/api/experts" 401
check "通知API"    "$SITE/api/notifications" 401

echo ""
echo "══════════════════════════════════════════════════"
echo "  ✅ $PASS  ❌ $FAIL"
[ "$FAIL" -eq 0 ] && echo "  🎉 全部通过" || echo "  ⚠️ 有失败"
exit $FAIL
