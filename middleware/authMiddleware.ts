import {NextRequest, NextResponse} from "next/server";
import {getTokenFromCookie} from "@/utils/jwt";
import {HttpStatusCode} from "axios";

export const authMiddleware = (request: NextRequest) => {
    const token = getTokenFromCookie(request);
    if (!token) {
        return NextResponse.json(
            {error: "Authentication token required"},
            {status: HttpStatusCode.Unauthorized}
        );
    }
    return NextResponse.next()
}