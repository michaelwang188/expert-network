import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// 登录限速: 同IP 15秒内最多5次尝试
const loginRateLimit = new Map<string, { count: number; reset: number }>()
setInterval(() => { const now = Date.now(); for (const [ip, e] of loginRateLimit) { if (now >= e.reset) loginRateLimit.delete(ip) } }, 60000)

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
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
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
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
