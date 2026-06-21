export default function Loading() {
  return (
    <div style={{ maxWidth: 680 }}>
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>公益积分排行榜</h2>
      <div style={{ height: 34, width: "70%", background: "#f8f7f4", borderRadius: 4, marginBottom: 16 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10, padding: 14, display: "flex", alignItems: "center", gap: 12, height: 52 }}>
            <div style={{ width: 28, height: 16, background: "#f1efe8", borderRadius: 4 }} />
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f1efe8" }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 14, width: "50%", background: "#f8f7f4", borderRadius: 4, marginBottom: 6 }} />
              <div style={{ height: 11, width: "30%", background: "#f8f7f4", borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
