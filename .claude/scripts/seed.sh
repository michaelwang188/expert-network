#!/bin/bash
# seed.sh — Expert Network 种子数据（需先 vercel env pull）
# Usage: bash .claude/scripts/seed.sh
set -e

PROJ=""$HOME/WorkBuddy/2026-06-19-11-15-05/expert-network""
cd "$PROJ"

# 拉取生产环境变量
vercel env pull --environment production --cwd "$PROJ" --yes 2>/dev/null || true

# 导出环境变量（不用 source！）
export $(grep -v '^#' .env.local | xargs)

# 运行 seed
echo "Running seed..."
npx tsx prisma/seed.ts
echo "✅ Seed complete"
