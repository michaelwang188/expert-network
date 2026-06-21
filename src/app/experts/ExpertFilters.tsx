"use client"

import { useRouter, useSearchParams } from "next/navigation"

export default function ExpertFilters({
  industries, roleTypes, forms,
  currentIndustry, currentRoleType, currentForm, currentSearch,
}: {
  industries: string[]; roleTypes: string[]; forms: string[]
  currentIndustry: string; currentRoleType: string; currentForm: string; currentSearch: string
}) {
  const router = useRouter()

  const push = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search)
    if (value) params.set(key, value); else params.delete(key)
    if (key !== "page") params.delete("page") // 改筛选时重置分页
    router.push(`/experts?${params.toString()}`)
  }

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
      <input
        placeholder="搜索专家姓名、单位、擅长领域..."
        defaultValue={currentSearch}
        onChange={(e) => {
          const v = e.target.value
          clearTimeout((e.target as any)._debounce)
          ;(e.target as any)._debounce = setTimeout(() => push("search", v), 300)
        }}
        style={{ flex: 1, minWidth: 200, padding: 8, border: "0.5px solid #e0dfd8", borderRadius: 8, fontSize: 13, outline: "none" }}
      />
      <select value={currentIndustry} onChange={(e) => push("industry", e.target.value)}
        style={{ padding: 8, border: "0.5px solid #e0dfd8", borderRadius: 8, fontSize: 13, outline: "none", background: "#fff" }}>
        <option value="">全部行业</option>
        {industries.map((i) => <option key={i} value={i}>{i}</option>)}
      </select>
      <select value={currentRoleType} onChange={(e) => push("roleType", e.target.value)}
        style={{ padding: 8, border: "0.5px solid #e0dfd8", borderRadius: 8, fontSize: 13, outline: "none", background: "#fff" }}>
        <option value="">全部属性</option>
        {roleTypes.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
      <select value={currentForm} onChange={(e) => push("form", e.target.value)}
        style={{ padding: 8, border: "0.5px solid #e0dfd8", borderRadius: 8, fontSize: 13, outline: "none", background: "#fff" }}>
        <option value="">访谈形式</option>
        {forms.map((f) => <option key={f} value={f}>{f}</option>)}
      </select>
    </div>
  )
}
