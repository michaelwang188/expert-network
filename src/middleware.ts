import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 检查pathname是否包含大写字母
  const lowerPath = pathname.toLowerCase()
  if (pathname !== lowerPath) {
    // 重定向到小写版本，保留search params
    const url = request.nextUrl.clone()
    url.pathname = lowerPath
    return NextResponse.redirect(url, 301)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // 排除静态资源、API、_next等内部路径
    "/((?!api|_next|static|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
}
