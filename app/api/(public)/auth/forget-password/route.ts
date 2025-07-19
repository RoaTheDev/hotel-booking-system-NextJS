import {NextRequest, NextResponse} from "next/server";
import {ForgetPassword, ForgetPasswordResponse} from "@/lib/types/authTypes";
import {prismaClient} from "@/lib/prismaClient";
import {HttpStatusCode} from "axios";
import {v4} from "uuid";
import {generateOTP} from "@/lib/otpGenerator";
import {ApiErrorResponse, ApiResponse} from "@/lib/types/commonTypes";

export const POST = async (request: NextRequest) => {

    const body: ForgetPassword = await request.json()

    const user = await prismaClient.user.findUnique({
        where: {email: body.email},
        select: {
            id: true,
        }
    })

    if (!user) {
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            success: false,
            data: null,
            message: "User does not exist"
        }, {status: HttpStatusCode.NotFound})
    }
    const OTP = generateOTP()
    const sessionId = v4()
    await prismaClient.oTP.create({
        data: {
            otpCode: OTP,
            userId: user.id,
            sessionId
        }
    })

    return NextResponse.json<ApiResponse<ForgetPasswordResponse>>({
        message: "OTP code send successfully.",
        success: true,
        data: {sessionId}
    }, {status: HttpStatusCode.Ok})
}
