import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")
  const role = (session.user as any).role
  const userId = (session.user as any).id

  return (
    <div>
      {role === "RESEARCHER" && <ResearcherDashboard userId={userId} />}
      {role === "EXPERT" && <ExpertDashboard userId={userId} />}
      {role === "ADMIN" && <AdminDashboard />}
    </div>
  )
}

// ─── 研究员 Dashboard ────────────────────────────
async function ResearcherDashboard({ userId }: { userId: string }) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { points: true, name: true } })
  const [myRequests, myOrders] = await Promise.all([
    prisma.request.count({ where: { researcherId: userId } }),
    prisma.order.count({ where: { researcherId: userId } }),
  ])
  const activeExperts = await prisma.expert.count({ where: { status: "ACTIVE" } })

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>我的工作台</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label="账户积分余额" value={user?.points?.toLocaleString() || "0"} sub="积分" />
        <StatCard label="我的调研需求" value={myRequests.toString()} sub="条已提交" />
        <StatCard label="我的订单" value={myOrders.toString()} sub="笔" />
        <StatCard label="可预约专家" value={activeExperts.toString()} sub="位活跃" />
      </div>

      {myRequests === 0 ? (
        <div style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 12, padding: 40 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🔬</div>
            <div style={{ fontSize: 17, fontWeight: 600, color: "#2c2c2a", marginBottom: 4 }}>
              {user?.name || "研究员"}，欢迎
            </div>
            <div style={{ fontSize: 14, color: "#5F5E5A", marginBottom: 14 }}>
              一个好的调研问题，比十个答案都重要
            </div>
            <div style={{ fontSize: 13, color: "#888", lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>
              平台已有 <strong style={{ color: "#185FA5" }}>{activeExperts}</strong> 位行业专家。首次使用无需积分即可发起调研
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
            <StepCard num="1" title="提交需求" desc="描述调研主题、预算和提纲" />
            <StepCard num="2" title="平台匹配" desc="管理员匹配最适合的专家" />
            <StepCard num="3" title="访谈完成" desc="专家接单→访谈→结算积分" />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Link href="/request" style={{ display: "inline-block", padding: "10px 28px", borderRadius: 8, background: "#185FA5", color: "#fff", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
              发起调研需求
            </Link>
            <Link href="/experts" style={{ display: "inline-block", padding: "10px 28px", borderRadius: 8, border: "0.5px solid #d0cec6", color: "#5F5E5A", fontSize: 14, textDecoration: "none" }}>
              先看看专家
            </Link>
          </div>
        </div>
      ) : (
        <QuickLinks />
      )}
    </div>
  )
}

// ─── 专家 Dashboard ───────────────────────────────
async function ExpertDashboard({ userId }: { userId: string }) {
  const expert = await prisma.expert.findUnique({
    where: { userId },
    select: { id: true, status: true, completedOrders: true, rating: true, ratePoints: true, realName: true },
  })
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { points: true } })

  if (!expert) {
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🧠</div>
        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>完善专家资料</div>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>创建专家档案后即可接收访谈订单</div>
        <Link href="/experts/edit" style={{ padding: "10px 28px", borderRadius: 8, background: "#0F6E56", color: "#fff", fontSize: 14, textDecoration: "none" }}>创建专家档案</Link>
      </div>
    )
  }

  const pendingOrders = await prisma.order.count({ where: { expertId: expert.id, status: "PENDING" } })
  const activeOrders = await prisma.order.count({ where: { expertId: expert.id, status: "ACTIVE" } })
  const reviewing = expert.status === "PENDING"

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>{expert.realName} 的工作台</h2>

      {reviewing && (
        <div style={{ background: "#FFF8E1", border: "0.5px solid #f0d77b", borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13, color: "#BA7517" }}>
          ⏳ 您的专家资料正在审核中，审核通过后即可接收访谈订单。预计 1-2 个工作日内完成。
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label="账户积分余额" value={user?.points?.toLocaleString() || "0"} sub="积分" />
        <StatCard label="待接订单" value={pendingOrders.toString()} sub="笔" />
        <StatCard label="进行中订单" value={activeOrders.toString()} sub="笔" />
        <StatCard label="累计完成" value={expert.completedOrders.toString()} sub="笔" />
      </div>

      {pendingOrders === 0 && activeOrders === 0 && expert.completedOrders === 0 ? (
        <div style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 12, padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🧠</div>
          <div style={{ fontSize: 15, fontWeight: 500, color: "#2c2c2a", marginBottom: 8 }}>
            {reviewing ? "审核通过后将自动分配订单" : "尚无新订单"}
          </div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 20, lineHeight: 1.7 }}>
            {reviewing ? "管理员审核您的专家档案后，研究员提交的匹配需求将自动推荐给您" : "管理员匹配到合适的需求后会分配订单给您，届时您将在此页面看到"}
          </div>
          {!reviewing && (
            <Link href="/orders" style={{ display: "inline-block", padding: "10px 28px", borderRadius: 8, border: "0.5px solid #d0cec6", color: "#5F5E5A", fontSize: 14, textDecoration: "none" }}>
              查看订单
            </Link>
          )}
        </div>
      ) : (
        <QuickLinks />
      )}
    </div>
  )
}

// ─── 管理员 Dashboard ─────────────────────────────
async function AdminDashboard() {
  const [pendingExperts, pendingOrders, activeExperts, totalOrders, unhandledLogs] = await Promise.all([
    prisma.expert.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { expertId: null, status: { not: "CANCELLED" } } }),
    prisma.expert.count({ where: { status: "ACTIVE" } }),
    prisma.order.count(),
    prisma.complianceLog.count({ where: { handled: false } }),
  ])

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>管理后台概览</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label="待派单" value={pendingOrders.toString()} sub="笔" />
        <StatCard label="待审核专家" value={pendingExperts.toString()} sub="位" />
        <StatCard label="在库活跃专家" value={activeExperts.toString()} sub="位" />
        <StatCard label="总订单" value={totalOrders.toString()} sub="笔" />
        <StatCard label="合规待处理" value={unhandledLogs.toString()} sub="项" warn={unhandledLogs > 0} />
      </div>

      {pendingOrders > 0 ? (
        <div style={{ background: "#E6F1FB", border: "0.5px solid #b8d4f4", borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13, color: "#185FA5" }}>
          📋 有 {pendingOrders} 笔订单待派单，请前往 <Link href="/admin" style={{ fontWeight: 500 }}>管理后台</Link> 匹配合适的专家
        </div>
      ) : pendingExperts > 0 ? (
        <div style={{ background: "#FFF8E1", border: "0.5px solid #f0d77b", borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13, color: "#BA7517" }}>
          🧠 有 {pendingExperts} 位专家待审核，请前往 <Link href="/admin/experts" style={{ fontWeight: 500 }}>专家审核</Link>
        </div>
      ) : (
        <div style={{ background: "#EAF3DE", border: "0.5px solid #c4ddb2", borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13, color: "#3B6D11" }}>
          ✅ 所有事项已处理完毕，平台运行正常
        </div>
      )}

      <QuickLinks />
    </div>
  )
}

// ─── 通用 ─────────────────────────────────────────
function StepCard({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div style={{ textAlign: "center", padding: 12, background: "#f8f7f4", borderRadius: 8 }}>
      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#185FA5", color: "#fff", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px" }}>{num}</div>
      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 11, color: "#888", lineHeight: 1.4 }}>{desc}</div>
    </div>
  )
}

function QuickLinks() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
      <LinkCard href="/experts" label="专家库" desc="浏览行业专家" />
      <LinkCard href="/orders" label="我的订单" desc="查看订单状态" />
      <LinkCard href="/leaderboard" label="积分排行" desc="公益积分榜" />
      <LinkCard href="/profile" label="个人中心" desc="管理账户信息" />
    </div>
  )
}

function LinkCard({ href, label, desc }: { href: string; label: string; desc: string }) {
  return (
    <Link href={href} style={{ display: "block", background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10, padding: 16, textDecoration: "none" }}>
      <div style={{ fontSize: 14, fontWeight: 500, color: "#2c2c2a", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, color: "#888" }}>{desc}</div>
    </Link>
  )
}

function StatCard({ label, value, sub, warn }: { label: string; value: string; sub: string; warn?: boolean }) {
  return (
    <div style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10, padding: 16 }}>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 500, color: warn ? "#A32D2D" : "#2c2c2a" }}>{value}</div>
      <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{sub}</div>
    </div>
  )
}
