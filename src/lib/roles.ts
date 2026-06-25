// 管理员角色分层工具
// SUPER_ADMIN = 超级管理员（老板）, ADMIN = 日常管理员（IT人员）

export function isAdmin(role: string): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN"
}

export function isSuperAdmin(role: string): boolean {
  return role === "SUPER_ADMIN"
}

export function isSponsor(tier: string | null | undefined): boolean {
  return tier === "CO_FOUNDER" || tier === "CO_SPONSOR"
}

export function getSponsorLabel(tier: string | null | undefined): { label: string; color: string } | null {
  if (tier === "CO_FOUNDER") return { label: "联合创始人", color: "#BA7517" }
  if (tier === "CO_SPONSOR") return { label: "联合赞助人", color: "#7B3FA5" }
  return null
}

// 角色显示标签
export const ROLE_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  RESEARCHER:   { label: "研究员",     color: "#185FA5", bg: "#E6F1FB" },
  EXPERT:       { label: "专家",       color: "#0F6E56", bg: "#E1F5EE" },
  INVESTOR:     { label: "投资人",     color: "#7B3FA5", bg: "#F3E8FF" },
  ADMIN:        { label: "管理员",     color: "#A32D2D", bg: "#FCEBEB" },
  SUPER_ADMIN:  { label: "超级管理员", color: "#8B0000", bg: "#FFE0E0" },
}
