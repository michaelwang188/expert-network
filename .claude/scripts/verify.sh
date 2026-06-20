#!/bin/bash
# verify.sh — Expert Network 部署后验证 v1.1
# Usage: bash .claude/scripts/verify.sh
# Fixed: export 环境变量替代变量展开 (PITFALLS#2)
set -e

URL="https://expert-network-sooty.vercel.app"
PASS=0
FAIL=0

# 铁律#23: 代理预检
echo "=== Expert Network Verify v1.1 ==="
echo ""

if curl -o /dev/null -w "%{http_code}" -s --max-time 5 --proxy http://127.0.0.1:12334 https://httpbin.org/ip 2>/dev/null | grep -q "200"; then
  echo "🟢 代理 127.0.0.1:12334 正常"
else
  echo "🔴 代理不通"
  exit 1
fi

# 铁律#2: 用 export 环境变量不用 $PROXY 展开
export https_proxy=http://127.0.0.1:12334
export http_proxy=http://127.0.0.1:12334

echo ""

# 1. 首页 → 200 (landing page) 或 307 (redirect to /login)
HOME_HTTP=$(curl -sI --max-time 10 "$URL" 2>/dev/null | head -2)
if echo "$HOME_HTTP" | grep -qE "HTTP/2 (200|307)"; then
  echo "✅ 首页可达"; PASS=$((PASS+1))
else
  echo "❌ 首页不可达"; FAIL=$((FAIL+1))
fi

# 2. 登录页 → 200
if curl -sI --max-time 10 "$URL/login" 2>/dev/null | grep -q "HTTP/2 200"; then
  echo "✅ 登录页 200"; PASS=$((PASS+1))
else
  echo "❌ 登录页异常"; FAIL=$((FAIL+1))
fi

# 3. 注册 API → {"ok":true}
if curl -s --max-time 10 -X POST "$URL/api/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"health-$(date +%s)@test.com\",\"password\":\"test123\",\"name\":\"health\"}" 2>/dev/null | grep -q "ok"; then
  echo "✅ 注册 API"; PASS=$((PASS+1))
else
  echo "❌ 注册 API"; FAIL=$((FAIL+1))
fi

# 4. 专家库 → HTTP/2
if curl -sI --max-time 10 "$URL/experts" 2>/dev/null | grep -q "HTTP/2 200"; then
  echo "✅ 专家库可访问"; PASS=$((PASS+1))
else
  echo "❌ 专家库异常"; FAIL=$((FAIL+1))
fi

# 5. 排行榜 → HTTP/2
if curl -sI --max-time 10 "$URL/leaderboard" 2>/dev/null | grep -q "HTTP/2 200"; then
  echo "✅ 排行榜可访问"; PASS=$((PASS+1))
else
  echo "❌ 排行榜异常"; FAIL=$((FAIL+1))
fi

# 6. 管理后台 → HTTP/2 (需登录，307也算可达)
if curl -sI --max-time 10 "$URL/admin" 2>/dev/null | grep -q "HTTP/2"; then
  echo "✅ 管理后台可访问"; PASS=$((PASS+1))
else
  echo "❌ 管理后台异常"; FAIL=$((FAIL+1))
fi

echo ""
echo "=== Result: $PASS pass, $FAIL fail ==="
[ "$FAIL" -eq 0 ] && echo "✅ All checks passed" || { echo "❌ $FAIL checks failed"; exit 1; }
