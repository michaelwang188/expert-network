import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") redirect("/dashboard")

  const [pendingExperts, allExperts, pendingOrders, allOrders, complianceLogs] = await Promise.all([
    prisma.expert.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "desc" } }),
    prisma.expert.findMany({ orderBy: { createdAt: "desc" } }),
    // 待派单：订单expertId为null（未指派专家）
    prisma.order.findMany({ where: { expertId: null }, orderBy: { createdAt: "desc" }, include: { researcher: true, request: true } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, include: { researcher: true, expert: true, request: true } }),
    prisma.complianceLog.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
  ])

  // Server Actions
  async function approveExpert(formData: FormData) {
    "use server"
    const id = formData.get("id") as string
    await prisma.expert.update({ where: { id }, data: { status: "ACTIVE", idVerified: true, empVerified: true, complianceSig: true } })
    revalidatePath("/admin")
  }
  async function rejectExpert(formData: FormData) {
    "use server"
    const id = formData.get("id") as string
    await prisma.expert.update({ where: { id }, data: { status: "INACTIVE" } })
    revalidatePath("/admin")
  }
  async function assignExpert(formData: FormData) {
    "use server"
    const orderId = formData.get("orderId") as string
    const expertId = formData.get("expertId") as string
    const amount = parseInt(formData.get("amount") as string)
    if (isNaN(amount) || amount < 1 || amount > 10000) {
      return  // 金额校验：1-10000积分范围
    }
    await prisma.order.update({
      where: { id: orderId },
      data: { expertId, amount, platformFee: Math.round(amount * 0.2), status: "PENDING" },
    })
    // 同时更新 request 状态
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (order) {
      await prisma.request.update({ where: { id: order.requestId }, data: { status: "MATCHING" } })
    }
    // 🔔 创建通知：通知专家有新的订单
    const expert = await prisma.expert.findUnique({ where: { id: expertId } })
    if (expert) {
      const request = await prisma.request.findUnique({ where: { id: order?.requestId } })
      await prisma.notification.create({
        data: {
          userId: expert.userId,
          type: "ORDER_ASSIGNED",
          title: "新的访谈订单",
          message: `您有新的访谈订单待确认：${request?.title || order?.orderNo}`,
          refId: orderId,
        },
      })
    }
    revalidatePath("/admin")
  }
  async function confirmOrder(formData: FormData) {
    "use server"
    const orderId = formData.get("orderId") as string
    await prisma.order.update({ where: { id: orderId }, data: { status: "ACTIVE", confirmedAt: new Date() } })
    revalidatePath("/admin")
  }
  async function handleCompliance(formData: FormData) {
    "use server"
    const id = formData.get("id") as string
    await prisma.complianceLog.update({ where: { id }, data: { handled: true } })
    revalidatePath("/admin")
  }

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>平台管理</h2>

      {/* 专家邀请 */}
      <div style={{ background: "#E6F1FB", border: "0.5px solid #b8d4f4", borderRadius: 10, padding: 12, marginBottom: 16, display: "flex", alignItems: "center", gap: 12, fontSize: 13 }}>
        <span>🔗 专家注册邀请链接：</span>
        <code style={{ background: "#fff", padding: "4px 10px", borderRadius: 6, fontSize: 12, flex: 1 }}>https://516380.com/register</code>
        <span style={{ fontSize: 12, color: "#185FA5" }}>（让专家选择「专家」身份注册，注册后在下方审核）</span>
      </div>

      {/* 统计卡片 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label="待审核专家" value={pendingExperts.length.toString()} color="#BA7517" />
        <StatCard label="待派单申请" value={pendingOrders.length.toString()} color="#185FA5" />
        <StatCard label="在库活跃专家" value={allExperts.filter(e => e.status === "ACTIVE").length.toString()} color="#0F6E56" />
        <StatCard label="冻结账户" value={allExperts.filter(e => e.status === "FROZEN").length.toString()} color="#A32D2D" />
      </div>

      {/* 待派单申请 */}
      <Section title={`待派单申请（${pendingOrders.length} 条）`} mb={20}>
        {pendingOrders.length === 0 && <Empty>暂无待派单申请</Empty>}
        {pendingOrders.map(o => (
          <AssignPanel key={o.id} order={o} experts={allExperts.filter(e => e.status === "ACTIVE")} assignExpert={assignExpert} />
        ))}
      </Section>

      {/* 专家审核队列 */}
      <Section title={`专家资质审核（${pendingExperts.length} 位待审）`} mb={20}>
        {pendingExperts.length === 0 && <Empty>暂无待审核专家</Empty>}
        {pendingExperts.map(e => (
          <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderBottom: "0.5px solid #f1efe8", fontSize: 13 }}>
            <div>
              <div style={{ fontWeight: 500 }}>{e.title}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{e.org} · {e.region} · 从业{e.years}年</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>擅长：{e.tags}</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              <form action={approveExpert}><input type="hidden" name="id" value={e.id} />
                <button type="submit" style={{ padding: "5px 12px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>通过</button>
              </form>
              <form action={rejectExpert}><input type="hidden" name="id" value={e.id} />
                <button type="submit" style={{ padding: "5px 12px", background: "#FCEBEB", color: "#A32D2D", border: "0.5px solid #f4b8b8", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>驳回</button>
              </form>
            </div>
          </div>
        ))}
      </Section>

      {/* 全部订单 */}
      <Section title="全部订单" mb={20}>
        {allOrders.length === 0 && <Empty>暂无订单</Empty>}
        {allOrders.map(o => (
          <OrderRow key={o.id} o={o} experts={allExperts} confirmOrder={confirmOrder} />
        ))}
      </Section>

      {/* 合规日志 */}
      <Section title="合规事件日志">
        {complianceLogs.map(log => (
          <div key={log.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, borderBottom: "0.5px solid #f1efe8", fontSize: 13 }}>
            <span style={{ background: log.handled ? "#EAF3DE" : "#FCEBEB", color: log.handled ? "#3B6D11" : "#A32D2D", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500, whiteSpace: "nowrap" }}>
              {log.handled ? "已处理" : log.eventType}
            </span>
            <span style={{ flex: 1, color: "#5F5E5A" }}>{log.description || `${log.targetType} ${log.targetId}`}</span>
            <span style={{ fontSize: 12, color: "#888" }}>{new Date(log.createdAt).toLocaleDateString()}</span>
            {!log.handled && (
              <form action={handleCompliance}><input type="hidden" name="id" value={log.id} />
                <button type="submit" style={{ padding: "3px 8px", background: "#E6F1FB", color: "#185FA5", border: "0.5px solid #b8d4f4", borderRadius: 4, fontSize: 11, cursor: "pointer" }}>标记已处理</button>
              </form>
            )}
          </div>
        ))}
      </Section>
    </div>
  )
}

// ── 派单面板 ──
function AssignPanel({ order, experts, assignExpert }: any) {
  const req = order.request
  const matched = experts.filter((e: any) => {
    const tags = (e.tags || "").toLowerCase()
    const industry = (req?.industry || "").toLowerCase()
    const subField = (req?.subField || "").toLowerCase()
    // 优先：标签匹配行业或子领域，其次：机构名匹配
    if (industry && tags.includes(industry)) return true
    if (subField && (tags.includes(subField) || (e.org || "").toLowerCase().includes(subField))) return true
    return false
  })
  // 无匹配时展示全部活跃专家供手动选择
  const candidates = matched.length > 0 ? matched : experts
  const display = candidates.slice(0, 8)

  return (
    <div style={{ padding: 14, borderBottom: "0.5px solid #f1efe8" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, fontSize: 14 }}>{req?.title || order.orderNo}</div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
            {order.orderNo} · {req?.industry} {req?.subField} · {req?.duration} · {req?.form}
          </div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>申请人：{order.researcher?.name}（{order.researcher?.orgName}）</div>
          {req?.outline && <div style={{ fontSize: 12, color: "#5F5E5A", marginTop: 6, background: "#f8f7f4", padding: 8, borderRadius: 6, whiteSpace: "pre-wrap" }}>{req.outline}</div>}
        </div>
        <form action={assignExpert} style={{ minWidth: 260 }}>
          <input type="hidden" name="orderId" value={order.id} />
          <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>匹配专家</div>
          <select name="expertId" required style={{ width: "100%", padding: 6, border: "0.5px solid #e0dfd8", borderRadius: 6, fontSize: 13, marginBottom: 6 }}>
            <option value="">请选择专家...</option>
            {display.map((e: any) => <option key={e.id} value={e.id}>{e.title}（{e.org}）· {e.ratePoints || e.rateHour || 500}积分/h</option>)}
          </select>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input name="amount" type="number" placeholder="金额(积分)" required min="1" defaultValue={order.amount || 800} style={{ width: 90, padding: 5, border: "0.5px solid #e0dfd8", borderRadius: 6, fontSize: 13 }} />
            <span style={{ fontSize: 12, color: "#888" }}>积分</span>
            <button type="submit" style={{ padding: "5px 12px", background: "#185FA5", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>派单</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── 订单行 ──
function OrderRow({ o, experts, confirmOrder }: any) {
  const STATUS: Record<string, { label: string; color: string }> = {
    PENDING:   { label: "待专家确认", color: "#BA7517" },
    ACTIVE:    { label: "进行中",     color: "#185FA5" },
    DONE:      { label: "已完成",     color: "#3B6D11" },
    PAID:      { label: "已结算",     color: "#0F6E56" },
    CANCELLED: { label: "已取消",     color: "#A32D2D" },
  }
  const s = STATUS[o.status] || { label: o.status, color: "#888" }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 10, borderBottom: "0.5px solid #f1efe8", fontSize: 13 }}>
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#888", minWidth: 120 }}>{o.orderNo}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500 }}>{o.request?.title || o.orderNo}</div>
        <div style={{ fontSize: 12, color: "#888" }}>专家：{o.expert?.title || "未指派"} · 研究员：{o.researcher?.name}</div>
      </div>
      <div style={{ fontWeight: 500, minWidth: 80 }}>{o.amount}积分</div>
      <span style={{ background: s.color + "18", color: s.color, padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 500, minWidth: 80, textAlign: "center" }}>{s.label}</span>
      {o.status === "PENDING" && o.expertId && (
        <form action={confirmOrder}><input type="hidden" name="orderId" value={o.id} /><button type="submit" style={{ padding: "4px 10px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>确认开始</button></form>
      )}
    </div>
  )
}

// ── 复用组件 ──
function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return <div style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10, padding: 16 }}>
    <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 500, color }}>{value}</div>
  </div>
}
function Section({ title, children, mb = 0 }: { title: string; children: any; mb?: number }) {
  return <div style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10, overflow: "hidden", marginBottom: mb }}>
    <div style={{ padding: 14, borderBottom: "0.5px solid #e0dfd8", fontSize: 14, fontWeight: 500 }}>{title}</div>
    {children}
  </div>
}
function Empty({ children }: { children: any }) {
  return <div style={{ padding: 20, color: "#888", fontSize: 13 }}>{children}</div>
}
