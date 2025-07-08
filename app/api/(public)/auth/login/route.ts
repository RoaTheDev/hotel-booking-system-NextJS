import {NextRequest, NextResponse} from "next/server";
import {LoginFormData, LoginFormSchema} from "@/lib/types/authTypes";
import {prismaClient as prisma} from "@/lib/prismaClient";
import {generateToken, verifyPassword} from "@/lib/jwt";
import {HttpStatusCode} from "axios";
import {ZodError} from "zod";

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
                passwordHash: true
            }
        })

        if (!userData) {
            return NextResponse.json({
                message: "user does not exist",
            }, {status: HttpStatusCode.NotFound})
        }

        const {passwordHash, ...user} = userData
        const isValidPassword = await verifyPassword(validatedData.password, passwordHash)

        if (!isValidPassword) {
            return NextResponse.json({
                    message: "Invalid credentials",
                },
                {status: HttpStatusCode.Unauthorized})
        }
        const token = generateToken({userId: user.id, role: user.role, email: user.email})

        const response = NextResponse.json({
            message: "Login successfully",
            data: {token, user},
        })
        response.cookies.set("kronii_hotel", token, {
            httpOnly: true,
            path: "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30
        })

        return response

    } catch (err) {
        if (err instanceof ZodError) {
            return NextResponse.json({
                message: "Invalid input",
                details: err.errors
            }, {status: HttpStatusCode.BadRequest})
        }
        return NextResponse.json(
            {error: 'Internal server error'},
            {status: 500}
        );
    }
}