import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// 登录限速: 同IP 15秒内最多5次尝试
const loginRateLimit = new Map<string, { count: number; reset: number }>()
setInterval(() => { const now = Date.now(); for (const [ip, e] of loginRateLimit) { if (now >= e.reset) loginRateLimit.delete(ip) } }, 60000)

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  cookies: { sessionToken: { name: "__Secure-next-auth.session-token", options: { httpOnly: true, sameSite: "lax", path: "/", secure: false } } },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  providers: [
    CredentialsProvider({
      name: "密码登录",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        // 登录限速: 同邮箱15秒内最多5次尝试
        const email = credentials.email.toLowerCase()
        const now = Date.now()
        const limit = loginRateLimit.get(email)
        if (limit && now < limit.reset && limit.count >= 5) {
          return null // 静默拒绝，不告知限速
        }
        const user = await prisma.user.findUnique({
          where: { email },
        })
        if (!user) {
          const entry = loginRateLimit.get(email) || { count: 0, reset: now + 15000 }
          entry.count++
          loginRateLimit.set(email, entry)
          return null
        }
        const ok = await bcrypt.compare(credentials.password, user.password)
        if (!ok) {
          const entry = loginRateLimit.get(email) || { count: 0, reset: now + 15000 }
          entry.count++
          loginRateLimit.set(email, entry)
          return null
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          updatedAt: user.updatedAt.getTime(),
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.updatedAt = (user as any).updatedAt || Date.now()
      }
      // Codex #174修复: 每次请求验证用户是否仍存在且角色未变
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { id: true, role: true, updatedAt: true },
        })
        if (!dbUser) return {} // 用户已删除，强制重新登录
        token.role = dbUser.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id as string
        ;(session.user as any).role = token.role as string
      }
      return session
    },
  },
}
