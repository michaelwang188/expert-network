// 通用加载+空状态+错误态组件

export function Spinner({ text = "加载中..." }: { text?: string }) {
  return (
    <div style={{ padding: 48, textAlign: "center" }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%", border: "3px solid #f1efe8",
        borderTopColor: "#185FA5", margin: "0 auto 12px",
        animation: "spin 0.6s linear infinite",
      }} />
      <div style={{ fontSize: 13, color: "#888" }}>{text}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div style={{ padding: 24, textAlign: "center", background: "#FCEBEB", borderRadius: 10, border: "0.5px solid #f4b8b8" }}>
      <div style={{ fontSize: 14, color: "#A32D2D", marginBottom: 8 }}>⚠️ {message}</div>
      {onRetry && (
        <button onClick={onRetry} style={{ padding: "6px 16px", borderRadius: 6, border: "none", background: "#A32D2D", color: "#fff", fontSize: 12, cursor: "pointer" }}>
          重试
        </button>
      )}
    </div>
  )
}

export function EmptyGuide({ emoji, title, desc, action }: {
  emoji: string; title: string; desc: string
  action?: { label: string; href: string }
}) {
  return (
    <div style={{ textAlign: "center", padding: 48, background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 12 }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{emoji}</div>
      <div style={{ fontSize: 15, fontWeight: 500, color: "#2c2c2a", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13, color: "#888", marginBottom: 20, maxWidth: 400, margin: "0 auto 20px", lineHeight: 1.7 }}>{desc}</div>
      {action && (
        <a href={action.href} style={{ display: "inline-block", padding: "10px 28px", borderRadius: 8, background: "#185FA5", color: "#fff", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
          {action.label}
        </a>
      )}
    </div>
  )
}
