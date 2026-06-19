"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/dashboard", label: "数据看板", roles: ["RESEARCHER", "EXPERT", "ADMIN"] },
  { href: "/experts", label: "专家库", roles: ["RESEARCHER", "ADMIN"] },
  { href: "/experts/edit", label: "我的资料", roles: ["EXPERT"] },
  { href: "/request", label: "发起调研", roles: ["RESEARCHER"] },
  { href: "/orders", label: "订单管理", roles: ["RESEARCHER", "EXPERT", "ADMIN"] },
  { href: "/compliance", label: "合规中心", roles: ["ADMIN"] },
  { href: "/admin", label: "平台管理", roles: ["ADMIN"] },
]

export default function Nav() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const role = (session?.user as any)?.role

  if (!session) return null

  return (
    <nav style={{
      background: "#fff",
      borderBottom: "0.5px solid #e0dfd8",
      padding: "0 24px",
      display: "flex",
      alignItems: "center",
      height: 52,
      gap: 4,
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      <Link href="/dashboard" style={{ fontWeight: 500, fontSize: 15, color: "#185FA5", textDecoration: "none", marginRight: 32 }}>
        产研通 ProLink
      </Link>
      {navItems.filter(i => i.roles.includes(role)).map(item => (
        <Link
          key={item.href}
          href={item.href}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            fontSize: 13,
            textDecoration: "none",
            color: pathname === item.href ? "#185FA5" : "#5F5E5A",
            background: pathname === item.href ? "#E6F1FB" : "transparent",
            fontWeight: pathname === item.href ? 500 : 400,
          }}
        >
          {item.label}
        </Link>
      ))}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12, fontSize: 13 }}>
        <span style={{ color: "#888" }}>{session.user?.name || session.user?.email}</span>
        <span style={{
          background: role === "ADMIN" ? "#FCEBEB" : role === "EXPERT" ? "#E1F5EE" : "#E6F1FB",
          color: role === "ADMIN" ? "#A32D2D" : role === "EXPERT" ? "#0F6E56" : "#185FA5",
          padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500,
        }}>
          {role === "ADMIN" ? "管理员" : role === "EXPERT" ? "专家" : "研究员"}
        </span>
        <button onClick={() => signOut()} style={{
          background: "none", border: "0.5px solid #e0dfd8", borderRadius: 8,
          padding: "4px 10px", cursor: "pointer", fontSize: 12, color: "#5F5E5A",
        }}>退出</button>
      </div>
    </nav>
  )
}
