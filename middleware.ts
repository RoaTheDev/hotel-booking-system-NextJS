import {NextRequest, NextResponse} from "next/server";
import {authMiddleware} from "@/lib/authMiddleware";

export function middleware(request : NextRequest) {

    if(request.nextUrl.pathname.startsWith('/api/protected')){
            return authMiddleware(request)
    }
    return NextResponse.next()
}

export const config  = {
    matcher: ['/api/protected/(.*)'],
}