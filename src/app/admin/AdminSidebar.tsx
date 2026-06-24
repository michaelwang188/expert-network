"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { isSuperAdmin } from "@/lib/roles"

export default function AdminSidebar() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const pathname = usePathname()

  const LINKS = [
    { href: "/admin", label: "总览", emoji: "📊" },
    { href: "/admin/experts", label: "专家管理", emoji: "👥" },
    { href: "/admin/orders", label: "订单管理", emoji: "📋" },
  ]
  // 用户管理仅超级管理员可见
  if (isSuperAdmin(role)) {
    LINKS.push({ href: "/admin/users", label: "用户管理", emoji: "👤" })
  }
  LINKS.push(
    { href: "/admin/review", label: "提纲审核", emoji: "🔍" },
    { href: "/admin/audit", label: "合规日志", emoji: "🛡️" },
  )

  return (
    <nav style={{
      width: 180, flexShrink: 0,
      background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10,
      padding: 12, position: "sticky", top: 64,
    }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: "#888", marginBottom: 8, padding: "4px 8px" }}>管理后台</div>
      {LINKS.map(l => (
        <Link key={l.href} href={l.href} style={{ textDecoration: "none" }}>
          <div style={{
            padding: "8px", borderRadius: 8, fontSize: 13, marginBottom: 2,
            background: pathname === l.href ? "#E6F1FB" : "transparent",
            color: pathname === l.href ? "#185FA5" : "#5F5E5A",
            fontWeight: pathname === l.href ? 500 : 400,
          }}>
            {l.emoji} {l.label}
          </div>
        </Link>
      ))}
    </nav>
  )
}
