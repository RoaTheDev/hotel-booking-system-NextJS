import {NextRequest, NextResponse} from "next/server";
import {authMiddleware} from "@/lib/middleware/authMiddleware";

const requestCache = new Map<string, { count: number; timestamp: number }>();

const RATE_LIMIT = 50; // Max 50 requests per minute
const WINDOW_TIME = 60 * 1000; // 1-minute window in milliseconds

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
            return NextResponse.json({message: 'Unable to determine IP address'}, {status: 500});
        }

        const currentTime = Date.now();
        const windowStart = currentTime - WINDOW_TIME;

        if (requestCache.has(ip)) {
            const data = requestCache.get(ip);

            // Check if the IP is within the rate limit window
            if (data && data.timestamp > windowStart) {
                if (data.count >= RATE_LIMIT) {
                    return NextResponse.json({message: 'Rate limit exceeded. Please try again later.'}, {status: 429});
                }
                data.count += 1;
            } else {
                // Reset the count if the window has passed
                requestCache.set(ip, {count: 1, timestamp: currentTime});
            }
        } else {
            // First request from this IP, initialize it
            requestCache.set(ip, {count: 1, timestamp: currentTime});
        }

        // Include remaining requests in headers
        const remainingRequests = RATE_LIMIT - (requestCache.get(ip)?.count || 0);
        const response = authMiddleware(request);

        // Add rate-limit headers
        const headers = new Headers(response.headers);
        headers.set('X-RateLimit-Remaining', String(remainingRequests));

        return new NextResponse(response.body, {
            status: response.status,
            headers,
        });
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/api/(.*)'],
};
