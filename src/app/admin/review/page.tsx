// RSC: 提纲审核页首帧服务端数据 + 客户端状态变更
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import ReviewClient from "./ReviewClient"

export default async function AdminReviewPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") redirect("/dashboard")

  const requests = await prisma.request.findMany({
    orderBy: { createdAt: "desc" },
    include: { researcher: { select: { name: true, orgName: true } } },
  })

  const serialized = requests.map((r: any) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }))

  return <ReviewClient initialRequests={serialized} />
}
