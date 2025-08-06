import {NextRequest, NextResponse} from "next/server";
import {prismaClient as prisma} from "@/lib/prismaClient";
import {HttpStatusCode} from "axios";
import {ApiErrorResponse, ApiResponse} from "@/lib/types/commonTypes";
import {AuthError, requireAdminAuth} from "@/lib/middleware/auth";
import {Prisma, Role} from "@/app/generated/prisma";
import bcrypt from "bcryptjs";
import {z} from "zod";
interface UpdateUserRequest {
    email?: string;
    passwordHash?: string;
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    role?: Role;
    isDeleted?: boolean;
}
const updateUserSchema = z.object({
    email: z.string().email("Invalid email format").max(255, "Email too long").optional(),
    password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password too long").optional(),
    firstName: z.string().min(1, "First name is required").max(100, "First name too long").optional(),
    lastName: z.string().min(1, "Last name is required").max(100, "Last name too long").optional(),
    phone: z.string().max(20, "Phone number too long").nullable().optional(),
    role: z.enum([Role.STAFF, Role.ADMIN], {
        errorMap: () => ({message: "Role must be STAFF or ADMIN"})
    }).optional(),
    isDeleted: z.boolean().optional()
});

interface UpdateUserRequest {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    role?: Role;
    isDeleted?: boolean;
}

interface UpdatedUser {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    role: Role;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export const PUT = async (req: NextRequest, {params}: { params: { id: string } }) => {
    try {
        requireAdminAuth(req);

        const userId = parseInt(params.id);

        if (isNaN(userId) || userId <= 0) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid user ID",
                data: null,
                errors: {type: "ValidationError"},
            }, {status: HttpStatusCode.BadRequest});
        }

        const body: UpdateUserRequest = await req.json();

        const validationResult = updateUserSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Validation failed",
                data: null,
                errors: {
                    type: "ValidationError"
                },
            }, {status: HttpStatusCode.BadRequest});
        }

        const updateData = validationResult.data;

        const existingUser = await prisma.user.findUnique({
            where: {id: userId},
            select: {
                id: true,
                email: true,
                role: true,
                isDeleted: true
            }
        });

        if (!existingUser) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "User not found",
                data: null,
                errors: {type: "NotFoundError"},
            }, {status: HttpStatusCode.NotFound});
        }

        if (existingUser.role === Role.GUEST) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Cannot update guest users through this endpoint",
                data: null,
                errors: {type: "ForbiddenError"},
            }, {status: HttpStatusCode.Forbidden});
        }

        if (updateData.email && updateData.email !== existingUser.email) {
            const emailConflict = await prisma.user.findUnique({
                where: {email: updateData.email},
                select: {id: true, isDeleted: true}
            });

            if (emailConflict && !emailConflict.isDeleted && emailConflict.id !== userId) {
                return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                    success: false,
                    message: "User with this email already exists",
                    data: null,
                    errors: {type: "ConflictError"},
                }, {status: HttpStatusCode.Conflict});
            }
        }

        const dataToUpdate: UpdateUserRequest = {...updateData};

        if (updateData.password) {
            const saltRounds = 12;
            dataToUpdate.passwordHash = await bcrypt.hash(updateData.password, saltRounds);
            delete dataToUpdate.password;
        }

        const updatedUser = await prisma.user.update({
            where: {id: userId},
            data: dataToUpdate,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                isDeleted: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        return NextResponse.json<ApiResponse<UpdatedUser>>({
            success: true,
            message: "User updated successfully",
            data: updatedUser as UpdatedUser,
        });

    } catch (err) {
        if (err instanceof AuthError) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: err.message,
                data: null,
                errors: {type: "AuthError"},
            }, {status: err.statusCode});
        }

        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === 'P2002') {
                return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                    success: false,
                    message: "User with this email already exists",
                    data: null,
                    errors: {type: "ConflictError"},
                }, {status: HttpStatusCode.Conflict});
            }
            if (err.code === 'P2025') {
                return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                    success: false,
                    message: "User not found",
                    data: null,
                    errors: {type: "NotFoundError"},
                }, {status: HttpStatusCode.NotFound});
            }
        }

        console.error("Error updating user:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: {type: "ServerError"},
            data: null,
            success: false,
            message: "Error updating user",
        }, {status: HttpStatusCode.InternalServerError});
    }
};

export const PATCH = async (req: NextRequest, {params}: { params: { id: string } }) => {
    return PUT(req, {params});
};