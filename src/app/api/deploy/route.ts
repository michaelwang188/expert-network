import { NextResponse } from "next/server"
import { exec } from "child_process"

async function run(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout: 120000 }, (err, stdout, stderr) => {
      if (err) reject(stderr || err.message)
      else resolve(stdout)
    })
  })
}

export async function POST(): Promise<Response> {
  try {
    const out = await run('cd /opt/prolink && git checkout -- . 2>/dev/null && git pull && rm -rf .next && npm run build 2>&1 | tail -2 && pm2 restart prolink')
    return Response.json({ ok: true, output: out })
  } catch (e: any) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
