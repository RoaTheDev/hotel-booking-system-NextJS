import {NextRequest, NextResponse} from "next/server";
import {LoginFormData, LoginFormSchema, LoginResponse} from "@/types/authTypes";
import {prismaClient as prisma} from "@/lib/prismaClient";
import {generateToken, verifyPassword} from "@/utils/jwt";
import {HttpStatusCode} from "axios";
import {ZodError} from "zod";
import {ApiErrorResponse, ApiResponse} from "@/types/commonTypes";
import {validationErrorFormat} from "@/utils/zodErrorFormat";

export const POST = async (req: NextRequest) => {
    try {
        const body: LoginFormData = await req.json();
        const validatedData = await LoginFormSchema.parseAsync(body);

        const userData = await prisma.user.findUnique({
            where: {email: validatedData.email},
            select: {
                email: true,
                role: true,
                id: true,
                firstName: true,
                lastName: true,
                passwordHash: true,
                phone: true
            }
        })

        if (!userData) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                    success: false,
                    errors: {
                        type: "NotFound",
                    },
                    message: "user does not exist",
                    data: null
                }
                , {status: HttpStatusCode.NotFound})
        }

        const {passwordHash, ...user} = userData
        const isValidPassword = await verifyPassword(validatedData.password, passwordHash)

        if (!isValidPassword) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                data: null,
                success: false,
                message: "invalid credential"
            }, {status: HttpStatusCode.Unauthorized})
        }
        const token = generateToken({userId: user.id, role: user.role, email: user.email})
        const redirectUrl =  user.role === 'ADMIN' ? '/admin' : '/';
        const response = NextResponse.json<ApiResponse<LoginResponse>>({
            message: "Login successfully",
            data: {token, user,redirectUrl},
            success: true
        })
        response.cookies.set("tranquility_token", token, {
            httpOnly: true,
            path: "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30
        })

        return response

    } catch (err) {
        if (err instanceof ZodError) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid input",
                data: null,
                errors: validationErrorFormat(err),
            }, {status: HttpStatusCode.BadRequest})
        }
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: {
                type: "ServerError"
            },
            data: null,
            success: false,
            message: "error from server"
        }, {status: HttpStatusCode.InternalServerError})
    }
}