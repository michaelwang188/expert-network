#!/usr/bin/env python3
"""
产研通 ProLink 四角色常驻引擎 v4.0
=====================================
四个独立 Claude API 进程，全 15s 轮询，不需要任何 AI 会话存活。
API: DeepSeek Anthropic-compatible (claude-sonnet-4-6)

用法:
  python3 autopilot_v4.py --role architect    # 1号AI
  python3 autopilot_v4.py --role executor     # 2号AI
  python3 autopilot_v4.py --role inspector    # 3号AI
  python3 autopilot_v4.py --role tester       # 4号AI
"""

import os, sys, json, time, re, hashlib, subprocess, urllib.request
import argparse, textwrap, traceback
from datetime import datetime, timezone, timedelta
from pathlib import Path

# ─── 配置 ─────────────────────────────────────────
# 项目目录：优先从环境变量，其次从脚本位置推算
_env = os.environ.get("EXPERT_NETWORK_PROJECT", "")
if _env:
    PROJECT_DIR = Path(_env)
else:
    PROJECT_DIR = Path(__file__).resolve().parent.parent.parent
MSG_BOARD   = PROJECT_DIR / "AI_MESSAGE_BOARD.md"

# API — DeepSeek代理的Claude
API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")  # 从环境变量读取，不硬编码
API_BASE = os.environ.get("ANTHROPIC_BASE_URL", "https://api.deepseek.com/anthropic")
API_URL = f"{API_BASE}/v1/messages"
API_MODEL = "claude-sonnet-4-6"
API_MAX_TOKENS = 8000

POLL = 15  # 所有角色统一15秒
TZ = timezone(timedelta(hours=8))
STATE_FILE = PROJECT_DIR / ".workbuddy" / "autopilot_v4_state.json"
STATE_FILE.parent.mkdir(parents=True, exist_ok=True)

# ─── 角色定义 ──────────────────────────────────────
ROLES = {
    "architect": {
        "name": "1号AI·总架构师", "emoji": "🏗️", "area": "📤",
        "sys_prompt": """你是产研通 ProLink 专家库平台的总架构师(1号AI)。
职责：分析需求文档、评估当前进度、创建新任务分配给2号AI执行。
决策依据：REQUIREMENTS.md 是最高准则。
原则：一次只建1-2个任务，每个任务原子化(10-30分钟)，带明确的验收标准。
""",
    },
    "executor": {
        "name": "2号AI·执行架构师", "emoji": "🔧", "area": "📥",
        "sys_prompt": """你是产研通 ProLink 的执行架构师(2号AI/Claude)。
职责：接[⬜待认领]开头的任务，修改代码修bug，完成后在📥区写完成报告。
技术栈：Next.js 15 + TypeScript + Prisma + Neon PostgreSQL + Vercel + Tailwind CSS。
铁律：金额单位是积分禁止¥、敏感词必须阻断、修改代码后跑 npx tsc --noEmit。
""",
    },
    "inspector": {
        "name": "3号AI·独立质检员", "emoji": "🔍", "area": "🔍",
        "sys_prompt": """你是产研通 ProLink 的独立质检员(3号AI)。
职责：零信任审查。不信任任何自述，独立验证。用curl测试API契约，审查代码安全。
铁律：审查结论必须三选一(🟢/🟡/🔴)，用事实说话不写"我觉得"。
""",
    },
    "tester": {
        "name": "4号AI·体验测试员", "emoji": "🧪", "area": "🧪",
        "sys_prompt": """你是产研通 ProLink 的独立体验测试员(4号AI)。
职责：模拟真实用户盲测 http://516380.com。不读需求文档，凭直觉。
你是三个不同的人——研究员、专家、运营——各自第一次打开产品。困惑就是bug。
""",
    },
}

# ─── 工具函数 ─────────────────────────────────────
def log(msg):
    ts = datetime.now(TZ).strftime("%H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)

def bash(cmd, timeout=60):
    try:
        r = subprocess.run(["bash", "-c", cmd], cwd=PROJECT_DIR,
                           capture_output=True, text=True, timeout=timeout)
        return r.stdout.strip(), r.stderr.strip(), r.returncode
    except Exception as e:
        return "", str(e), 1

def read_file(path):
    full = (PROJECT_DIR / path).resolve()
    if not str(full).startswith(str(PROJECT_DIR.resolve())): return None
    try: return full.read_text()
    except: return None

def write_file(path, content):
    full = (PROJECT_DIR / path).resolve()
    if not str(full).startswith(str(PROJECT_DIR.resolve())): return False
    try:
        full.parent.mkdir(parents=True, exist_ok=True)
        full.write_text(content); return True
    except: return False

def board_text():
    git("pull origin main")
    return MSG_BOARD.read_text()

def board_write(text):
    MSG_BOARD.write_text(text)

def git(cmd):
    return bash(f"git {cmd} 2>&1")[0]

def git_push(commit_msg):
    bash("git add -A")
    bash(f"git commit -m '{commit_msg}' 2>&1")
    return bash("git push origin main 2>&1")[0]

def now_str():
    return datetime.now(TZ).strftime("%H:%M")

def date_str():
    return datetime.now(TZ).strftime("%m-%d %H:%M")

def scan_my_tasks(role):
    """扫描📤区找属于当前角色的待认领任务"""
    t = MSG_BOARD.read_text()
    tasks = []
    # 匹配任务行
    pattern = rf'(### 📤 任务 #\d+ \| \[⬜待认领.*{role["name"][:2]}.*\] \| .+)'
    for m in re.finditer(pattern, t):
        line = m.group(1)
        num_m = re.search(r'任务 #(\d+)', line)
        desc_m = re.search(r'\| (.+?) \|', line)
        num = num_m.group(1) if num_m else "?"
        desc = desc_m.group(1) if desc_m else "?"
        tasks.append({"num": num, "desc": desc, "line": line})
    return tasks

def claim_task(task_num):
    """锁任务 [⬜待认领] → [🔧执行中 @ role HH:MM]"""
    t = MSG_BOARD.read_text()
    tm = now_str()
    old = re.compile(rf'(### 📤 任务 #{task_num} \| )\[⬜待认领[^\]]*\]')
    new = rf'\1[🔧执行中 @ {tm}]'
    result = old.sub(new, t)
    if result != t:
        MSG_BOARD.write_text(result)
        return True
    return False

def finish_task(task_num):
    t = MSG_BOARD.read_text()
    tm = now_str()
    old = re.compile(rf'(### 📤 任务 #{task_num} \| )\[🔧执行中[^\]]*\]')
    new = rf'\1[✅已完成 @ {tm}]'
    MSG_BOARD.write_text(old.sub(new, t))

def reply_to_board(role, msg):
    """在角色专属区写消息"""
    t = MSG_BOARD.read_text()
    area_names = {"architect": "## 📤 给执行架构师的消息",
                  "executor": "## 📥 给总架构师的消息",
                  "inspector": "## 🔍 质检报告",
                  "tester": "## 🧪 体验测试报告"}
    marker = area_names.get(role, "## 📥 给总架构师的消息")

    block = f"\n### {date_str()} | {ROLES[role]['emoji']} {ROLES[role]['name']}\n\n{msg}\n\n---\n"

    idx = t.find(marker)
    if idx == -1:
        MSG_BOARD.write_text(t + block)
        return
    insert = t.find("\n### ", idx + len(marker))
    if insert == -1: insert = len(t)
    MSG_BOARD.write_text(t[:insert] + block + t[insert:])

# ─── Claude API ────────────────────────────────────
def claude_api(sys_prompt, user_msg, tools=None, max_tokens=API_MAX_TOKENS):
    """调用 Claude API (via DeepSeek proxy)"""
    headers = {
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
    }
    body = {
        "model": API_MODEL,
        "max_tokens": max_tokens,
        "system": sys_prompt,
        "messages": [{"role": "user", "content": user_msg}],
    }
    if tools:
        body["tools"] = tools

    data = json.dumps(body).encode()
    req = urllib.request.Request(API_URL, data=data, headers=headers)

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()[:500]
        log(f"  API {e.code}: {err_body[:200]}")
        return None
    except Exception as e:
        log(f"  API异常: {e}")
        return None

# ─── 工具定义 ──────────────────────────────────────
EXECUTOR_TOOLS = [
    {"name": "read_code", "description": "读项目源代码文件", "input_schema": {"type":"object","properties":{"path":{"type":"string","description":"相对路径如 src/app/api/orders/route.ts"}},"required":["path"]}},
    {"name": "write_code", "description": "写/覆盖项目文件", "input_schema": {"type":"object","properties":{"path":{"type":"string"},"content":{"type":"string"}},"required":["path","content"]}},
    {"name": "run_command", "description": "执行shell命令", "input_schema": {"type":"object","properties":{"command":{"type":"string"},"reason":{"type":"string"}},"required":["command","reason"]}},
    {"name": "task_done", "description": "报告任务完成", "input_schema": {"type":"object","properties":{"summary":{"type":"string"},"details":{"type":"string"}},"required":["summary","details"]}},
]

INSPECTOR_TOOLS = [
    {"name": "run_command", "description": "执行curl/测试命令", "input_schema": {"type":"object","properties":{"command":{"type":"string"},"reason":{"type":"string"}},"required":["command","reason"]}},
    {"name": "read_code", "description": "读源码审查", "input_schema": {"type":"object","properties":{"path":{"type":"string"}},"required":["path"]}},
    {"name": "qa_report", "description": "提交质检报告", "input_schema": {"type":"object","properties":{"verdict":{"type":"string","enum":["pass","conditional","reject"]},"findings":{"type":"string"}},"required":["verdict","findings"]}},
]

TESTER_TOOLS = [
    {"name": "run_command", "description": "curl测试网站", "input_schema": {"type":"object","properties":{"command":{"type":"string"},"reason":{"type":"string"}},"required":["command","reason"]}},
    {"name": "read_code", "description": "读源码评估", "input_schema": {"type":"object","properties":{"path":{"type":"string"}},"required":["path"]}},
    {"name": "experience_report", "description": "提交体验测试报告", "input_schema": {"type":"object","properties":{"verdict":{"type":"string"},"findings":{"type":"string"}},"required":["verdict","findings"]}},
]

ARCHITECT_TOOLS = [
    {"name": "read_code", "description": "读项目文档/源码", "input_schema": {"type":"object","properties":{"path":{"type":"string"}},"required":["path"]}},
    {"name": "create_task", "description": "创建新任务到消息板", "input_schema": {"type":"object","properties":{"num":{"type":"string"},"desc":{"type":"string"},"timeout":{"type":"string"},"body":{"type":"string"}},"required":["num","desc","timeout","body"]}},
    {"name": "no_action", "description": "无需创建任务", "input_schema": {"type":"object","properties":{"reason":{"type":"string"}},"required":["reason"]}},
]

# ─── 各角色主循环逻辑 ──────────────────────────────
def run_architect():
    """1号AI：扫板→分析需求→创建新任务"""
    log(f"🏗️ 架构师扫描...")

    # 统计当前状态
    t = board_text()
    total_tasks = len(re.findall(r'### 📤 任务 #\d+', t))
    unclaimed = len(re.findall(r'\[⬜待认领', t))
    in_progress = len(re.findall(r'\[🔧执行中', t))

    if unclaimed > 2:
        log(f"  ⏭️ 已有{unclaimed}个待认领任务,不建新的")
        return

    # 读需求文档
    req = read_file("REQUIREMENTS.md") or ""
    pitfalls = read_file("PITFALLS.md") or ""

    prompt = f"""当前状态：共{total_tasks}个任务，{unclaimed}个待认领，{in_progress}个进行中。
对照REQUIREMENTS.md检查是否有未完成的功能或未修复的已知问题。
如果有值得做的工作→create_task。如果现在不需要→no_action。
禁止重复已有任务。"""

    sys = ROLES["architect"]["sys_prompt"]
    resp = claude_api(sys, prompt, tools=ARCHITECT_TOOLS, max_tokens=2000)
    if not resp: return

    # 处理工具调用
    for block in resp.get("content", []):
        if block["type"] == "tool_use":
            fn = block["name"]
            args = block["input"]
            if fn == "create_task":
                num = args.get("num", "?")
                desc = args.get("desc", "")
                timeout = args.get("timeout", "15")
                body = args.get("body", "")
                # 写入消息板
                t = MSG_BOARD.read_text()
                task_block = f"""### 📤 任务 #{num} | [⬜待认领 · 🚫不限角色] | {desc} | 超时: {timeout}min

> 🏗️ 1号AI {date_str()} 分配

{body}

---
"""
                marker = "## 📤 给执行架构师的消息"
                idx = t.find(marker)
                end = t.find("\n## ", idx + len(marker))
                if end == -1: end = len(t)
                MSG_BOARD.write_text(t[:end] + "\n" + task_block + t[end:])
                log(f"  ✅ 创建 任务#{num}: {desc}")
                git_push(f"🏗️ 架构师: 创建任务#{num}")
            elif fn == "no_action":
                log(f"  💤 {args.get('reason','无需新任务')}")
        elif block["type"] == "text":
            log(f"  💬 {block['text'][:100]}")


def run_executor():
    """2号AI：扫[⬜待认领]→接→执行→报告"""
    # 抢任务，但跳过标了仅限1/3/4号AI的专属任务和仅限角色标记
    t = MSG_BOARD.read_text()
    tasks = []
    for m in re.finditer(r'### 📤 任务 #(\d+) \| \[⬜待认领[^\]]*\] \| (.+?) \|', t):
        full_line = m.group(0)
        num, desc = m.group(1), m.group(2)
        # 跳过专属任务：含🚫仅限1号、仅限3号、仅限4号
        if re.search(r'仅限[134]号', full_line):
            continue
        tasks.append({"num": num, "desc": desc, "line": full_line})

    if not tasks:
        return False

    task = tasks[0]
    num = task["num"]
    log(f"🔧 发现 任务#{num}: {task['desc']}")

    if not claim_task(num):
        log(f"  ⚠️ 锁定失败")
        return False

    log(f"  🔒 已锁")
    git_push(f"🔧 2号AI: 接任务#{num}")

    # 读任务详情
    t = MSG_BOARD.read_text()
    start = t.find(f"### 📤 任务 #{num} |")
    end = t.find("\n### 📤 任务 #", start + 50)
    if end == -1: end = t.find("\n---", start + 50)
    if end == -1: end = start + 2000
    task_body = t[start:end]

    sys = ROLES["executor"]["sys_prompt"]
    prompt = f"执行 任务#{num}: {task['desc']}\n\n{task_body[:3000]}\n\n先read_code读相关文件，然后write_code修改，run_command验证(tsc)，最后task_done。"

    resp = claude_api(sys, prompt, tools=EXECUTOR_TOOLS, max_tokens=6000)
    if not resp:
        reply_to_board("executor", f"❌ 任务#{num} API失败")
        return False

    success = False
    for turn in range(8):
        # Process tool calls from response
        tool_calls = []
        for block in resp.get("content", []):
            if block["type"] == "tool_use":
                fn = block["name"]
                args = block["input"]
                rid = block["id"]

                if fn == "read_code":
                    result = read_file(args["path"]) or "FILE NOT FOUND"
                    log(f"    📖 {args['path']} ({len(result)} chars)")
                elif fn == "write_code":
                    ok = write_file(args["path"], args["content"])
                    result = f"{'OK' if ok else 'FAIL'}: wrote {len(args['content'])} bytes"
                    log(f"    ✏️ {args['path']} → {'OK' if ok else 'FAIL'}")
                elif fn == "run_command":
                    out, err, rc = bash(args["command"], timeout=90)
                    result = f"exit={rc}\n{out[:2000]}\n{err[:1000]}"
                    log(f"    ⚡ {args.get('reason','')}: {args['command'][:60]} → {rc}")
                elif fn == "task_done":
                    log(f"    ✅ {args['summary']}")
                    reply_to_board("executor", f"✅ 任务#{num}完成: {args['summary']}\n\n{args['details']}")
                    success = True
                    result = "Reported"
                else:
                    result = "Unknown tool"

                tool_calls.append((rid, result))

        if success: break

        # Build follow-up messages
        if not tool_calls:
            break

        # Simple retry: ask for more
        prompt = "继续执行。如果完成，调用task_done。"
        resp = claude_api(sys, prompt, tools=EXECUTOR_TOOLS, max_tokens=6000)
        if not resp: break

    if not success:
        reply_to_board("executor", f"⚠️ 任务#{num} 未完成: 达到最大轮次")

    finish_task(num)
    git_push(f"🔧 2号AI: 任务#{num}完成")
    return True


# 质检API失败状态（持久化文件，跨重启生效）
_INSPECTOR_STATE_FILE = PROJECT_DIR / ".workbuddy" / "inspector_state.json"
_INSPECTOR_RETRY_SEC = 120     # API失败后重试间隔：2分钟
_INSPECTOR_BOARD_BACKOFF = 3600  # 消息板告警：每小时最多1次

def _load_inspector_state():
    try:
        if _INSPECTOR_STATE_FILE.exists():
            return json.loads(_INSPECTOR_STATE_FILE.read_text())
    except: pass
    return {"last_api_fail": 0, "last_board_fail": 0}

def _save_inspector_state(state):
    try:
        _INSPECTOR_STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
        _INSPECTOR_STATE_FILE.write_text(json.dumps(state))
    except: pass

def run_inspector():
    """3号AI：扫新commit→审查→写报告
    15秒轮询不变（协作心跳），仅控制API调用频率"""
    # Step 1: 查最近commit（免费·本地·每次轮询都跑）
    commits = bash("git log --oneline -5")[0]
    if ROLES["inspector"]["emoji"] in commits:
        return  # 已有审查记录，跳过

    now = time.time()
    state = _load_inspector_state()
    last_fail = state.get("last_api_fail", 0)

    # Step 2: 如果上次API失败了，还没到重试间隔 → 跳过（不浪费API调用）
    if last_fail > 0 and now - last_fail < _INSPECTOR_RETRY_SEC:
        return

    log(f"🔍 质检扫描...")

    # Quick API checks
    checks = f"""快速检查 http://516380.com：
1. curl -sI --max-time 5 --noproxy '*' http://516380.com | head -1
2. curl -s --max-time 5 --noproxy '*' http://516380.com/api/points?type=leaderboard | grep leaderboard
3. curl -s --max-time 5 --noproxy '*' -X POST http://516380.com/api/register -H "Content-Type: application/json" -d '{{"email":"qa-{time.time()}@test.com","password":"test123","name":"qa"}}'
"""

    sys = ROLES["inspector"]["sys_prompt"]
    prompt = f"""最近提交: {commits[:500]}
请run_command执行基础健康检查，然后qa_report报告。
{checks[:500]}"""

    resp = claude_api(sys, prompt, tools=INSPECTOR_TOOLS, max_tokens=3000)
    if not resp:
        state["last_api_fail"] = now
        if now - state.get("last_board_fail", 0) > _INSPECTOR_BOARD_BACKOFF:
            reply_to_board("inspector", "⚠️ 质检API失败")
            state["last_board_fail"] = now
        _save_inspector_state(state)
        log("  质检API失败（2分钟后重试）")
        return

    for block in resp.get("content", []):
        if block["type"] == "tool_use":
            fn = block["name"]
            args = block["input"]
            if fn == "run_command":
                out, err, rc = bash(args["command"], timeout=30)
                log(f"    ⚡ {args.get('reason','')}: {args['command'][:60]} → {rc}")
            elif fn == "qa_report":
                reply_to_board("inspector", f"**结论**: {args.get('verdict','🟡')}\n\n{args.get('findings','')}")
                log(f"    📋 {args.get('verdict')}")
            elif fn == "read_code":
                read_file(args["path"])
        elif block["type"] == "text":
            log(f"    💬 {block['text'][:80]}")


def run_tester():
    """4号AI：扫板→体验测试→写报告"""
    t = MSG_BOARD.read_text()
    # Only test if explicitly tagged or every 10th scan
    if "仅限4号AI" not in t and hash(datetime.now(TZ).strftime("%M")) % 10 != 0:
        return

    log(f"🧪 体验扫描...")

    sys = ROLES["tester"]["sys_prompt"]
    prompt = f"""打开 http://516380.com 做一次快速体验测试。用experience_report报告。
重点：首页第一印象、注册流程、登录后的引导。
不需要深度测试，就是普通用户打开浏览3分钟后写50字感受。"""

    resp = claude_api(sys, prompt, tools=TESTER_TOOLS, max_tokens=2000)
    if not resp: return

    for block in resp.get("content", []):
        if block["type"] == "tool_use":
            fn = block["name"]
            args = block["input"]
            if fn == "experience_report":
                reply_to_board("tester", f"**{args.get('verdict','')}**\n\n{args.get('findings','')}")
                log(f"    📋 体验报告已写")
            elif fn == "run_command":
                bash(args["command"], timeout=30)
            elif fn == "read_code":
                read_file(args["path"])
        elif block["type"] == "text":
            log(f"    💬 {block['text'][:80]}")


# ─── 主函数 ────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--role", required=True, choices=list(ROLES.keys()))
    args = parser.parse_args()
    role = args.role
    role_info = ROLES[role]

    log(f"{role_info['emoji']} {role_info['name']} 启动")
    log(f"  轮询: {POLL}s | 模型: {API_MODEL} | 项目: {PROJECT_DIR}")

    # 杀旧实例
    STATE_FILE.write_text(json.dumps({"role": role, "pid": os.getpid(), "started": datetime.now(TZ).isoformat()}))

    git("pull origin main")

    while True:
        try:
            git("pull origin main 2>/dev/null")

            if role == "architect":
                run_architect()
            elif role == "executor":
                run_executor()
            elif role == "inspector":
                run_inspector()
            elif role == "tester":
                run_tester()

            STATE_FILE.write_text(json.dumps({"role": role, "last": datetime.now(TZ).isoformat()}))
        except Exception as e:
            log(f"❌ {e}")
            traceback.print_exc()

        time.sleep(POLL)


if __name__ == "__main__":
    main()
