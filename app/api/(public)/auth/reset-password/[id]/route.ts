import {NextRequest, NextResponse} from "next/server";
import {ResetPassword} from "@/lib/types/authTypes";
import {prismaClient} from "@/lib/prismaClient";
import {HttpStatusCode} from "axios";
import {hashPassword} from "@/lib/jwt";
import {ApiErrorResponse, ApiResponse} from "@/lib/types/commonTypes";

export const POST = async (request: NextRequest, {params}: { params: { id: string } }) => {

    const body: ResetPassword = await request.json();
    if (!params.id) {
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            success: false, data: null, errors: {
                type: "NotFound"
            },
            message: "The resource does not exist"
        }, {status: HttpStatusCode.NotFound})
    }
    const otpData = await prismaClient.oTP.findUnique(
        {
            where: {sessionId: params.id, otpCode: body.otp},
            select: {userId: true}
        },
    )

    if (!otpData) {
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            success: false,
            data: null,
            errors: {
                type: "NotMatch"
            },
            message: "otp does not match"}, {status: HttpStatusCode.NotFound}
        )
    }

    await prismaClient.user.update({
        where: {id: otpData.userId},
        data: {passwordHash: await hashPassword(body.newPassword)}
    })

    return NextResponse.json({
        message: "password update successfully"
    }, {status: HttpStatusCode.Ok})

}