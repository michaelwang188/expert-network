// 邮件发送工具
// 生产环境：使用SMTP发送真实邮件
// 开发/测试环境：仅日志输出

import nodemailer from "nodemailer"

// SMTP配置（从环境变量读取）
const SMTP_HOST = process.env.SMTP_HOST || ""
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587")
const SMTP_USER = process.env.SMTP_USER || ""
const SMTP_PASS = process.env.SMTP_PASS || ""
const FROM_ADDR = process.env.SMTP_FROM || "noreply@prolink.com"

// 是否为开发/测试环境
const isDev = process.env.NODE_ENV === "development" || !SMTP_HOST

let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter
  if (!SMTP_HOST) return null
  try {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
    return transporter
  } catch {
    return null
  }
}

/**
 * 发送密码重置邮件
 * 在开发/测试环境将重置链接打印到控制台
 */
export async function sendResetEmail(to: string, resetUrl: string): Promise<boolean> {
  const t = getTransporter()
  if (!t) {
    // 无SMTP配置：日志输出（测试/开发环境）
    console.log(`[EMAIL] 密码重置链接 (收件人: ${to}): ${resetUrl}`)
    return true
  }

  try {
    await t.sendMail({
      from: FROM_ADDR,
      to,
      subject: "产研通ProLink · 密码重置",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #185FA5;">密码重置</h2>
          <p>您好，</p>
          <p>我们收到了您的密码重置请求。请点击下方链接重置密码，该链接有效期1小时：</p>
          <p style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: #185FA5; color: #fff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 14px;">重置密码</a>
          </p>
          <p style="font-size: 12px; color: #888;">如果您没有请求重置密码，请忽略此邮件。</p>
          <hr style="border: none; border-top: 0.5px solid #e0dfd8;" />
          <p style="font-size: 11px; color: #aaa;">产研通ProLink · 产业专家对接平台</p>
        </div>
      `,
    })
    return true
  } catch (e) {
    console.error(`[EMAIL] 发送失败 (${to}):`, (e as Error).message)
    return false
  }
}

/**
 * 获取测试环境下的重置链接
 * 仅在无SMTP配置时有效，通过/dev-link接口暴露给测试用户
 */
export function isEmailConfigured(): boolean {
  return !!SMTP_HOST
}
