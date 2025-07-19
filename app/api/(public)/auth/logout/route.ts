import {NextRequest, NextResponse} from "next/server";
import {HttpStatusCode} from "axios";
import {ApiErrorResponse, ApiResponse} from "@/lib/types/commonTypes";

export const POST = async (request: NextRequest) => {
    const cookie = request.cookies.get("kronii_hotel")
    if (!cookie) {
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            success: false,
            errors: {
                type: "AuthError"
            },
            data: null,
            message: "Your token has expired or does not exist"
        }, {status: HttpStatusCode.Unauthorized})
    }

    const response = NextResponse.json({message: "Logged out successfully"})
    response.cookies.set(cookie.name, "", {
        httpOnly: true,
        maxAge: 0,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    })
    return response
}