import {NextRequest, NextResponse} from "next/server";
import {getTokenFromReq} from "@/lib/jwt";
import {HttpStatusCode} from "axios";

export const authMiddleware = (request: NextRequest) => {
    const token = getTokenFromReq(request);
    if (!token) {
        return NextResponse.json(
            {error: "Authentication token required"},
            {status: HttpStatusCode.Unauthorized}
        );
    }
    return NextResponse.next()
}