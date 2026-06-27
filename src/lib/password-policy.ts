/**
 * 密码策略 — 统一规则
 * 至少8位，必须包含大写字母、小写字母、数字
 */

export const MIN_PASSWORD_LENGTH = 8

export function validatePassword(password: string): { ok: boolean; message: string } {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, message: `密码至少${MIN_PASSWORD_LENGTH}位` }
  }
  if (!/[A-Z]/.test(password)) {
    return { ok: false, message: "密码必须包含至少一个大写字母" }
  }
  if (!/[a-z]/.test(password)) {
    return { ok: false, message: "密码必须包含至少一个小写字母" }
  }
  if (!/[0-9]/.test(password)) {
    return { ok: false, message: "密码必须包含至少一个数字" }
  }
  return { ok: true, message: "" }
}

/**
 * 检查密码是否为弱密码（旧规则允许但新规则不达标）
 */
export function isWeakPassword(password: string): boolean {
  return !validatePassword(password).ok
}
