#!/usr/bin/env python3
"""
产研通 ProLink 全自动驾驶引擎 v3.0
====================================
一个脚本 = 三角色 24/7 自主运转，不需要任何 AI 会话存活。

🏗️ 总架构师 (每10分钟):   读需求文档 → 分析进度 → 创建新任务
🔧 执行架构师 (每30秒):   扫描 [⬜待认领] → 接 → 修 → 推
🔍 独立质检员 (每5分钟):  扫描新commit → 验证 → 写审查报告

部署: launchd KeepAlive + RunAtLoad
"""

import os, sys, json, time, re, hashlib, subprocess, urllib.request, traceback
from datetime import datetime, timezone, timedelta
from pathlib import Path

# ═══════════════════════════════════════════════════
# 配置
# ═══════════════════════════════════════════════════
PROJECT_DIR = Path("/Users/michaelwang188/WorkBuddy/2026-06-19-11-15-05/expert-network")
MSG_BOARD   = PROJECT_DIR / "AI_MESSAGE_BOARD.md"
IRON_RULES  = PROJECT_DIR / "IRON_RULES.md"
REQUIREMENTS= PROJECT_DIR / "REQUIREMENTS.md"
PITFALLS    = PROJECT_DIR / "PITFALLS.md"
STATE_FILE  = PROJECT_DIR / ".workbuddy" / "autopilot_state.json"
STATE_FILE.parent.mkdir(parents=True, exist_ok=True)

# API Key: 先从环境变量，再从 .env.local，最后尝试 bash 环境
def _load_key():
    k = os.environ.get("DEEPSEEK_API_KEY", "")
    if k and len(k) > 30: return k
    # 从项目 .env.local 读
    envf = PROJECT_DIR / ".env.local"
    if envf.exists():
        for line in envf.read_text().split("\n"):
            if line.strip().startswith("DEEPSEEK_API_KEY="):
                v = line.split("=", 1)[1].strip().strip('"').strip("'")
                if v and len(v) > 30: return v
    # 从 shell 环境尝试
    try:
        r = subprocess.run(["bash","-c","echo $DEEPSEEK_API_KEY"],
                          capture_output=True, text=True, timeout=5)
        v = r.stdout.strip()
        if v and len(v) > 30: return v
    except: pass
    return k

DS_KEY = _load_key()
DS_URL = "https://api.deepseek.com/v1/chat/completions"
DS_MODEL = "deepseek-chat"
DS_PROXY = os.environ.get("https_proxy", "http://127.0.0.1:12334")

TZ = timezone(timedelta(hours=8))
VERIFY_SCRIPT = ".claude/scripts/verify.sh"
PROD_URL = "https://516380.com"

POLL_FAST  = 15   # 2号AI 执行扫描 (15s)
POLL_QA    = 15   # 3号AI 质检扫描 (15s)
PLAN_EVERY = 999999  # 1号AI 已禁用 — 由Claude担任总架构师

# ═══════════════════════════════════════════════════
# 工具函数
# ═══════════════════════════════════════════════════
def log(msg): print(f"[{datetime.now(TZ).strftime('%H:%M:%S')}] {msg}", flush=True)

def bash(cmd, timeout=60):
    try:
        r = subprocess.run(["bash","-c",cmd], cwd=PROJECT_DIR,
                           capture_output=True,text=True,timeout=timeout)
        return r.stdout.strip(), r.stderr.strip(), r.returncode
    except: return "", "timeout", 124

def read_file(path):
    """安全读项目文件，自动修复 DeepSeek 幻觉路径"""
    full = (PROJECT_DIR / path).resolve()
    if str(full).startswith(str(PROJECT_DIR.resolve())):
        try: return full.read_text()
        except: pass
    # 幻觉路径修复：按文件名搜索项目目录
    name = Path(path).name
    for f in PROJECT_DIR.rglob(name):
        try: return f.read_text()
        except: pass
    return None

def write_file(path, content):
    full = (PROJECT_DIR / path).resolve()
    if not str(full).startswith(str(PROJECT_DIR.resolve())): return False
    try:
        full.parent.mkdir(parents=True, exist_ok=True)
        full.write_text(content); return True
    except: return False

def md5(p):
    try:
        with open(p,'rb') as f: return hashlib.md5(f.read()).hexdigest()
    except: return ""

def git(cmd):
    return bash(f"git {cmd} 2>&1")

def now_str(): return datetime.now(TZ).strftime("%H:%M")
def date_str(): return datetime.now(TZ).strftime("%m-%d %H:%M")

def api(messages, tools=None, max_tokens=4096):
    h = {"Authorization":f"Bearer {DS_KEY}","Content-Type":"application/json"}
    body = {"model":DS_MODEL,"messages":messages,"max_tokens":max_tokens,"temperature":0.3}
    if tools: body["tools"]=tools; body["tool_choice"]="auto"
    data = json.dumps(body).encode()
    req = urllib.request.Request(DS_URL,data=data,headers=h)
    try:
        with urllib.request.urlopen(req,timeout=90) as r: return json.loads(r.read())
    except:
        proxy = urllib.request.ProxyHandler({"https":DS_PROXY,"http":DS_PROXY})
        with urllib.request.build_opener(proxy).open(req,timeout=90) as r:
            return json.loads(r.read())

# ═══════════════════════════════════════════════════
# 消息板操作
# ═══════════════════════════════════════════════════
def board_text(): return MSG_BOARD.read_text()

def board_write(text): MSG_BOARD.write_text(text)

def scan_unclaimed():
    """扫描 📤区 [⬜待认领]"""
    tasks = []
    # 灵活匹配，不要求行首，容忍空格差异
    for m in re.finditer(r'### 📤 任务 #(\d+)\s*\|\s*\[⬜待认领\]\s*\|\s*(.+?)\s*\|\s*超时:\s*(\d+)',
                         board_text()):
        num, desc, timeout = m.group(1), m.group(2), m.group(3)
        start = m.end()
        end = board_text().find("\n###", start)
        if end == -1: end = board_text().find("\n---", start)
        if end == -1: end = len(board_text())
        body = board_text()[start:end].strip()
        tasks.append({"num":num,"desc":desc.strip(),"timeout":int(timeout),"body":body})
    return tasks

def lock_task(num):
    txt = board_text()
    t = datetime.now(TZ).strftime("%H:%M")
    old = f"### 📤 任务 #{num} | [⬜待认领] |"
    new = f"### 📤 任务 #{num} | [🔧执行中 @ autopilot {t}] |"
    if old not in txt: return False
    board_write(txt.replace(old, new))
    return True

def finish_task(num):
    txt = board_text()
    t = datetime.now(TZ).strftime("%H:%M")
    pattern = rf'### 📤 任务 #{num} \| \[🔧执行中 @ autopilot [^\]]+\]'
    board_write(re.sub(pattern, f"### 📤 任务 #{num} | [✅已完成 @ {t}]", txt))

def reply(msg):
    """在 📥区 写消息"""
    txt = board_text()
    marker = "## 📥 给总架构师的消息"
    idx = txt.find(marker)
    block = f"\n### {date_str()} | Autopilot\n\n{msg}\n\n---\n"
    if idx == -1:
        board_write(txt + block)
        return
    insert = txt.find("\n### ", idx + len(marker))
    if insert == -1: insert = len(txt)
    board_write(txt[:insert] + block + txt[insert:])

def reply_qa(msg):
    """在 🔍区 写审查报告"""
    txt = board_text()
    marker = "## 🔍 质检报告"
    idx = txt.find(marker)
    block = f"\n### {date_str()} | Autopilot 质检\n\n{msg}\n\n---\n"
    if idx == -1:
        board_write(txt + block)
        return
    insert = txt.find("\n### ", idx + len(marker))
    if insert == -1: insert = len(txt)
    board_write(txt[:insert] + block + txt[insert:])

def create_task(num, desc, timeout, body):
    """1号AI: 在 📤区 创建新任务"""
    txt = board_text()
    marker = "## 📤 给执行架构师的消息"
    idx = txt.find(marker)
    task_block = f"""### 📤 任务 #{num} | [⬜待认领] | {desc} | 超时: {timeout}min

> Autopilot (1号AI) {date_str()} 分配

{body}

---
"""
    # 插入到 📤区末尾（下一个 ## 之前）
    end = txt.find("\n## ", idx + len(marker))
    if end == -1: end = len(txt)
    board_write(txt[:end] + "\n" + task_block + txt[end:])
    log(f"  🏗️ 创建 任务#{num}: {desc}")

def next_task_num():
    """找下一个任务编号"""
    nums = set()
    for m in re.finditer(r'### 📤 任务 #(\d+)', board_text()):
        nums.add(int(m.group(1)))
    return str(max(nums) + 1) if nums else "6"

# ═══════════════════════════════════════════════════
# 工具定义
# ═══════════════════════════════════════════════════
EXECUTOR_TOOLS = [
    {"type":"function","function":{"name":"read_code","description":"Read a project source file","parameters":{"type":"object","properties":{"path":{"type":"string"}},"required":["path"]}}},
    {"type":"function","function":{"name":"write_code","description":"Write or overwrite a project file","parameters":{"type":"object","properties":{"path":{"type":"string"},"content":{"type":"string"}},"required":["path","content"]}}},
    {"type":"function","function":{"name":"run_command","description":"Run shell command in project dir","parameters":{"type":"object","properties":{"command":{"type":"string"},"reason":{"type":"string"}},"required":["command","reason"]}}},
    {"type":"function","function":{"name":"task_done","description":"Report task completion","parameters":{"type":"object","properties":{"status":{"type":"string","enum":["done","blocked"]},"summary":{"type":"string"},"details":{"type":"string"}},"required":["status","summary","details"]}}},
]

PLANNER_TOOLS = [
    {"type":"function","function":{"name":"read_file","description":"Read any project file","parameters":{"type":"object","properties":{"path":{"type":"string"}},"required":["path"]}}},
    {"type":"function","function":{"name":"create_new_task","description":"Create a new task in message board","parameters":{"type":"object","properties":{"num":{"type":"string"},"desc":{"type":"string"},"timeout":{"type":"string"},"body":{"type":"string"}},"required":["num","desc","timeout","body"]}}},
    {"type":"function","function":{"name":"no_action","description":"Nothing to do right now","parameters":{"type":"object","properties":{"reason":{"type":"string"}},"required":["reason"]}}},
]

QA_TOOLS = [
    {"type":"function","function":{"name":"read_file","description":"Read project file","parameters":{"type":"object","properties":{"path":{"type":"string"}},"required":["path"]}}},
    {"type":"function","function":{"name":"run_command","description":"Run shell command","parameters":{"type":"object","properties":{"command":{"type":"string"},"reason":{"type":"string"}},"required":["command","reason"]}}},
    {"type":"function","function":{"name":"qa_report","description":"Submit QA inspection report","parameters":{"type":"object","properties":{"verdict":{"type":"string","enum":["pass","conditional","reject"]},"score":{"type":"string"},"findings":{"type":"string"}},"required":["verdict","score","findings"]}}},
]

# ═══════════════════════════════════════════════════
# 🏗️ 总架构师 (1号AI) — 每10分钟
# ═══════════════════════════════════════════════════
def role_architect():
    """分析需求文档 + 当前进度 → 创建新任务"""
    log("🏗️ 1号AI 规划扫描...")

    req = read_file("REQUIREMENTS.md") or ""
    pitfalls = read_file("PITFALLS.md") or ""
    board = board_text()
    # 缩减到各自2000字符以内以节省 token
    req = req[:2000]
    pitfalls = pitfalls[:2000]
    board_summary = board[:2000]

    # 统计已完成和进行中的任务
    completed = len(re.findall(r'\[✅已完成', board))
    in_progress = len(re.findall(r'\[🔧执行中', board))
    unclaimed = len(re.findall(r'\[⬜待认领', board))

    sys = f"""你是产研通 ProLink 专家库的总架构师(1号AI)。你的工作是维护项目需求文档并进行任务规划。

平台：Next.js 15 + TypeScript + Prisma + Neon PostgreSQL + Vercel
当前状态：已完成{completed}个任务，{in_progress}个进行中，{unclaimed}个待认领

你需要做：
1. 从 REQUIREMENTS.md 和 PITFALLS.md 中识别未完成的功能或未修复的问题
2. 检查当前是否有未认领的任务堆积
3. 如果有值得做的工作 → create_new_task 分配新任务
4. 如果没有需要做的 → no_action

任务创建原则：
- 一次最多创建2个任务
- 每个任务有清晰的验收标准
- 原子化（30分钟以内）
- 优先级：P0 > P1 > P2
- 禁止重复已有任务
- 🔴 num必须用数字字符串如"7"，desc一行中文，timeout用"5"，body用Markdown分点

现在开始分析。"""

    messages = [
        {"role":"system","content":sys},
        {"role":"user","content":f"当前状态：已完成{completed}，进行中{in_progress}，待认领{unclaimed}。请分析并决定是否需要创建新任务。"}
    ]

    try:
        resp = api(messages, tools=PLANNER_TOOLS, max_tokens=2048)
        msg = resp["choices"][0]["message"]

        if "tool_calls" not in msg or not msg["tool_calls"]:
            log(f"  💤 无需创建新任务: {msg.get('content','')[:80]}")
            return

        for tc in msg["tool_calls"]:
            fn = tc["function"]
            args = json.loads(fn["arguments"])
            if fn["name"] == "create_new_task":
                create_task(args["num"], args["desc"], args["timeout"], args["body"])
            elif fn["name"] == "no_action":
                log(f"  💤 {args.get('reason','')}")
            elif fn["name"] == "read_file":
                content = read_file(args["path"]) or "FILE NOT FOUND"
                log(f"  📖 架构师读 {args['path']} ({len(content)} chars)")

        # 如果创建了任务，推送到 git
        out, err, rc = bash("git diff --cached --quiet")
        if rc != 0:  # rc=0 表示无变更，rc!=0 表示有变更
            git("add AI_MESSAGE_BOARD.md")
            git("commit -m 'autopilot·架构师: 规划新任务'")
            git("push origin main")
            log("  📤 已推送新任务")
        else:
            log("  💤 架构师无新任务")

    except Exception as e:
        log(f"  ❌ 架构师异常: {e}")

# ═══════════════════════════════════════════════════
# 🔧 执行架构师 (2号AI) — 每30秒
# ═══════════════════════════════════════════════════
def role_executor():
    """扫描 ⬜待认领 → 接 → 执行"""
    tasks = scan_unclaimed()
    if not tasks: return False

    log(f"🔧 发现 {len(tasks)} 个待认领任务")
    for task in tasks:
        num = task["num"]
        log(f"  ⚡ 任务#{num}: {task['desc']}")

        if not lock_task(num):
            log(f"    ⚠️ 锁定失败")
            continue
        bash(f"git add AI_MESSAGE_BOARD.md && git commit -m 'autopilot: 🔒 接任务#{num}' && git push origin main")

        # 构建执行提示
        sys = f"""你是产研通 ProLink 的执行架构师。你的工作是修复 bug 和实现功能。

技术栈: Next.js 15 + TypeScript + Prisma + Neon PG + Vercel + Tailwind
铁律:
1. 金额单位是积分，禁止 ¥
2. 敏感词必须阻断提交
3. 提交操作前端+后端双重防重复
4. 修改代码后跑 npx tsc --noEmit
5. 先 read_code 再 write_code
6. 完成后必须 task_done"""

        messages = [
            {"role":"system","content":sys},
            {"role":"user","content":f"执行任务#{num}: {task['desc']}\n\n{task['body']}\n\n先 read_code 读相关文件，然后修改代码，最后 task_done 报告完成。"}
        ]

        success = False
        for turn in range(10):
            try:
                resp = api(messages, tools=EXECUTOR_TOOLS, max_tokens=4096)
                msg = resp["choices"][0]["message"]

                if "tool_calls" not in msg or not msg["tool_calls"]:
                    if msg.get("content"):
                        messages.append({"role":"assistant","content":msg["content"]})
                    messages.append({"role":"user","content":"继续。使用工具调用来完成任务。"})
                    continue

                results = []
                for tc in msg["tool_calls"]:
                    fn = tc["function"]
                    args = json.loads(fn["arguments"])
                    rid = tc.get("id", f"call_{turn}")

                    if fn["name"] == "read_code":
                        result = read_file(args["path"]) or "ERROR: not found"
                        log(f"    📖 {args['path']} ({len(result)} chars)")
                        results.append({"role":"tool","tool_call_id":rid,"content":result[:6000]})

                    elif fn["name"] == "write_code":
                        ok = write_file(args["path"], args["content"])
                        result = f"{'OK' if ok else 'FAIL'}: wrote {len(args['content'])} bytes to {args['path']}"
                        log(f"    ✏️ {args['path']} → {'OK' if ok else 'FAIL'}")
                        results.append({"role":"tool","tool_call_id":rid,"content":result})

                    elif fn["name"] == "run_command":
                        out, err, rc = bash(args["command"], timeout=90)
                        result = f"exit={rc}\nSTDOUT:\n{out[:2000]}\nSTDERR:\n{err[:1000]}"
                        log(f"    ⚡ {args.get('reason','')}: {args['command'][:60]} → {rc}")
                        results.append({"role":"tool","tool_call_id":rid,"content":result})

                    elif fn["name"] == "task_done":
                        log(f"    ✅ task_done: {args.get('status')}")
                        reply(f"✅ 任务#{num}完成: {args['summary']}\n\n{args['details']}")
                        success = True
                        results.append({"role":"tool","tool_call_id":rid,"content":"Reported"})

                # 不追加 "tool_calls": null 的 assistant 消息
                msgs_to_add = [{"role":"assistant","content":"","tool_calls":msg["tool_calls"]}]
                msgs_to_add.extend(results)
                messages.extend(msgs_to_add)

                if success: break

            except Exception as e:
                log(f"    ❌ 轮次{turn}异常: {e}")
                break

        if not success:
            reply(f"⚠️ 任务#{num}未完成: 达到最大轮次或异常\n\n需人工检查。")
            log(f"  ⚠️ 任务#{num} 未完成")

        finish_task(num)
        bash(f"git add -A && git commit -m 'autopilot: 任务#{num}完成' && git push origin main")
        log(f"  {'✅' if success else '⚠️'} 任务#{num}")

    return bool(tasks)

# ═══════════════════════════════════════════════════
# 🔍 质检员 (3号AI) — 每5分钟
# ═══════════════════════════════════════════════════
def role_inspector():
    """扫描新 commit → 验证 → 写审查报告"""
    log("🔍 3号AI 质检扫描...")

    # 获取最近2个 commit
    out, _, _ = git("log --oneline -3")
    commits = out.split("\n") if out else []
    # 检查是否有 autopilot 以外的提交（或autopilot的代码变更提交）
    recent = [c for c in commits if "autopilot:" in c or "2号AI:" in c or "fix:" in c or "feat:" in c]
    recent = recent[:2]
    if not recent:
        log("  💤 无新代码提交，跳过质检")
        return

    log(f"  新提交: {recent[0]}")

    # 跑 verify.sh
    vout, verr, vrc = bash(f"bash {VERIFY_SCRIPT}", timeout=60)
    verify_ok = "All checks passed" in vout
    log(f"  verify.sh: {'✅' if verify_ok else '❌'}")

    # 让 DeepSeek 做简单分析
    sys = """你是产研通 ProLink 的独立质检员(3号AI)。零信任原则。
对照 REQUIREMENTS.md 和 IRON_RULES.md 快速审查最近的代码变更。

质量检查清单：
- 需求对齐（是否匹配 REQUIREMENTS.md）
- 铁律遵守（IRON_RULES.md 35条）
- 积分体系：无¥残留
- 敏感词：阻断而非提示
- 防重复：前端+后端
- TypeScript 类型安全

输出简洁的审查报告，用 ✅⚠️❌ 标记。"""

    messages = [
        {"role":"system","content":sys},
        {"role":"user","content":f"最近提交: {recent}\nverify.sh: {'PASS' if verify_ok else 'FAIL'}\n\n快速审查并写 qa_report。"}
    ]

    try:
        resp = api(messages, tools=QA_TOOLS, max_tokens=2048)
        msg = resp["choices"][0]["message"]
        if "tool_calls" in msg and msg["tool_calls"]:
            for tc in msg["tool_calls"]:
                fn = tc["function"]
                args = json.loads(fn["arguments"])
                if fn["name"] == "qa_report":
                    report = f"""**审查对象**: {recent[0].split(' ',1)[1] if len(recent[0].split(' ',1))>1 else recent[0]}
**verify.sh**: {'🟢 全绿' if verify_ok else '❌ 失败'}

**结论**: {'🟢 通过' if args['verdict']=='pass' else '🟡 有条件通过' if args['verdict']=='conditional' else '🔴 驳回'}

**评分**: {args.get('score','N/A')}

{args.get('findings','')}"""
                    reply_qa(report)
                    log(f"  📋 质检报告已写: {args.get('verdict')}")
                elif fn["name"] == "read_file":
                    content = read_file(args["path"]) or "NOT FOUND"
                    log(f"  📖 质检员读 {args['path']}")
                elif fn["name"] == "run_command":
                    bash(args["command"], timeout=30)
        else:
            log(f"  💤 质检员无结论")
    except Exception as e:
        log(f"  ❌ 质检异常: {e}")

# ═══════════════════════════════════════════════════
# 主循环
# ═══════════════════════════════════════════════════
def main():
    log("🚀 产研通 Autopilot v3.0")
    log(f"  🏗️ 1号AI·架构师  | 每{PLAN_EVERY}s")
    log(f"  🔧 2号AI·执行    | 每{POLL_FAST}s")
    log(f"  🔍 3号AI·质检    | 每{POLL_QA}s")
    log(f"  模型: {DS_MODEL}")
    log(f"  Key: {'✅' if DS_KEY else '❌'}")

    if not DS_KEY:
        log("❌ DEEPSEEK_API_KEY 未设置"); sys.exit(1)

    # 杀旧实例
    old = ""
    if STATE_FILE.exists():
        try: old = json.loads(STATE_FILE.read_text()).get("pid","")
        except: pass
    if old: log(f"  旧PID: {old}")
    STATE_FILE.write_text(json.dumps({"pid":str(os.getpid()),"started":datetime.now(TZ).isoformat()}))

    last_board_md5 = md5(MSG_BOARD)
    last_check = 0    # 立刻触发首次扫描
    last_plan = 0     # 立刻触发首次规划
    last_qa = 0       # 立刻触发首次质检

    bash("git pull origin main")

    iteration = 0
    while True:
        try:
            iteration += 1
            now = time.time()
            if iteration % 20 == 0:  # 每10分钟
                log(f"💓 心跳 #{iteration} | ⬜{len(scan_unclaimed())}")

            bash("git pull origin main 2>/dev/null")

            # 🔧 2号AI: 快扫 (每30s)
            if now - last_check >= POLL_FAST:
                last_check = now
                cur_hash = md5(MSG_BOARD)
                # 只在有变化时扫（节省API）
                # 但也要扫未认领任务（可能在拉取前就存在）
                if cur_hash != last_board_md5:
                    last_board_md5 = cur_hash
                    role_executor()
                else:
                    # 即使没变化，也检查是否有积压的未认领任务
                    if scan_unclaimed():
                        role_executor()

            # 🔍 3号AI: 质检 (每5分钟)
            if now - last_qa >= POLL_QA:
                last_qa = now
                role_inspector()

            # 🏗️ 1号AI: 规划 (每10分钟)
            if now - last_plan >= PLAN_EVERY:
                last_plan = now
                role_architect()

            STATE_FILE.write_text(json.dumps({
                "pid":str(os.getpid()),
                "last_check":datetime.now(TZ).isoformat(),
                "last_plan":datetime.fromtimestamp(last_plan,TZ).isoformat(),
                "last_qa":datetime.fromtimestamp(last_qa,TZ).isoformat(),
            }))

        except Exception as e:
            log(f"❌ 主循环: {e}")
            traceback.print_exc()

        time.sleep(POLL_FAST)

if __name__ == "__main__":
    main()
