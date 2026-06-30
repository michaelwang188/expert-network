// 邮件发送工具
// 生产/测试环境：使用SMTP发送真实邮件
// 无SMTP配置时退化为console.log日志输出

import nodemailer from "nodemailer"
import fs from "fs"
import path from "path"

// 手动从.env加载环境变量（不依赖process.env / PM2环境传递）
function loadSMTPConfig() {
  try {
    const envPath = path.resolve(process.cwd(), ".env")
    const content = fs.readFileSync(envPath, "utf-8")
    const vars: Record<string, string> = {}
    for (const line of content.split("\n")) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const eqIdx = trimmed.indexOf("=")
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      let val = trimmed.slice(eqIdx + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      vars[key] = val
    }
    return {
      host: vars.SMTP_HOST || process.env.SMTP_HOST || "",
      port: parseInt(vars.SMTP_PORT || process.env.SMTP_PORT || "465"),
      user: vars.SMTP_USER || process.env.SMTP_USER || "",
      pass: vars.SMTP_PASS || process.env.SMTP_PASS || "",
      from: vars.SMTP_FROM || process.env.SMTP_FROM || "noreply@prolink.com",
    }
  } catch {
    return {
      host: process.env.SMTP_HOST || "",
      port: parseInt(process.env.SMTP_PORT || "465"),
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
      from: process.env.SMTP_FROM || "noreply@prolink.com",
    }
  }
}

const smtp = loadSMTPConfig()
const isConfigured = !!(smtp.host && smtp.user && smtp.pass)

let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter
  if (!isConfigured) return null
  try {
    transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: { user: smtp.user, pass: smtp.pass },
    })
    return transporter
  } catch {
    return null
  }
}

/**
 * 发送密码重置邮件
 */
export async function sendResetEmail(to: string, resetUrl: string): Promise<boolean> {
  const t = getTransporter()
  if (!t) {
    if (process.env.NODE_ENV !== "production") console.log(`[EMAIL] 密码重置链接 (收件人: ${to}): ${resetUrl}`)
    return true
  }

  try {
    await t.sendMail({
      from: smtp.from,
      to,
      subject: "产研通ProLink · 密码重置",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #185FA5;">密码重置</h2>
          <p>您好，</p>
          <p>我们收到了您的密码重置请求。请点击下方按钮重置密码，该链接有效期1小时：</p>
          <p style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: #185FA5; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 15px;">重置密码</a>
          </p>
          <p style="font-size: 12px; color: #888; background: #FFF8E1; padding: 10px; border-radius: 6px;">
            ⚠️ 如果出现「继续访问」页面，请点击「继续访问」即可。<br/>
            如按钮无法点击，请复制以下链接到 Safari/Chrome 中打开：<br/>
            <span style="font-size: 11px; color: #185FA5; word-break: break-all;">${resetUrl}</span>
          </p>
          <p style="font-size: 12px; color: #888;">如果您没有请求重置密码，请忽略此邮件。</p>
          <hr style="border: none; border-top: 0.5px solid #e0dfd8;" />
          <p style="font-size: 11px; color: #aaa;">产研通ProLink · 产业专家对接平台</p>
        </div>
      `,
    })
    if (process.env.NODE_ENV !== "production") console.log(`[EMAIL] ✅ 已通过SMTP发送至 ${to}`)
    return true
  } catch (e) {
    if (process.env.NODE_ENV !== "production") console.error(`[EMAIL] 发送失败 (${to}):`, (e as Error).message)
    return false
  }
}

/**
 * 发送新用户欢迎注册邮件
 */
export async function sendWelcomeEmail(to: string, siteUrl: string): Promise<boolean> {
  const t = getTransporter()
  const registerUrl = `${siteUrl}/register`

  if (!t) {
    if (process.env.NODE_ENV !== "production") console.log(`[EMAIL] 欢迎注册 (收件人: ${to}): ${registerUrl}`)
    return true
  }

  try {
    await t.sendMail({
      from: smtp.from,
      to,
      subject: "欢迎来到产研通ProLink · 注册指引",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #185FA5;">👋 欢迎来到产研通</h2>
          <p>您好，</p>
          <p>您尝试使用此邮箱找回密码，但我们发现该邮箱尚未注册平台账号。</p>
          <p style="text-align: center; margin: 24px 0;">
            <a href="${registerUrl}" style="display: inline-block; background: #185FA5; color: #fff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 14px;">立即注册 →</a>
          </p>
          <div style="background: #f8f7f4; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 13px; color: #5F5E5A;">
            <p style="margin: 0 0 8px; font-weight: 500;">产研通为您提供：</p>
            <p style="margin: 0; line-height: 1.8;">✅ 10,000+ 各行业产业专家<br/>✅ 合规安全的专家访谈对接<br/>✅ 公益积分体系，降低调研成本</p>
          </div>
          <p style="font-size: 12px; color: #888;">如果您没有操作过，请忽略此邮件。</p>
          <hr style="border: none; border-top: 0.5px solid #e0dfd8;" />
          <p style="font-size: 11px; color: #aaa;">产研通ProLink · 产业专家对接平台</p>
        </div>
      `,
    })
    if (process.env.NODE_ENV !== "production") console.log(`[EMAIL] ✅ 已发送欢迎邮件至 ${to}`)
    return true
  } catch (e) {
    if (process.env.NODE_ENV !== "production") console.error(`[EMAIL] 发送欢迎邮件失败 (${to}):`, (e as Error).message)
    return false
  }
}

/**
 * 发送邮箱验证邮件
 */
export async function sendVerificationEmail(to: string, verifyUrl: string): Promise<boolean> {
  const t = getTransporter()
  if (!t) {
    if (process.env.NODE_ENV !== "production") console.log(`[EMAIL] 验证链接 (收件人: ${to}): ${verifyUrl}`)
    return true
  }

  try {
    await t.sendMail({
      from: smtp.from,
      to,
      subject: "产研通ProLink · 验证您的邮箱",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #185FA5;">验证您的邮箱</h2>
          <p>您好，</p>
          <p>感谢您注册产研通ProLink！请点击下方按钮验证您的邮箱地址：</p>
          <p style="text-align: center; margin: 24px 0;">
            <a href="${verifyUrl}" style="display: inline-block; background: #185FA5; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 15px;">验证邮箱</a>
          </p>
          <p style="font-size: 12px; color: #888; background: #FFF8E1; padding: 10px; border-radius: 6px;">
            ⚠️ 如按钮无法点击，请复制以下链接到 Safari/Chrome 中打开：<br/>
            <span style="font-size: 11px; color: #185FA5; word-break: break-all;">${verifyUrl}</span>
          </p>
          <p style="font-size: 12px; color: #888;">验证后即可登录平台。如果您没有注册产研通，请忽略此邮件。</p>
          <hr style="border: none; border-top: 0.5px solid #e0dfd8;" />
          <p style="font-size: 11px; color: #aaa;">产研通ProLink · 产业专家对接平台</p>
        </div>
      `,
    })
    if (process.env.NODE_ENV !== "production") console.log(`[EMAIL] ✅ 已验证邮件发送至 ${to}`)
    return true
  } catch (e) {
    if (process.env.NODE_ENV !== "production") console.error(`[EMAIL] 验证邮件发送失败 (${to}):`, (e as Error).message)
    return false
  }
}

export function isEmailConfigured(): boolean {
  return isConfigured
}
