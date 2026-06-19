#!/usr/bin/env python3
"""
AI 消息板轮询器
每 30 秒检查 AI_MESSAGE_BOARD.md 变化，发现更新时发送 macOS 通知
"""

import time
import os
import hashlib
import subprocess
from pathlib import Path

# 配置
MESSAGE_BOARD_PATH = Path(__file__).parent.parent / "AI_MESSAGE_BOARD.md"
STATE_FILE = Path(__file__).parent / "poller_state.json"
CHECK_INTERVAL = 30  # 秒
NOTIFICATION_SOUND = "Glass"  # macOS 通知声音

def get_file_hash(filepath):
    """计算文件 MD5 哈希"""
    try:
        with open(filepath, 'rb') as f:
            return hashlib.md5(f.read()).hexdigest()
    except:
        return None

def send_notification(title, message):
    """发送 macOS 通知"""
    script = f'''
    display notification "{message}" with title "{title}" sound name "{NOTIFICATION_SOUND}"
    '''
    subprocess.run(['osascript', '-e', script])

def check_git_pull():
    """执行 git pull 获取最新消息板"""
    try:
        result = subprocess.run(
            ['git', '-C', str(MESSAGE_BOARD_PATH.parent), 'pull', 'origin', 'main'],
            capture_output=True,
            text=True,
            timeout=10
        )
        return result.returncode == 0
    except:
        return False

def main():
    print(f"🔄 消息板轮询器启动")
    print(f"📁 监控文件: {MESSAGE_BOARD_PATH}")
    print(f"⏱️  检查间隔: {CHECK_INTERVAL} 秒")
    print(f"💡 发现变化时发送 macOS 通知\n")

    # 初始化：读取当前文件哈希
    last_hash = get_file_hash(MESSAGE_BOARD_PATH)
    print(f"✅ 初始哈希: {last_hash[:8] if last_hash else 'N/A'}\n")

    while True:
        try:
            # 1. Git pull 获取最新版本
            if check_git_pull():
                # 2. 检查文件变化
                current_hash = get_file_hash(MESSAGE_BOARD_PATH)

                if current_hash and current_hash != last_hash:
                    print(f"🔔 检测到消息板更新！{last_hash[:8] if last_hash else 'N/A'} → {current_hash[:8]}")

                    # 3. 读取消息板，判断变化类型
                    with open(MESSAGE_BOARD_PATH, 'r', encoding='utf-8') as f:
                        content = f.read()

                    # 简单判断：检查关键字
                    if "📤 给执行架构师的消息" in content:
                        if "任务 #" in content:
                            send_notification(
                                "🔧 WorkBuddy - 新任务",
                                "消息板有新的任务分配，请查看 AI_MESSAGE_BOARD.md"
                            )
                        else:
                            send_notification(
                                "🔧 WorkBuddy - 消息更新",
                                "总架构师发送了新消息，请查看 AI_MESSAGE_BOARD.md"
                            )
                    elif "🔍 质检报告" in content:
                        send_notification(
                            "🔍 质检报告已更新",
                            "质检员提交了审查报告，请查看 AI_MESSAGE_BOARD.md"
                        )

                    last_hash = current_hash
                    print(f"✅ 已通知，新哈希: {current_hash[:8]}\n")

                elif not current_hash:
                    print(f"⚠️  无法读取消息板文件\n")

            else:
                print(f"⚠️  Git pull 失败，将在下次重试\n")

            # 等待下次检查
            time.sleep(CHECK_INTERVAL)

        except KeyboardInterrupt:
            print("\n\n👋 轮询器已停止")
            break
        except Exception as e:
            print(f"❌ 错误: {e}\n")
            time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    main()
