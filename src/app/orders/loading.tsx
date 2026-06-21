export default function Loading() {
  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>订单管理</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <div style={{ width: 120, height: 34, background: "#f8f7f4", borderRadius: 8 }} />
        <div style={{ marginLeft: "auto", width: 80, height: 14, background: "#f1efe8", borderRadius: 4 }} />
      </div>
      <div style={{ background: "#f8f7f4", borderRadius: 8, padding: 10, height: 40, marginBottom: 12 }} />
      <div style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10, height: 300 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ padding: 10, borderBottom: "0.5px solid #f1efe8", display: "flex", gap: 12 }}>
            <div style={{ width: 80, height: 13, background: "#f1efe8", borderRadius: 4 }} />
            <div style={{ flex: 1, height: 13, background: "#f8f7f4", borderRadius: 4 }} />
            <div style={{ width: 60, height: 13, background: "#f1efe8", borderRadius: 4 }} />
          </div>
        ))}
      </div>
    </div>
  )
}
