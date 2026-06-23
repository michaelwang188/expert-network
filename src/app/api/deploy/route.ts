import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { exec } from "child_process"

const DEPLOY_KEY = "prolink-deploy-2026"

async function run(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout: 120000 }, (err, stdout, stderr) => {
      if (err) reject(stderr || err.message)
      else resolve(stdout)
    })
  })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const deployKey = req.headers.get("x-deploy-key")
  const isAdmin = session && (session.user as any).role === "ADMIN"
  const isWebhook = deployKey === DEPLOY_KEY

  if (!isAdmin && !isWebhook) {
    return NextResponse.json({ error: "无权限" }, { status: 403 })
  }

  try {
    const out = await run('cd /opt/prolink && git pull && npx prisma generate && rm -rf .next && npm run build 2>&1 | tail -5 && pm2 restart prolink')
    return NextResponse.json({ ok: true, output: out })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
