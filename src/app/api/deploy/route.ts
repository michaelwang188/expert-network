import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { exec } from "child_process"

async function run(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout: 120000 }, (err, stdout, stderr) => {
      if (err) reject(stderr || err.message)
      else resolve(stdout)
    })
  })
}

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "无权限" }, { status: 403 })
  }
  try {
    const out = await run('cd /opt/prolink && git pull && npx prisma generate && rm -rf .next && npm run build 2>&1 | tail -5 && pm2 restart prolink')
    return NextResponse.json({ ok: true, output: out })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
