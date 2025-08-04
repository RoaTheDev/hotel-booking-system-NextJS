import {NextRequest, NextResponse} from "next/server";
import {prismaClient as prisma} from "@/lib/prismaClient";
import {HttpStatusCode} from "axios";
import {ApiErrorResponse, ApiResponse} from "@/lib/types/commonTypes";
import {AuthError, requireAdminAuth} from "@/lib/middleware/auth";
import {Prisma, Role} from "@/app/generated/prisma";
import UserWhereInput = Prisma.UserWhereInput;

interface UserWithBookings {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    role: string;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: {
        bookings: number;
    };
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
                where.role = {in: Object.values(Role)};
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
                    _count: {
                        select: {bookings: true},
                    },
                },
                orderBy: {createdAt: "desc"},
                skip,
                take: limit,
            }),
            prisma.user.count({where}),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json<ApiResponse<{
            users: UserWithBookings[];
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
                users: users as UserWithBookings[],
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


