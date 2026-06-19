import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Nav from "@/components/Nav"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import SessionProvider from "@/components/SessionProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "产研通 ProLink · 产业专家对接平台",
  description: "合规优先的产业专家调研对接平台",
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
        <SessionProvider session={session}>
          <Nav />
          <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px" }}>
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  )
}
