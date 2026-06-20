#!/bin/bash

# AI 消息板轮询器
# 每 30 秒检查一次 AI_MESSAGE_BOARD.md 是否有更新
# 发现更新时发送 macOS 通知

PROJECT_DIR="/Users/michaelwang188/WorkBuddy/2026-06-19-11-15-05/expert-network"
cd "$PROJECT_DIR" || exit 1

echo "🔄 AI 消息板轮询器启动"
echo "📁 监控目录: $PROJECT_DIR"
echo "⏱️  检查间隔: 30 秒"
echo ""

# 初始化：记录当前的 git HEAD
LAST_COMMIT=$(git rev-parse HEAD)
echo "✅ 当前 commit: $LAST_COMMIT"
echo "---"

while true; do
    # 拉取最新代码
    git fetch origin main 2>/dev/null
    
    # 检查是否有新提交
    NEW_COMMIT=$(git rev-parse origin/main)
    
    if [ "$LAST_COMMIT" != "$NEW_COMMIT" ]; then
        echo "🔔 检测到消息板更新！"
        echo "   旧 commit: $LAST_COMMIT"
        echo "   新 commit: $NEW_COMMIT"
        
        # 拉取最新代码
        git pull origin main 2>/dev/null
        
        # 读取消息板的最后更新区域
        UPDATED_BY=$(tail -20 AI_MESSAGE_BOARD.md | grep -E "1号AI|2号AI|3号AI" | head -1)
        
        # 发送 macOS 通知
        osascript -e "display notification \"消息板有更新: $UPDATED_BY\" with title \"🔔 AI 消息板更新\" sound name \"Glass\""
        
        # 更新 LAST_COMMIT
        LAST_COMMIT=$NEW_COMMIT
        
        echo "✅ 已通知 + 已拉取最新代码"
        echo "---"
    fi
    
    # 等待 30 秒
    sleep 30
done
