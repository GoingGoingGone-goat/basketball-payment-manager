import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
    const password = process.env.APP_PASSWORD

    // If no password is set, allow access
    if (!password) {
        return NextResponse.next()
    }

    // Check for our custom auth cookie
    const authCookie = req.cookies.get('auth-token')

    if (authCookie?.value === password) {
        return NextResponse.next()
    }

    // Not authenticated -> redirect to custom login page
    const loginUrl = new URL('/login', req.url)
    return NextResponse.redirect(loginUrl)
}

export const config = {
    // Exclude /login route and static files
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
}
