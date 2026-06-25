import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "通知中心",
}

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  const userId = (session.user as any).id as string
  if (!userId) redirect("/login")

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })

  const unreadCount = notifications.filter(n => !n.read).length

  // Server Action: 标记已读
  async function markAsRead(formData: FormData) {
    "use server"
    const id = formData.get("id") as string
    await prisma.notification.update({ where: { id }, data: { read: true } })
    revalidatePath("/notifications")
  }

  // Server Action: 标记全部已读
  async function markAllAsRead() {
    "use server"
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    })
    revalidatePath("/notifications")
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 500 }}>通知中心（{unreadCount} 条未读）</h2>
        {unreadCount > 0 && (
          <form action={markAllAsRead}>
            <button type="submit" style={{ padding: "6px 12px", background: "none", border: "0.5px solid #e0dfd8", borderRadius: 6, fontSize: 13, cursor: "pointer" }}>
              全部标为已读
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 && (
        <div style={{ padding: 40, textAlign: "center", color: "#888", fontSize: 14 }}>暂无通知</div>
      )}

      {notifications.map(n => (
        <div key={n.id} style={{
          padding: 14,
          borderBottom: "0.5px solid #f1efe8",
          background: n.read ? "#fff" : "#f8f7f4",
          borderRadius: n.read ? 0 : 6,
          marginBottom: n.read ? 0 : 4,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: n.read ? "#ddd" : "#185FA5",
              marginTop: 6,
              flexShrink: 0,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: n.read ? 400 : 500, fontSize: 14, marginBottom: 4 }}>{n.title}</div>
              <div style={{ fontSize: 13, color: "#5F5E5A", marginBottom: 6 }}>{n.message}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{new Date(n.createdAt).toLocaleString()}</div>
            </div>
            {!n.read && (
              <form action={markAsRead}>
                <input type="hidden" name="id" value={n.id} />
                <button type="submit" style={{ padding: "4px 8px", background: "none", border: "0.5px solid #e0dfd8", borderRadius: 4, fontSize: 12, cursor: "pointer" }}>
                  标为已读
                </button>
              </form>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
