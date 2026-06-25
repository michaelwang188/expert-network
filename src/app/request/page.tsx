// RSC: 发起调研页 — 首帧服务端渲染，表单交互客户端
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import RequestClient from "./RequestClient"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "发起调研",
}

export default async function RequestPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")
  const role = (session.user as any).role
  if (role && role !== "RESEARCHER") redirect("/dashboard")
  return <RequestClient />
}
