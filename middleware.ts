import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname

  // Check if the path is for the admin panel
  if (path.startsWith("/admin")) {
    // Get the auth token from cookies - check both admin_token and auth_token
    const adminToken = request.cookies.get("admin_token")?.value
    const authToken = request.cookies.get("auth_token")?.value
    
    const hasValidToken = adminToken || authToken

    // If there's no token, redirect to login
    if (!hasValidToken) {
      console.log(`No valid token found for admin path: ${path}. Redirecting to login.`)
      return NextResponse.redirect(new URL("/login", request.url))
    }
    
    // Allow the request to proceed
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
