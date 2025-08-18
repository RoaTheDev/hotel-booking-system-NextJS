import {NextRequest, NextResponse} from "next/server";
import {prismaClient as prisma} from "@/lib/prismaClient";
import {HttpStatusCode} from "axios";
import {ApiErrorResponse, ApiResponse} from "@/types/commonTypes";
import {CreateRoomTypeData, RoomTypeSchema, RoomTypeWithDetails} from "@/types/roomTypes";
import {AuthError, requireAdminAuth} from "@/middleware/auth";
import {RoomType} from "@/app/generated/prisma";
import {ZodError} from "zod";
import {validationErrorFormat} from "@/utils/zodErrorFormat";



export const GET = async (_: NextRequest, context: { params: Promise<{ id: string }> }) => {
    try {
        const {id} = await context.params
        const roomTypeId = parseInt(id);


        if (isNaN(roomTypeId)) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid room type ID",
                data: null,
                errors: {type: "ValidationError"},
            }, {status: HttpStatusCode.BadRequest});
        }

        const roomType: RoomTypeWithDetails | null = await prisma.roomType.findFirst({
            where: {
                id: roomTypeId,
                isDeleted: false
            },
            include: {
                rooms: {
                    where: {isDeleted: false},
                    include: {
                        amenities: {
                            include: {
                                amenity: true
                            }
                        },
                        images: true,
                        _count: {
                            select: {bookings: true}
                        }
                    }
                },
                _count: {
                    select: {rooms: true}
                }
            }
        });

        if (!roomType) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Room type not found",
                data: null,
                errors: {type: "NotFound"},
            }, {status: HttpStatusCode.NotFound});
        }

        return NextResponse.json<ApiResponse<RoomTypeWithDetails>>({
            success: true,
            message: "Room type retrieved successfully",
            data: roomType,
        });

    } catch (err) {
        console.error("Error fetching room type:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: {type: "ServerError"},
            data: null,
            success: false,
            message: "Error fetching room type",
        }, {status: HttpStatusCode.InternalServerError});
    }
};


export const PUT = async (req: NextRequest, context: {params: Promise<{id: string}>}) => {
    try {
        requireAdminAuth(req);
        const {id} = await context.params
        const roomTypeId = parseInt(id);

        if (isNaN(roomTypeId)) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid room type ID",
                data: null,
                errors: {type: "ValidationError"},
            }, {status: HttpStatusCode.BadRequest});
        }

        const body: CreateRoomTypeData = await req.json();
        const validatedData = RoomTypeSchema.parse(body);

        const existingRoomType = await prisma.roomType.findFirst({
            where: {
                id: roomTypeId,
                isDeleted: false
            }
        });

        if (!existingRoomType) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Room type not found",
                data: null,
                errors: {type: "NotFound"},
            }, {status: HttpStatusCode.NotFound});
        }

        const duplicateRoomType = await prisma.roomType.findFirst({
            where: {
                name: validatedData.name,
                isDeleted: false,
                NOT: {id: roomTypeId}
            }
        });

        if (duplicateRoomType) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Room type name already exists",
                data: null,
                errors: {type: "ValidationError"},
            }, {status: HttpStatusCode.BadRequest});
        }

        const updatedRoomType = await prisma.roomType.update({
            where: {id: roomTypeId},
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
            message: "Room type updated successfully",
            data: updatedRoomType,
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

        if (err instanceof ZodError) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid input data",
                data: null,
                errors: validationErrorFormat(err),
            }, {status: HttpStatusCode.BadRequest});
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

export const DELETE = async (req: NextRequest, context:{params:Promise<{id: string}>}) => {
    try {
        requireAdminAuth(req);
        const {id} = await context.params
        const roomTypeId = parseInt(id);

        if (isNaN(roomTypeId)) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid room type ID",
                data: null,
                errors: {type: "ValidationError"},
            }, {status: HttpStatusCode.BadRequest});
        }

        const existingRoomType = await prisma.roomType.findFirst({
            where: {
                id: roomTypeId,
                isDeleted: false
            }
        });

        if (!existingRoomType) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Room type not found",
                data: null,
                errors: {type: "NotFound"},
            }, {status: HttpStatusCode.NotFound});
        }

        const activeRooms = await prisma.room.count({
            where: {
                roomTypeId: roomTypeId,
                isDeleted: false,
                isActive: true
            }
        });

        if (activeRooms > 0) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: `Cannot delete room type. There are ${activeRooms} active rooms of this type.`,
                data: null,
                errors: {type: "ValidationError"},
            }, {status: HttpStatusCode.BadRequest});
        }

        const bookingCount = await prisma.booking.count({
            where: {
                room: {
                    roomTypeId: roomTypeId
                },
                status: {in: ["PENDING", "CONFIRMED"]}
            }
        });

        if (bookingCount > 0) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: `Cannot delete room type. There are ${bookingCount} active bookings for rooms of this type.`,
                data: null,
                errors: {type: "ValidationError"},
            }, {status: HttpStatusCode.BadRequest});
        }

        const deletedRoomType = await prisma.roomType.update({
            where: {id: roomTypeId},
            data: {isDeleted: true},
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
            message: "Room type deleted successfully",
            data: deletedRoomType,
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
