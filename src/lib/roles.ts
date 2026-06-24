// 管理员角色分层工具
// SUPER_ADMIN = 超级管理员（老板）, ADMIN = 日常管理员（IT人员）

export function isAdmin(role: string): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN"
}

export function isSuperAdmin(role: string): boolean {
  return role === "SUPER_ADMIN"
}

// 角色显示标签
export const ROLE_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  RESEARCHER:   { label: "研究员",     color: "#185FA5", bg: "#E6F1FB" },
  EXPERT:       { label: "专家",       color: "#0F6E56", bg: "#E1F5EE" },
  ADMIN:        { label: "管理员",     color: "#A32D2D", bg: "#FCEBEB" },
  SUPER_ADMIN:  { label: "超级管理员", color: "#8B0000", bg: "#FFE0E0" },
}
