import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Nav from "@/components/Nav"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import SessionProvider from "@/components/SessionProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "产研通 ProLink · 产业专家对接平台",
    template: "%s · 产研通 ProLink",
  },
  description: "产业专家调研对接平台 — 连接研究员与产业链专家。覆盖 AI 算力 / 新能源 / 半导体 / 创新药 / 消费电子，合规管控 + 积分结算。",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "产研通 ProLink · 产业专家对接平台",
    description: "连接研究员与产业链专家，让每一次调研都有价值。覆盖 AI 算力·新能源·半导体·创新药·消费电子，合规管控 + 积分结算。",
    url: "https://516380.com",
    siteName: "产研通 ProLink",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "产研通 ProLink · 产业专家对接平台",
    description: "连接研究员与产业链专家，让每一次调研都有价值。",
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <link rel="preconnect" href="https://516380.com" />
        <link rel="dns-prefetch" href="https://516380.com" />
        <SessionProvider session={session}>
          <Nav />
          <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px" }}>
            {children}
          </main>
          <footer style={{ textAlign: "center", padding: "24px 20px", fontSize: 12, color: "#888", borderTop: "0.5px solid #e0dfd8", marginTop: 40 }}>
            <span>产研通 ProLink · 合规优先的产业专家调研对接平台</span>
            <span style={{ margin: "0 8px" }}>·</span>
            <span>© 2024-{new Date().getFullYear()}</span>
            <span style={{ margin: "0 8px" }}>·</span>
            <a href="https://516380.com" style={{ color: "#185FA5", textDecoration: "none" }}>516380.com</a>
          </footer>
        </SessionProvider>
      </body>
    </html>
  )
}
