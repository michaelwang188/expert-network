import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
const MAX_SIZE = 10 * 1024 * 1024

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    if (!file) return NextResponse.json({ error: "未上传文件" }, { status: 400 })

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "不支持的文件类型，请上传 JPG/PNG/WebP/PDF" }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "文件大小不能超过10MB" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = path.extname(file.name) || ".jpg"
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    const dir = path.join(process.cwd(), "public", "uploads", "experts")
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, filename), buffer)

    return NextResponse.json({ url: `/uploads/experts/${filename}` })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
