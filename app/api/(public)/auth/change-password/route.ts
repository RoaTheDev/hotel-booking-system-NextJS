import {prismaClient} from "@/lib/prismaClient";
import {ApiErrorResponse, ApiResponse} from "@/types/commonTypes";
import {getTokenFromCookie, verifyToken} from "@/utils/jwt";
import {HttpStatusCode} from "axios";
import {NextRequest, NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {passwordChangeSchema} from "@/types/authTypes";

export const PATCH = async (request: NextRequest) => {
    try {
        const token = getTokenFromCookie(request);
        if (!token) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                data: null,
                message: "No authentication token provided",
                errors: {type: "AuthError"},
            }, {status: HttpStatusCode.Unauthorized});
        }

        const payload = verifyToken(token);
        if (!payload || !payload.userId) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                data: null,
                message: "Invalid or expired token",
                errors: {type: "JwtError"},
            }, {status: HttpStatusCode.Unauthorized});
        }

        // Parse and validate request body
        const body = await request.json();
        const parsedData = passwordChangeSchema.safeParse(body);

        if (!parsedData.success) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                data: null,
                message: "Invalid input data",
                errors: {
                    type: "ValidationError",
                },
            }, {status: HttpStatusCode.BadRequest});
        }

        const {currentPassword, newPassword} = parsedData.data;

        // Get current user with password
        const user = await prismaClient.user.findUnique({
            where: {id: payload.userId},
            select: {
                id: true,
                passwordHash: true,
                email: true
            }
        });

        if (!user) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                data: null,
                message: "User not found",
                errors: {type: "NotFoundError"},
            }, {status: HttpStatusCode.NotFound});
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isCurrentPasswordValid) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                data: null,
                message: "Current password is incorrect",
                errors: {type: "AuthError"},
            }, {status: HttpStatusCode.BadRequest});
        }

        // Check if new password is different from current password
        const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
        if (isSamePassword) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                data: null,
                message: "New password must be different from current password",
                errors: {type: "ValidationError"},
            }, {status: HttpStatusCode.BadRequest});
        }

        // Hash new password
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        await prismaClient.user.update({
            where: {id: payload.userId},
            data: {passwordHash: hashedNewPassword}
        });

        return NextResponse.json<ApiResponse<null>>({
            success: true,
            message: "Password updated successfully",
            data: null,
        }, {status: HttpStatusCode.Ok});

    } catch (error) {
        console.error("Password change error:", error);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            success: false,
            data: null,
            message: "Failed to update password",
            errors: {type: "ServerError"},
        }, {status: HttpStatusCode.InternalServerError});
    }
};