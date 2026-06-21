import { NextResponse } from "next/server"
import { exec } from "child_process"

export async function POST() {
  return new Promise((resolve) => {
    exec('cd /opt/prolink && git checkout -- . 2>/dev/null && git pull origin main && rm -rf .next && npm run build 2>&1 | tail -2 && pm2 restart prolink',
      { timeout: 120000 },
      (err, stdout, stderr) => {
        if (err) resolve(NextResponse.json({ ok: false, error: stderr || err.message }, { status: 500 }))
        else resolve(NextResponse.json({ ok: true, output: stdout }))
      }
    )
  })
}
