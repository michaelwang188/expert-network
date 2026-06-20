"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

const navItems: { href: string; label: string; roles: string[] }[] = [
  { href: "/dashboard", label: "数据看板", roles: ["RESEARCHER", "EXPERT", "ADMIN"] },
  { href: "/experts", label: "专家库", roles: ["RESEARCHER", "ADMIN"] },
  { href: "/experts/edit", label: "我的资料", roles: ["EXPERT"] },
  { href: "/request", label: "发起调研", roles: ["RESEARCHER"] },
  { href: "/orders", label: "订单管理", roles: ["RESEARCHER", "EXPERT", "ADMIN"] },
  { href: "/notifications", label: "通知", roles: ["RESEARCHER", "EXPERT", "ADMIN"] },
  { href: "/leaderboard", label: "积分排行", roles: ["RESEARCHER", "EXPERT", "ADMIN"] },
  { href: "/compliance", label: "合规中心", roles: ["ADMIN"] },
  { href: "/admin", label: "平台管理", roles: ["ADMIN"] },
]

export default function Nav() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const role = (session?.user as any)?.role
  const [unreadCount, setUnreadCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (session) {
      fetch("/api/notifications/unread-count")
        .then(res => res.json())
        .then(data => setUnreadCount(data.count || 0))
        .catch(() => setUnreadCount(0))
    }
  }, [session, pathname])

  if (!session) return null
  const visibleItems = navItems.filter(i => i.roles.includes(role))

  return (
    <nav style={{
      background: "#fff",
      borderBottom: "0.5px solid #e0dfd8",
      padding: "0 16px",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ display: "flex", alignItems: "center", height: 52, gap: 4 }}>
        <Link href="/dashboard" style={{ fontWeight: 500, fontSize: 15, color: "#185FA5", textDecoration: "none", marginRight: 16, flexShrink: 0 }}>
          产研通
        </Link>

        {/* 桌面端 nav items */}
        <div style={{ display: "flex", gap: 2, overflow: "hidden" }} className="desktop-nav">
          {visibleItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: "6px 10px", borderRadius: 8, fontSize: 13, textDecoration: "none",
                color: pathname === item.href ? "#185FA5" : "#5F5E5A",
                background: pathname === item.href ? "#E6F1FB" : "transparent",
                fontWeight: pathname === item.href ? 500 : 400, position: "relative", whiteSpace: "nowrap",
              }}
            >
              {item.label}
              {item.href === "/notifications" && unreadCount > 0 && (
                <span style={{ position: "absolute", top: -4, right: -8, background: "#A32D2D", color: "#fff", fontSize: 10, fontWeight: 600, minWidth: 16, height: 16, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          ))}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
          <Link href="/profile" style={{ color: "#185FA5", textDecoration: "none", fontSize: 13, whiteSpace: "nowrap" }}>
            {session.user?.name || session.user?.email}
          </Link>
          <span style={{ background: role === "ADMIN" ? "#FCEBEB" : role === "EXPERT" ? "#E1F5EE" : "#E6F1FB", color: role === "ADMIN" ? "#A32D2D" : role === "EXPERT" ? "#0F6E56" : "#185FA5", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500, whiteSpace: "nowrap" }}>
            {role === "ADMIN" ? "管理员" : role === "EXPERT" ? "专家" : "研究员"}
          </span>
          <button onClick={() => signOut()} style={{ background: "none", border: "0.5px solid #e0dfd8", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 12, color: "#5F5E5A", whiteSpace: "nowrap" }}>退出</button>

          {/* 移动端汉堡 */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-menu-btn" style={{ display: "none", background: "none", border: "none", fontSize: 20, cursor: "pointer", padding: "4px 8px" }}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* 移动端下拉菜单 */}
      {menuOpen && (
        <div className="mobile-menu" style={{ display: "none", padding: "8px 0 12px", borderTop: "0.5px solid #f1efe8", flexDirection: "column", gap: 4 }}>
          {visibleItems.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} style={{
              display: "block", padding: "10px 12px", borderRadius: 8, fontSize: 14, textDecoration: "none",
              color: pathname === item.href ? "#185FA5" : "#5F5E5A",
              background: pathname === item.href ? "#E6F1FB" : "transparent",
              fontWeight: pathname === item.href ? 500 : 400,
            }}>
              {item.label}
              {item.href === "/notifications" && unreadCount > 0 && (
                <span style={{ marginLeft: 8, background: "#A32D2D", color: "#fff", fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 8 }}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
