"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AuthGuard({
  children,
  roles,
}: {
  children: React.ReactNode
  roles?: string[]
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#888", fontSize: 14 }}>
        正在加载...
      </div>
    )
  }

  if (!session) {
    return null // useEffect will redirect
  }

  if (roles && !roles.includes((session.user as any)?.role)) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#888", fontSize: 14 }}>
        当前角色无权限访问此页面
      </div>
    )
  }

  return <>{children}</>
}
