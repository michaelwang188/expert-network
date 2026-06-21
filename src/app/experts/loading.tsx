export default function Loading() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 500 }}>专家库</h2>
        <div style={{ width: 60, height: 14, background: "#f1efe8", borderRadius: 4 }} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 36, background: "#f8f7f4", borderRadius: 8 }} />
        <div style={{ width: 100, height: 36, background: "#f8f7f4", borderRadius: 8 }} />
        <div style={{ width: 100, height: 36, background: "#f8f7f4", borderRadius: 8 }} />
        <div style={{ width: 100, height: 36, background: "#f8f7f4", borderRadius: 8 }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10, padding: 16, height: 130 }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#f1efe8" }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 14, width: "60%", background: "#f8f7f4", borderRadius: 4, marginBottom: 6 }} />
                <div style={{ height: 12, width: "40%", background: "#f8f7f4", borderRadius: 4 }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
              <div style={{ width: 50, height: 18, background: "#f1efe8", borderRadius: 4 }} />
              <div style={{ width: 40, height: 18, background: "#f1efe8", borderRadius: 4 }} />
            </div>
            <div style={{ height: 11, width: "50%", background: "#f8f7f4", borderRadius: 4 }} />
          </div>
        ))}
      </div>
    </div>
  )
}
