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
export async function sendVerificationEmail(to: string, verifyUrl: string, role?: string): Promise<boolean> {
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
            ⚠️ 如按钮无法点击，请复制以下链接到外部浏览器中打开：<br/>
            <span style="font-size: 11px; color: #185FA5; word-break: break-all;">${verifyUrl}</span>
          </p>

          <hr style="border: none; border-top: 0.5px solid #ddd;" />

          <div style="margin: 16px 0;">
            <h3 style="color: #185FA5; font-size: 16px; margin: 0;">516380 = 我一路上帮您</h3>
          </div>

          <div style="background: #f8f7f4; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 13px; color: #5F5E5A; line-height: 1.8;">
            <p style="margin: 0 0 8px; font-weight: 500;">我们搭了一个桥：</p>
            <p style="margin: 0;">让研究员、产业专家、投资人<br/>在一个有信任基础的圈子里，<br/>长期地、可持续地互相帮助。</p>
          </div>

          <div style="background: #f8f7f4; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 13px; color: #5F5E5A; line-height: 1.8;">
            <p style="margin: 0 0 8px;"><strong>🔍 研究员</strong> → 找那个恰好知道正确答案的人，获取一手调研信息</p>
            <p style="margin: 0 0 8px;"><strong>🎯 产业专家</strong> → ${role === 'EXPERT' ? '您的产业经验是一笔可以传承的无形资产，在这里不断积累，也被尊重地、体面地流转/传承' : '您的经验是一笔可以传承的资产，在这里被尊重地、体面地流通'}</p>
            <p style="margin: 0;"><strong>📊 投资人/机构</strong> → 获取一手产业洞察，为投资决策增加关键维度</p>
          </div>

          <div style="background: #FAFAF7; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 13px; color: #5F5E5A; line-height: 1.8;">
            <p style="margin: 0 0 8px; font-weight: 500;">🏆 公益积分</p>
            <p style="margin: 0 0 8px; font-size: 12px; color: #888;"><em>公益积分 = 工作时间 × 技能等级</em></p>
            <p style="margin: 0;">公益积分后续可以在网站内进行流转，获得相应的咨询和服务；在更长远的未来，公益积分还将被允许传承给您的家人和孩子，让更多的良师益友来协助您的家族传承。</p>
          </div>

          <div style="background: #FFF8E1; border-radius: 8px; padding: 12px; margin: 16px 0; font-size: 12px; color: #8B6914; text-align: center;">
            🎁 ${role === 'EXPERT' ? '您的注册在审核确认后，将获得 <strong>800 公益积分</strong> 体验礼包，验证后即可使用' : '您将获得 <strong>500 公益积分</strong> 体验礼包，验证后即可使用'}
          </div>

          <div style="text-align: center; margin: 16px 0; font-size: 12px; color: #999; line-height: 1.6;">
            <p style="margin: 0;">连接研究员与产业专家智库 · 让每一次调研更有价值</p>
            <p style="margin: 4px 0 0;"><strong style="color: #185FA5;">516380.com</strong> 我一路上帮您</p>
          </div>

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
