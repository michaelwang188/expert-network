import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/roles"
import AdminSidebar from "./AdminSidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || !isAdmin((session.user as any).role)) redirect("/dashboard")

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      <AdminSidebar />
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  )
}
