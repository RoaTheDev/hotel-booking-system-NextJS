import {NextRequest, NextResponse} from "next/server";
import {authMiddleware} from "@/lib/authMiddleware";

const protectedRoutes = [
    '/api/profile',
    '/api/admin',
    '/api/secure',
    'api/auth/logout',
];

export function middleware(request: NextRequest) {
    const isProtected = protectedRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route));

    if (isProtected) {
        return authMiddleware(request);
    }
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/api/(.*)'],

};