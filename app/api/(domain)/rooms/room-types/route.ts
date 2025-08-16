import {NextRequest, NextResponse} from "next/server";
import {prismaClient as prisma} from "@/lib/prismaClient";
import {HttpStatusCode} from "axios";
import {ApiErrorResponse, ApiResponse} from "@/types/commonTypes";
import {RoomType} from "@/app/generated/prisma/client";
import {ZodError} from "zod";
import {validationErrorFormat} from "@/utils/zodErrorFormat";
import {AuthError, requireAdminAuth} from "@/middleware/auth";
import {CreateRoomTypeData, RoomTypeSchema} from "@/types/roomTypes";

export const GET = async (req: NextRequest) => {
    try {
        const {searchParams} = new URL(req.url);
        const includeDeleted = searchParams.get("includeDeleted") === "true";

        const where = includeDeleted ? {} : {isDeleted: false};

        const roomTypes = await prisma.roomType.findMany({
            where,
            include: {
                rooms: {
                    where: {isDeleted: false},
                    select: {id: true, isActive: true}
                },
                _count: {
                    select: {rooms: true}
                }
            },
            orderBy: {createdAt: "desc"}
        });

        return NextResponse.json<ApiResponse<{
            roomTypes: (RoomType & {
                rooms: { id: number; isActive: boolean }[];
                _count: { rooms: number };
            })[];
        }>>({
            success: true,
            message: "Room types retrieved successfully",
            data: {roomTypes},
        });

    } catch (err) {
        console.error("Error fetching room types:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: {type: "ServerError"},
            data: null,
            success: false,
            message: "Error fetching room types",
        }, {status: HttpStatusCode.InternalServerError});
    }
};

export const POST = async (req: NextRequest) => {
    try {
        requireAdminAuth(req);

        const body: CreateRoomTypeData = await req.json();
        const validatedData = RoomTypeSchema.parse(body);

        const existingRoomType = await prisma.roomType.findFirst({
            where: {
                name: validatedData.name,
                isDeleted: false
            }
        });

        if (existingRoomType) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Room type name already exists",
                data: null,
                errors: {type: "ValidationError"},
            }, {status: HttpStatusCode.BadRequest});
        }

        const newRoomType = await prisma.roomType.create({
            data: validatedData,
            include: {
                rooms: {
                    where: {isDeleted: false},
                    select: {id: true, isActive: true}
                },
                _count: {
                    select: {rooms: true}
                }
            }
        });

        return NextResponse.json<ApiResponse<RoomType & {
            rooms: { id: number; isActive: boolean }[];
            _count: { rooms: number };
        }>>({
            success: true,
            message: "Room type created successfully",
            data: newRoomType,
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

        if (err instanceof ZodError) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid input data",
                data: null,
                errors: validationErrorFormat(err),
            }, {status: HttpStatusCode.BadRequest});
        }

        console.error("Error creating room type:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: {type: "ServerError"},
            data: null,
            success: false,
            message: "Error creating room type",
        }, {status: HttpStatusCode.InternalServerError});
    }
};
