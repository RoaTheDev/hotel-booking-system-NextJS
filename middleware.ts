import { NextRequest, NextResponse } from "next/server";

const requestCache = new Map<string, { count: number; timestamp: number }>();

const RATE_LIMIT = 50;
const WINDOW_TIME = 60 * 1000;

const protectedRoutes = [
    '/api/profile',
    '/api/admin',
    '/api/secure',
    '/api/auth/logout',
];

export function middleware(request: NextRequest) {
    const isProtected = protectedRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
    );

    if (isProtected) {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '';

        if (!ip) {
            return NextResponse.json({ message: 'Unable to determine IP address' }, { status: 500 });
        }

        const currentTime = Date.now();
        const windowStart = currentTime - WINDOW_TIME;

        const data = requestCache.get(ip);

        if (data && data.timestamp > windowStart) {
            if (data.count >= RATE_LIMIT) {
                return NextResponse.json({ message: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
            }
            data.count += 1;
        } else {
            requestCache.set(ip, { count: 1, timestamp: currentTime });
        }

        const remainingRequests = RATE_LIMIT - (requestCache.get(ip)?.count || 0);

        const response = NextResponse.next();
        response.headers.set('X-RateLimit-Remaining', String(remainingRequests));
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/api/(.*)'],
};
