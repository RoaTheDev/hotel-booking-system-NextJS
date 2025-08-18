import {NextRequest, NextResponse} from "next/server";
import {prismaClient as prisma} from "@/lib/prismaClient";
import {HttpStatusCode} from "axios";
import {ApiErrorResponse, ApiResponse} from "@/types/commonTypes";
import {CreateRoomSchema, RoomWithDetails, UpdateRoomAvailabilitySchema} from "@/types/roomTypes";
import {ZodError} from "zod";
import {validationErrorFormat} from "@/utils/zodErrorFormat";
import {requireAdminAuth} from "@/middleware/auth";

interface RouteParams {
    params: { id: string };
}

export const GET = async (_: NextRequest, context: { params: Promise<{ id: string }> }) => {
    try {
        const {id} = await context.params
        const roomId = parseInt(id);

        if (isNaN(roomId)) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid room ID",
                data: null,
                errors: {type: "ValidationError"},
            }, {status: HttpStatusCode.BadRequest});
        }

        const room = await prisma.room.findFirst({
            where: {
                id: roomId,
                isDeleted: false,
                isActive: true,
            },
            include: {
                roomType: true,
                amenities: {
                    include: {
                        amenity: true,
                    },
                },
                images: true,

            },
        });

        if (!room) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Room not found",
                data: null,
                errors: {type: "NotFound"},
            }, {status: HttpStatusCode.NotFound});
        }

        const roomWithNumberPrice: RoomWithDetails = {
            ...room,
            roomType: {
                ...room.roomType,
                basePrice: Number(room.roomType.basePrice),
            },
            amenities: room.amenities,
            images: room.images,
        };

        return NextResponse.json<ApiResponse<RoomWithDetails>>({
            success: true,
            message: "Room retrieved successfully",
            data: roomWithNumberPrice,
        });

    } catch (err) {
        console.error("Error fetching room:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: {type: "ServerError"},
            data: null,
            success: false,
            message: "Error fetching room",
        }, {status: HttpStatusCode.InternalServerError});
    }
};

export const PATCH = async (req: NextRequest, context: {params: Promise<{id:string}>}) => {
    try {
        requireAdminAuth(req)
        const {id} = await context.params
        const roomId = parseInt(id);
        if (isNaN(roomId)) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid room ID",
                data: null,
                errors: {type: "ValidationError"},
            }, {status: HttpStatusCode.BadRequest});
        }

        const body = await req.json();
        const {roomNumber, roomTypeId, floor, isActive} = CreateRoomSchema.partial().extend({
            isActive: UpdateRoomAvailabilitySchema.shape.isAvailable.optional(),
        }).parse(body);

        const existingRoom = await prisma.room.findFirst({
            where: {id: roomId, isDeleted: false},
        });

        if (!existingRoom) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Room not found",
                data: null,
                errors: {type: "NotFound"},
            }, {status: HttpStatusCode.NotFound});
        }

        if (roomNumber && roomNumber !== existingRoom.roomNumber) {
            const roomNumberExists = await prisma.room.findUnique({
                where: {roomNumber},
            });
            if (roomNumberExists) {
                return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                    success: false,
                    message: "Room number already exists",
                    data: null,
                    errors: {type: "ValidationError"},
                }, {status: HttpStatusCode.Conflict});
            }
        }

        if (roomTypeId) {
            const roomType = await prisma.roomType.findUnique({
                where: {id: roomTypeId},
            });
            if (!roomType) {
                return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                    success: false,
                    message: "Room type not found",
                    data: null,
                    errors: {type: "NotFound"},
                }, {status: HttpStatusCode.NotFound});
            }
        }

        const room = await prisma.room.update({
            where: {id: roomId},
            data: {
                roomNumber,
                roomTypeId,
                floor,
                isActive,
            },
            include: {
                roomType: true,
                amenities: {
                    include: {
                        amenity: true,
                    },
                },
                images: true,

            },
        });

        const roomWithNumberPrice: RoomWithDetails = {
            ...room,
            roomType: {
                ...room.roomType,
                basePrice: Number(room.roomType.basePrice),
            },
            amenities: room.amenities,
            images: room.images,
        };

        return NextResponse.json<ApiResponse<RoomWithDetails>>({
            success: true,
            message: "Room updated successfully",
            data: roomWithNumberPrice,
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

        console.error("Error updating room:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: {type: "ServerError"},
            data: null,
            success: false,
            message: "Error updating room",
        }, {status: HttpStatusCode.InternalServerError});
    }
};

export const DELETE = async (req: NextRequest, context:{params: Promise<{id: string}>}) => {
    try {
        requireAdminAuth(req)
        const {id} =await  context.params
        const roomId = parseInt(id);
        if (isNaN(roomId)) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid room ID",
                data: null,
                errors: {type: "ValidationError"},
            }, {status: HttpStatusCode.BadRequest});
        }

        const existingRoom = await prisma.room.findFirst({
            where: {id: roomId, isDeleted: false},
        });

        if (!existingRoom) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Room not found",
                data: null,
                errors: {type: "NotFound"},
            }, {status: HttpStatusCode.NotFound});
        }

        const activeBookings = await prisma.booking.count({
            where: {
                roomId,
                status: {in: ["PENDING", "CONFIRMED"]},
            },
        });

        if (activeBookings > 0) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Cannot delete room with active bookings",
                data: null,
                errors: {type: "ValidationError"},
            }, {status: HttpStatusCode.Conflict});
        }

        await prisma.room.update({
            where: {id: roomId},
            data: {
                isDeleted: true,
                isActive: false,
            },
        });

        return NextResponse.json<ApiResponse<null>>({
            success: true,
            message: "Room deleted successfully",
            data: null,
        });

    } catch (err) {
        console.error("Error deleting room:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: {type: "ServerError"},
            data: null,
            success: false,
            message: "Error deleting room",
        }, {status: HttpStatusCode.InternalServerError});
    }
};