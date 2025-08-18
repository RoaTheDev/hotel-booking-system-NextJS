import {NextRequest, NextResponse} from "next/server";
import {AuthError, requireAdminAuth} from "@/middleware/auth";
import {prismaClient as prisma} from "@/lib/prismaClient";
import {ApiErrorResponse, ApiResponse} from "@/types/commonTypes";
import {HttpStatusCode} from "axios";
import {ZodError, z} from "zod";
import {validationErrorFormat} from "@/utils/zodErrorFormat";

const UpdateRoomTypeSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters").optional(),
    description: z.string().optional(),
    basePrice: z.number().positive("Base price must be positive").optional(),
    maxGuests: z.number().int().positive("Max guests must be a positive integer").optional(),
    imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

interface RoomTypeWithDetails {
    id: number;
    name: string;
    description: string | null;
    basePrice: number;
    maxGuests: number;
    imageUrl: string | null;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count?: {
        rooms: number;
    };
}

export const GET = async (req: NextRequest, {params}: {params: {id: string}}) => {
    try {
        requireAdminAuth(req);

        const roomTypeId = parseInt(params.id);
        if (isNaN(roomTypeId)) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid room type ID",
                data: null,
                errors: {type: "ValidationError"},
            }, {status: HttpStatusCode.BadRequest});
        }

        const roomType = await prisma.roomType.findUnique({
            where: {
                id: roomTypeId,
                isDeleted: false,
            },
            include: {
                _count: {
                    select: {rooms: true},
                },
                rooms: {
                    where: {isDeleted: false},
                    select: {
                        id: true,
                        roomNumber: true,
                        isActive: true,
                    },
                },
            },
        });

        if (!roomType) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Room type not found",
                data: null,
                errors: {type: "NotFound"},
            }, {status: HttpStatusCode.NotFound});
        }

        const formattedRoomType = {
            ...roomType,
            basePrice: roomType.basePrice.toNumber(),
        };

        return NextResponse.json<ApiResponse<typeof formattedRoomType>>({
            success: true,
            message: "Room type retrieved successfully",
            data: formattedRoomType,
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

        console.error("Error fetching room type:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: {type: "ServerError"},
            data: null,
            success: false,
            message: "Error fetching room type",
        }, {status: HttpStatusCode.InternalServerError});
    }
};

export const PUT = async (req: NextRequest, {params}: {params: {id: string}}) => {
    try {
        requireAdminAuth(req);

        const roomTypeId = parseInt(params.id);
        if (isNaN(roomTypeId)) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid room type ID",
                data: null,
                errors: {type: "ValidationError"},
            }, {status: HttpStatusCode.BadRequest});
        }

        const body = await req.json();
        const validatedData = UpdateRoomTypeSchema.parse(body);

        // Check if room type exists
        const existingRoomType = await prisma.roomType.findUnique({
            where: {
                id: roomTypeId,
                isDeleted: false,
            },
        });

        if (!existingRoomType) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Room type not found",
                data: null,
                errors: {type: "NotFound"},
            }, {status: HttpStatusCode.NotFound});
        }

        // Check if new name conflicts with existing room type (if name is being changed)
        if (validatedData.name && validatedData.name !== existingRoomType.name) {
            const nameConflict = await prisma.roomType.findUnique({
                where: {name: validatedData.name},
            });

            if (nameConflict && nameConflict.id !== roomTypeId && !nameConflict.isDeleted) {
                return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                    success: false,
                    message: "Room type name already exists",
                    data: null,
                    errors: {type: "ValidationError"},
                }, {status: HttpStatusCode.Conflict});
            }
        }

        const updatedRoomType = await prisma.roomType.update({
            where: {id: roomTypeId},
            data: {
                ...validatedData,
                imageUrl: validatedData.imageUrl === "" ? null : validatedData.imageUrl,
                updatedAt: new Date(),
            },
            include: {
                _count: {
                    select: {rooms: true},
                },
            },
        });

        const formattedRoomType: RoomTypeWithDetails = {
            ...updatedRoomType,
            basePrice: Number(updatedRoomType.basePrice),
        };

        return NextResponse.json<ApiResponse<RoomTypeWithDetails>>({
            success: true,
            message: "Room type updated successfully",
            data: formattedRoomType,
        });

    } catch (err) {
        if (err instanceof ZodError) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid input data",
                data: null,
                errors: validationErrorFormat(err),
            }, {status: HttpStatusCode.BadRequest});
        }

        if (err instanceof AuthError) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: err.message,
                data: null,
                errors: {type: "AuthError"},
            }, {status: err.statusCode});
        }

        console.error("Error updating room type:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: {type: "ServerError"},
            data: null,
            success: false,
            message: "Error updating room type",
        }, {status: HttpStatusCode.InternalServerError});
    }
};

export const DELETE = async (req: NextRequest, {params}: {params: {id: string}}) => {
    try {
        requireAdminAuth(req);

        const roomTypeId = parseInt(params.id);
        if (isNaN(roomTypeId)) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid room type ID",
                data: null,
                errors: {type: "ValidationError"},
            }, {status: HttpStatusCode.BadRequest});
        }

        // Check if room type exists
        const existingRoomType = await prisma.roomType.findUnique({
            where: {
                id: roomTypeId,
                isDeleted: false,
            },
            include: {
                _count: {
                    select: {rooms: true},
                },
            },
        });

        if (!existingRoomType) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Room type not found",
                data: null,
                errors: {type: "NotFound"},
            }, {status: HttpStatusCode.NotFound});
        }

        // Check if room type has active rooms
        if (existingRoomType._count.rooms > 0) {
            const activeRooms = await prisma.room.count({
                where: {
                    roomTypeId: roomTypeId,
                    isDeleted: false,
                },
            });

            if (activeRooms > 0) {
                return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                    success: false,
                    message: `Cannot delete room type. ${activeRooms} room(s) are still using this type.`,
                    data: null,
                    errors: {type: "ValidationError"},
                }, {status: HttpStatusCode.BadRequest});
            }
        }

        // Soft delete the room type
        await prisma.roomType.update({
            where: {id: roomTypeId},
            data: {
                isDeleted: true,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json<ApiResponse<null>>({
            success: true,
            message: "Room type deleted successfully",
            data: null,
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

        console.error("Error deleting room type:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: {type: "ServerError"},
            data: null,
            success: false,
            message: "Error deleting room type",
        }, {status: HttpStatusCode.InternalServerError});
    }
};