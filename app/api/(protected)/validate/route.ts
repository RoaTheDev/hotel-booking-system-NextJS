import {NextRequest, NextResponse} from "next/server";
import {getTokenFromCookie, verifyToken} from "@/lib/jwt";
import {HttpStatusCode} from "axios";

export const GET = async (request: NextRequest) => {
    try {

        const token = getTokenFromCookie(request)
        console.log(`token : ${token}`)
        if (!token) {
            return NextResponse.json(
                {message: "You are not authorized or expired session"}
                , {status: HttpStatusCode.Unauthorized})
        }
        const payload = verifyToken(token)

        if (!payload) {
            return NextResponse.json(
                {message: "You are not authorized or expired session"}
                , {status: HttpStatusCode.Unauthorized})
        }
        return NextResponse.json({message: "session's still active"},
            {status: HttpStatusCode.Ok})

    } catch {
        return NextResponse.json(
            {error: 'Internal server error'},
            {status: 500}
        );
    }
}