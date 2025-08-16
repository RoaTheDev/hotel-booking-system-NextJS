import {NextRequest, NextResponse} from "next/server";
import {ServerSignupFromData, ServerSignupSchema, SignupResponse} from "@/types/authTypes";
import {prismaClient as prisma} from "@/lib/prismaClient";
import {HttpStatusCode} from "axios";
import {generateToken, hashPassword} from "@/utils/jwt";
import {ValidationError} from "@/types/error";
import {ZodError} from "zod";
import {ApiErrorResponse, ApiResponse} from "@/types/commonTypes";
import {validationErrorFormat} from "@/utils/zodErrorFormat";

export const POST = async (req: NextRequest) => {

    try {
        const body: ServerSignupFromData = await req.json()

        const validatedData = await ServerSignupSchema.parseAsync(body)
        const existingUser = await prisma.user.findUnique({
            where: {email: validatedData.email},
        })
        if (existingUser) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                errors: {type: "Conflict"},
                data: null,
                success: false,
                message: "User already exists"
            }, {status: HttpStatusCode.Conflict})

        }

        const passwordHashed = await hashPassword(body.password)
        const user = await prisma.user.create({
                data: {
                    email: validatedData.email,
                    passwordHash: passwordHashed,
                    firstName: validatedData.firstName,
                    lastName: validatedData.lastName,
                },
                select: {
                    id: true,
                    role: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phone: true
                }
            }
        )

        const token = generateToken({
            email: user.email,
            userId: user.id,
            role: user.role
        })
        return NextResponse.json<ApiResponse<SignupResponse>>({
            message: "user signed successfully",
            data: {
                user: user,
                token
            },
            success: true
        }, {status: HttpStatusCode.Created})


    } catch (error) {
        if (error instanceof ValidationError) {
        }
        if (error instanceof ZodError) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                message: "Invalid input data"
                , errors: validationErrorFormat(error),
                data: null,
                success: false
            }, {status: HttpStatusCode.BadRequest})

        }
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            message: 'Internal server error',
            data: null,
            success: false,
            errors: {
                type: "ServerError"
            }
        }, {status: HttpStatusCode.InternalServerError})


    }
}