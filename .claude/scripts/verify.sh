#!/bin/bash
# verify.sh — Expert Network 部署后验证
# Usage: bash .claude/scripts/verify.sh
set -e

URL="https://expert-network-sooty.vercel.app"
PROXY="https_proxy=http://127.0.0.1:12334 http_proxy=http://127.0.0.1:12334"
PASS=0
FAIL=0

check() {
  local label="$1"
  shift
  if "$@" 2>&1 | grep -q "$label"; then
    echo "✅ $label"
    PASS=$((PASS+1))
  else
    echo "❌ $label"
    FAIL=$((FAIL+1))
  fi
}

echo "=== Expert Network Verify ==="
echo ""

# 1. 首页可访问
$PROXY curl -sI "$URL" | grep -q "HTTP/2 307" && echo "✅ 首页 307→/login" && PASS=$((PASS+1)) || { echo "❌ 首页不可达"; FAIL=$((FAIL+1)); }

# 2. 登录页
$PROXY curl -sI "$URL/login" | grep -q "HTTP/2 200" && echo "✅ 登录页 200" && PASS=$((PASS+1)) || { echo "❌ 登录页异常"; FAIL=$((FAIL+1)); }

# 3. 注册 API
$PROXY curl -s -X POST "$URL/api/register" -H "Content-Type: application/json" -d '{"email":"health@test.com","password":"test123","name":"health"}' | grep -q "ok" && echo "✅ 注册 API" && PASS=$((PASS+1)) || { echo "❌ 注册 API"; FAIL=$((FAIL+1)); }

# 4. 专家库
$PROXY curl -sI "$URL/experts" | grep -q "HTTP/2" && echo "✅ 专家库可访问" && PASS=$((PASS+1)) || { echo "❌ 专家库异常"; FAIL=$((FAIL+1)); }

# 5. 排行榜
$PROXY curl -sI "$URL/leaderboard" | grep -q "HTTP/2" && echo "✅ 排行榜可访问" && PASS=$((PASS+1)) || { echo "❌ 排行榜异常"; FAIL=$((FAIL+1)); }

# 6. 管理员后台
$PROXY curl -sI "$URL/admin" | grep -q "HTTP/2" && echo "✅ 管理员后台可访问" && PASS=$((PASS+1)) || { echo "❌ 管理员后台异常"; FAIL=$((FAIL+1)); }

echo ""
echo "=== Result: $PASS pass, $FAIL fail ==="
[ "$FAIL" -eq 0 ] && echo "✅ All checks passed" || echo "❌ $FAIL checks failed"
