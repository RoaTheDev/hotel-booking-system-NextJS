import {getTokenFromCookie, verifyToken} from "@/utils/jwt";
import {NextRequest, NextResponse} from "next/server";
import {HttpStatusCode} from "axios";
import {prismaClient} from "@/lib/prismaClient";
import {ApiErrorResponse, ApiResponse} from "@/types/commonTypes";
import {profileSchema, UserType} from "@/types/authTypes";

export const GET = async (request: NextRequest) => {
    try {

        const token = getTokenFromCookie(request)

        if (!token) {
            return NextResponse.json(
                {message: "You are not authorized or expired session"}
                , {status: HttpStatusCode.Unauthorized})
        }
        const payload = verifyToken(token)

        const user = await prismaClient.user.findUnique({
            where: {id: payload.userId},
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
            }
        })

        if (!user) {
            return NextResponse.json({
                message: "user does not exist"
            }, {status: HttpStatusCode.NotFound})
        }

        return NextResponse.json(user,
            {status: HttpStatusCode.Ok})

    } catch {
        return NextResponse.json(
            {error: 'Internal server error'},
            {status: 500}
        );
    }
}

export const PUT = async (request: NextRequest) => {
    try {
        const token = getTokenFromCookie(request);
        if (!token) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                data: null,
                message: "No authentication token provided",
                errors: { type: "AuthError" },
            }, { status: HttpStatusCode.Unauthorized });
        }

        const payload = verifyToken(token);
        if (!payload || !payload.userId) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                data: null,
                message: "Invalid or expired token",
                errors: { type: "JwtError" },
            }, { status: HttpStatusCode.Unauthorized });
        }

        const body = await request.json();
        const parsedData = profileSchema.safeParse(body);
        if (!parsedData.success) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                data: null,
                message: "Invalid input data",
                errors: { type: "ValidationError" },
            }, { status: HttpStatusCode.BadRequest });
        }

        const { firstName, lastName, email, phone } = parsedData.data;

        const existingUser = await prismaClient.user.findFirst({
            where: {
                email,
                id: { not: payload.userId },
            },
        });
        if (existingUser) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                data: null,
                message: "Email is already in use",
                errors: { type: "ConflictError" },
            }, { status: HttpStatusCode.Conflict });
        }

        const updatedUser = await prismaClient.user.update({
            where: { id: payload.userId },
            data: {
                firstName,
                lastName,
                email,
                phone,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                role: true,
            },
        });

        return NextResponse.json<ApiResponse<UserType>>({
            success: true,
            message: "Profile updated successfully",
            data: updatedUser,
        }, { status: HttpStatusCode.Ok });

    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            success: false,
            data: null,
            message: "Failed to update profile",
            errors: { type: "ServerError" },
        }, { status: HttpStatusCode.InternalServerError });
    }
};