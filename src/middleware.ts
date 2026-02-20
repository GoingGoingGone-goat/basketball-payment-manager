import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
    // Read the password from the environment variables
    const password = process.env.APP_PASSWORD

    // If no password is set (like in local dev if you don't want it), allow access
    if (!password) {
        return NextResponse.next()
    }

    const basicAuth = req.headers.get('authorization')

    if (basicAuth) {
        const authValue = basicAuth.split(' ')[1]
        // The browser encodes basic auth as Base64 (username:password)
        const [user, pwd] = atob(authValue).split(':')

        // We only care about the password matching
        if (pwd === password) {
            return NextResponse.next()
        }
    }

    // If not authenticated, prompt the browser's native completely secure popup
    return new NextResponse('Authentication Required', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
    })
}

// Apply this middleware to every route except static assets
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
