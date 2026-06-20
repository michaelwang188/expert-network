#!/bin/bash
# verify.sh v2.0 — Expert Network 部署后验证
# HTTP/HTTPS 双模式 + 代理/直连智能切换
set -e

URL="${1:-http://516380.com}"
PASS=0
FAIL=0

echo "=== Expert Network Verify v2.0 ==="
echo ""

# 代理预检（非致命）
if curl -o /dev/null -w "%{http_code}" -s --max-time 5 --proxy http://127.0.0.1:12334 https://httpbin.org/ip 2>/dev/null | grep -q "200"; then
  echo "🟢 代理可用"; export https_proxy=http://127.0.0.1:12334 http_proxy=http://127.0.0.1:12334
else
  echo "🟡 代理不可用，HTTP直连"
fi

echo ""

check() {
  local desc="$1" url="$2" expected="$3" method="${4:-GET}"
  local http_resp
  if [ "$method" = "POST" ]; then
    http_resp=$(curl -s --max-time 10 -X POST "$url" -H "Content-Type: application/json" -d "{\"email\":\"health-$(date +%s)@test.com\",\"password\":\"test123\",\"name\":\"health\"}" 2>/dev/null)
  else
    http_resp=$(curl -sI --max-time 10 "$url" 2>/dev/null | tr -d '\r' | head -10)
  fi
  if echo "$http_resp" | grep -qE "$expected"; then
    echo "✅ $desc"; PASS=$((PASS+1))
  else
    echo "❌ $desc"; FAIL=$((FAIL+1))
  fi
}

# 1. 首页
check "首页可达" "$URL" "HTTP.*(200|307|308)"
# 2. 登录页
check "登录页" "$URL/login" "HTTP.*(200|307|308)"
# 3. 注册 API
check "注册 API" "$URL/api/register" "ok" "POST"
# 4. 专家库
check "专家库" "$URL/experts" "HTTP.*(200|307|308)"
# 5. 排行榜
check "排行榜" "$URL/leaderboard" "HTTP.*(200|307|308)"
# 6. 管理后台
check "管理后台" "$URL/admin" "HTTP.*(200|307|308)"

echo ""
echo "=== Result: $PASS pass, $FAIL fail ==="
[ "$FAIL" -eq 0 ] && echo "✅ All checks passed" || { echo "❌ $FAIL checks failed"; exit 1; }
