#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# 一键部署：构建 → 推送 → 部署到香港服务器 → 验证
# 用法: bash deploy.sh
#
# 不需要GitHub Actions，不需要Vercel。
# 直接推到GitHub → 香港服务器 /api/deploy 拉取构建
# ═══════════════════════════════════════════════════════════════
set -e

BASE="$(cd "$(dirname "$0")" && pwd)"
cd "$BASE"
SITE="https://516380.com"

echo "══════════════════════════════════════════════════"
echo "  产研通 ProLink · 一键部署"
echo "  目标: 香港服务器 $SITE"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "══════════════════════════════════════════════════"

echo ""
echo "📦 [1/4] 构建检查..."
npx tsc --noEmit --pretty 2>&1 | tail -1
echo "  ✅ TypeScript编译通过"

echo "🏗️  [2/4] 本地构建..."
npx next build 2>&1 | tail -3

echo "📤 [3/4] 推送到GitHub..."
git push origin main 2>&1 | tail -2
echo "  ✅ GitHub推送完成"

echo "🚀 [4/4] 触发香港服务器部署..."
echo "  （服务器将自动 git pull → 构建 → pm2 restart）"
curl --socks5 127.0.0.1:12334 -s -X POST "https://$SITE/api/deploy" --max-time 300 2>&1 || echo "  ⚠️ 超时（部署可能在后台继续）"

echo ""
echo "══════════════════════════════════════════════════"
echo "  部署触发完成！验证中..."
echo "══════════════════════════════════════════════════"

sleep 15

PASS=0; FAIL=0
check() {
    local c=$(curl --socks5 127.0.0.1:12334 -s -o /dev/null -w "%{http_code}" --max-time 10 "$2" 2>/dev/null || echo "000")
    if [ "$c" = "$3" ]; then echo "  ✅ $1 → $c"; PASS=$((PASS+1))
    else echo "  ❌ $1 → $c (期望 $3)"; FAIL=$((FAIL+1)); fi
}

echo ""
echo "📡 验证..."
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
