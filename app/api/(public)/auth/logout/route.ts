import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/commonTypes";
import { verifyToken } from "@/utils/jwt";

export const POST = async (request: NextRequest) => {
    const cookie = request.cookies.get("tranquility_token");
    let token: string | null = null;

    if (cookie) {
        token = cookie.value;
    } else {
        const authHeader = request.headers.get("authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }
    }

    if (token) {
        try {
            verifyToken(token);
        } catch {
            console.warn("Invalid or expired token during logout, proceeding anyway");
        }
    }

    const response = NextResponse.json<ApiResponse<null>>({
        success: true,
        message: "Logged out successfully",
        data: null,
    });

    if (cookie) {
        response.cookies.set("tranquility_token", "", {
            httpOnly: true,
            maxAge: 0,
            path: "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
    }

    return response;
};