import {NextRequest, NextResponse} from "next/server";
import {ServerSignupFromData} from "@/lib/types/authTypes";
import {prismaClient as prisma} from "@/lib/prismaClient";
import {HttpStatusCode} from "axios";
import {generateToken, hashPassword} from "@/lib/jwt";
import {ServerSignupSchema} from "@/lib/types/authTypes";
import {ValidationError} from "@/lib/types/error";
import {ZodError} from "zod";

export const POST = async (req: NextRequest) => {

    try {
        const body: ServerSignupFromData = await req.json()

        const validatedData = await ServerSignupSchema.parseAsync(body)
        const existingUser = await prisma.user.findUnique({
            where: {email: validatedData.email},
        })
        if (existingUser) {
            return NextResponse.json({
                    message: "User already exists",
                }
                ,
                {status: HttpStatusCode.Conflict})
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
                    email: true
                }
            }
        )

        const token = generateToken({
            email: user.email,
            userId: user.id,
            role: user.role
        })
        return NextResponse.json({
            message: "user signed successfully",
            user,
            token
        }, {status: HttpStatusCode.Created})


    } catch (error) {
        if (error instanceof ValidationError) {
        }
        if (error instanceof ZodError) {
            return NextResponse.json(
                {error: 'Invalid input data', details: error.errors},
                {status: 400}
            );
        }
        return NextResponse.json(
            {error: 'Internal server error'},
            {status: 500}
        );
    }

}