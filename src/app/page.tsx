import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function Home() {
  const session = await getServerSession(authOptions)
  if (session) redirect("/dashboard")

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f8f7f4 0%, #eae8e1 100%)" }}>
      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 40px" }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: "#2c2c2a" }}>
          产研通 <span style={{ fontWeight: 400, color: "#888", fontSize: 14 }}>ProLink</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/login" style={{ padding: "8px 20px", borderRadius: 8, border: "0.5px solid #d0cec6", color: "#5F5E5A", fontSize: 14, textDecoration: "none" }}>登录</Link>
          <Link href="/register" style={{ padding: "8px 20px", borderRadius: 8, background: "#185FA5", color: "#fff", fontSize: 14, textDecoration: "none" }}>注册</Link>
        </div>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: 720, margin: "80px auto 0", textAlign: "center", padding: "0 20px" }}>
        <div style={{ fontSize: 12, letterSpacing: 3, color: "#185FA5", marginBottom: 16, textTransform: "uppercase" }}>
          产业调研·信息撮合平台
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 600, color: "#2c2c2a", lineHeight: 1.3, margin: "0 0 16px" }}>
          连接研究员与产业链专家<br/>让每一次调研都有价值
        </h1>
        <p style={{ fontSize: 16, color: "#888", lineHeight: 1.7, margin: "0 0 40px" }}>
          覆盖 AI 算力 · 新能源 · 半导体 · 创新药 · 消费电子等赛道<br/>
          平台撮合调研需求与行业专家，合规管控 + 积分结算，让产业调研安全高效
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/register" style={{ padding: "12px 32px", borderRadius: 10, background: "#0F6E56", color: "#fff", fontSize: 15, fontWeight: 500, textDecoration: "none" }}>
            注册加入
          </Link>
          <Link href="/login" style={{ padding: "12px 32px", borderRadius: 10, border: "0.5px solid #d0cec6", color: "#5F5E5A", fontSize: 15, textDecoration: "none" }}>
            登录账户
          </Link>
        </div>
      </div>

      {/* 30秒理解积分 */}
      <div style={{ maxWidth: 720, margin: "48px auto 0", padding: "0 20px", textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: "#5F5E5A", marginBottom: 16 }}>平台用积分交易，不用现金</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          <MiniCard emoji="💰" title="研究员" desc="购买积分 → 支付访谈费用" />
          <MiniCard emoji="🎓" title="专家" desc="完成访谈 → 获得积分" />
          <MiniCard emoji="🛡️" title="合规" desc="敏感词阻断·留痕·可审计" />
        </div>
      </div>

      {/* Three columns */}
      <div style={{ maxWidth: 960, margin: "80px auto 0", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, padding: "0 20px 80px" }}>
        <FeatureCard
          emoji="🔬"
          title="研究员"
          desc="发布产业调研需求，智能匹配行业专家。合规提纲审核，积分支付访谈费用，全流程留痕可追溯。"
        />
        <FeatureCard
          emoji="🧠"
          title="行业专家"
          desc="自主定价积分费率，设置可选档期。完成访谈积累积分，参与行业影响力排行榜。"
        />
        <FeatureCard
          emoji="🛡️"
          title="合规先行"
          desc="敏感词自动阻断、提纲预审、全程留痕归档。内幕信息零容忍，保障双方合规权益。"
        />
      </div>
    </div>
  )
}

function MiniCard({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: 14, border: "0.5px solid #e8e6df" }}>
      <div style={{ fontSize: 20, marginBottom: 4 }}>{emoji}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: "#2c2c2a", marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 12, color: "#888", lineHeight: 1.5 }}>{desc}</div>
    </div>
  )
}

function FeatureCard({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 28, border: "0.5px solid #e8e6df", textAlign: "center" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>{emoji}</div>
      <div style={{ fontSize: 16, fontWeight: 500, color: "#2c2c2a", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13, color: "#888", lineHeight: 1.7 }}>{desc}</div>
    </div>
  )
}
