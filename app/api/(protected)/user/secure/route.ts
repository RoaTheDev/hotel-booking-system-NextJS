import {NextRequest, NextResponse} from "next/server";
import {prismaClient as prisma} from "@/lib/prismaClient";
import {HttpStatusCode} from "axios";
import {ApiErrorResponse, ApiResponse} from "@/types/commonTypes";
import {AuthError, requireAdminAuth} from "@/middleware/auth";
import {Prisma, Role} from "@/app/generated/prisma";
import bcrypt from "bcryptjs";
import {z} from "zod";
import UserWhereInput = Prisma.UserWhereInput;

interface UserInternal {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    role: string;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;

}

export const GET = async (req: NextRequest) => {
    try {
        requireAdminAuth(req);
        const {searchParams} = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const search = searchParams.get("search") || "";
        const role = searchParams.get("role") || "";
        const includeDeleted = searchParams.get("includeDeleted") === "true";

        const skip = (page - 1) * limit;

        const where: UserWhereInput = {};

        if (!includeDeleted) {
            where.isDeleted = false;
        }
        where.role = {in: [Role.ADMIN, Role.STAFF]};

        if (search) {
            where.OR = [
                {firstName: {contains: search, mode: "insensitive"}},
                {lastName: {contains: search, mode: "insensitive"}},
                {email: {contains: search, mode: "insensitive"}},
            ];
        }

        if (role && role !== "ALL") {
            if (Object.values(Role).includes(role as Role)) {
                where.role = role as Role;
            } else {
                where.role = {in: [Role.ADMIN, Role.STAFF]};
            }
        }

        const [users, totalCount] = await Promise.all([
            prisma.user.findMany({
                where,
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

                },
                orderBy: {createdAt: "desc"},
                skip,
                take: limit,
            }),
            prisma.user.count({where}),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json<ApiResponse<{
            users: UserInternal[];
            pagination: {
                page: number;
                limit: number;
                totalCount: number;
                totalPages: number;
            };
        }>>({
            success: true,
            message: "Users retrieved successfully",
            data: {
                users: users as UserInternal[],
                pagination: {
                    page,
                    limit,
                    totalCount,
                    totalPages,
                },
            },
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

        console.error("Error fetching users:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: {type: "ServerError"},
            data: null,
            success: false,
            message: "Error fetching users",
        }, {status: HttpStatusCode.InternalServerError});
    }
}


const createUserSchema = z.object({
    email: z.string().email("Invalid email format").max(255, "Email too long"),
    password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password too long"),
    firstName: z.string().min(1, "First name is required").max(100, "First name too long"),
    lastName: z.string().min(1, "Last name is required").max(100, "Last name too long"),
    phone: z.string().max(20, "Phone number too long").optional().nullable(),
    role: z.enum([Role.STAFF, Role.ADMIN], {
        errorMap: () => ({message: "Role must be STAFF or ADMIN"})
    })
});

interface CreateUserRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    role: Role;
}

interface CreatedUser {
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

export const POST = async (req: NextRequest) => {
    try {
        requireAdminAuth(req);

        const body: CreateUserRequest = await req.json();

        const validationResult = createUserSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Validation failed",
                data: null,
                errors: {
                    type: "ValidationError",
                },
            }, {status: HttpStatusCode.BadRequest});
        }

        const {email, password, firstName, lastName, phone, role} = validationResult.data;

        const existingUser = await prisma.user.findUnique({
            where: {email},
            select: {id: true, isDeleted: true}
        });

        if (existingUser && !existingUser.isDeleted) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "User with this email already exists",
                data: null,
                errors: {type: "ConflictError"},
            }, {status: HttpStatusCode.Conflict});
        }

        // Hash the password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create the user
        const newUser = await prisma.user.create({
            data: {
                email,
                passwordHash,
                firstName,
                lastName,
                phone,
                role,
                isDeleted: false,
            },
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

        return NextResponse.json<ApiResponse<CreatedUser>>({
            success: true,
            message: "User created successfully",
            data: newUser as CreatedUser,
        }, {status: HttpStatusCode.Created});

    } catch (err) {
        if (err instanceof AuthError) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: err.message,
                data: null,
                errors: {type: "AuthError"},
            }, {status: err.statusCode});
        }

        // Handle Prisma unique constraint violation
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === 'P2002') {
                return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                    success: false,
                    message: "User with this email already exists",
                    data: null,
                    errors: {type: "ConflictError"},
                }, {status: HttpStatusCode.Conflict});
            }
        }

        console.error("Error creating user:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: {type: "ServerError"},
            data: null,
            success: false,
            message: "Error creating user",
        }, {status: HttpStatusCode.InternalServerError});
    }
};
