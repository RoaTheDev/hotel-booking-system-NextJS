import {NextRequest, NextResponse} from "next/server";
import {prismaClient as prisma} from "@/lib/prismaClient";
import {HttpStatusCode} from "axios";
import {ApiErrorResponse, ApiResponse} from "@/types/commonTypes";
import {AuthError, requireAdminAuth} from "@/middleware/auth";
import {Prisma} from "@/app/generated/prisma";
import {z} from "zod";
import {Decimal} from "@prisma/client/runtime/library";

interface RoomDetails {
    id: number;
    roomNumber: string;
    roomTypeId: number;
    floor: number | null;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    roomType: {
        id: number;
        name: string;
        description: string | null;
        basePrice: Decimal; // Changed to Decimal
        maxGuests: number;
        imageUrl: string | null;
    };
    amenities: Array<{
        id: number;
        amenity: {
            id: number;
            name: string;
            icon: string | null;
            description: string | null;
        };
    }>;
    images: Array<{
        id: number;
        imageUrl: string;
        caption: string | null;
    }>;
}

// GET /api/admin/rooms/[Imageid]
export const GET = async (req: NextRequest, {params}: { params: Promise<{ id: string }> }) => {
    try {
        requireAdminAuth(req);
        const {id} = await params
        const roomId = parseInt(id);
        if (isNaN(roomId)) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>(
                {
                    success: false,
                    message: "Invalid room ID",
                    data: null,
                    errors: {type: "ValidationError"},
                },
                {status: HttpStatusCode.BadRequest}
            );
        }

        const room = await prisma.room.findUnique({
            where: {id: roomId},
            include: {
                roomType: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        basePrice: true,
                        maxGuests: true,
                        imageUrl: true,
                    },
                },
                amenities: {
                    select: {
                        id: true,
                        amenity: {
                            select: {
                                id: true,
                                name: true,
                                icon: true,
                                description: true,
                            },
                        },
                    },
                },
                images: {
                    select: {
                        id: true,
                        imageUrl: true,
                        caption: true,
                    },
                },
            },
        });

        if (!room) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>(
                {
                    success: false,
                    message: "Room not found",
                    data: null,
                    errors: {type: "NotFoundError"},
                },
                {status: HttpStatusCode.NotFound}
            );
        }

        return NextResponse.json<ApiResponse<RoomDetails>>({
            success: true,
            message: "Room retrieved successfully",
            data: room as RoomDetails, // Type is now compatible
        });
    } catch (err) {
        if (err instanceof AuthError) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>(
                {
                    success: false,
                    message: err.message,
                    data: null,
                    errors: {type: "AuthError"},
                },
                {status: err.statusCode}
            );
        }

        console.error("Error fetching room:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>(
            {
                errors: {type: "ServerError"},
                data: null,
                success: false,
                message: "Error fetching room",
            },
            {status: HttpStatusCode.InternalServerError}
        );
    }
};

const updateRoomSchema = z.object({
    roomNumber: z.string().min(1, "Room number is required").max(10, "Room number too long").optional(),
    roomTypeId: z.number().int().positive("Room type ID must be a positive integer").optional(),
    floor: z.number().int().min(1).max(100).optional().nullable(),
    imageUrls: z.array(z.string().url("Invalid image URL")).optional(),
    amenityIds: z.array(z.number().int().positive()).optional(),
    isActive: z.boolean().optional(),
});

interface UpdateRoomRequest {
    roomNumber?: string;
    roomTypeId?: number;
    floor?: number | null;
    imageUrls?: string[];
    amenityIds?: number[];
    isActive?: boolean;
}

interface UpdatedRoom {
    id: number;
    roomNumber: string;
    roomTypeId: number;
    floor: number | null;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    roomType: {
        id: number;
        name: string;
        basePrice: Decimal; // Changed to Decimal
    };
    amenities: Array<{
        id: number;
        amenity: {
            id: number;
            name: string;
        };
    }>;
    images: Array<{
        id: number;
        imageUrl: string;
        caption: string | null;
    }>;
}

// PUT /api/admin/rooms/[Imageid]
export const PUT = async (req: NextRequest, {params}: { params: Promise<{ id: string }> }) => {
    try {
        requireAdminAuth(req);
        const {id} = await params
        const roomId = parseInt(id);
        if (isNaN(roomId)) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>(
                {
                    success: false,
                    message: "Invalid room ID",
                    data: null,
                    errors: {type: "ValidationError"},
                },
                {status: HttpStatusCode.BadRequest}
            );
        }

        const body: UpdateRoomRequest = await req.json();

        const validationResult = updateRoomSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>(
                {
                    success: false,
                    message: "Validation failed",
                    data: null,
                    errors: {
                        type: "ValidationError",
                    },
                },
                {status: HttpStatusCode.BadRequest}
            );
        }

        const updateData = validationResult.data;

        // Check if room exists
        const existingRoom = await prisma.room.findUnique({
            where: {id: roomId},
            select: {id: true, isDeleted: true, roomNumber: true},
        });

        if (!existingRoom) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>(
                {
                    success: false,
                    message: "Room not found",
                    data: null,
                    errors: {type: "NotFoundError"},
                },
                {status: HttpStatusCode.NotFound}
            );
        }

        if (existingRoom.isDeleted) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>(
                {
                    success: false,
                    message: "Cannot update deleted room",
                    data: null,
                    errors: {type: "ConflictError"},
                },
                {status: HttpStatusCode.Conflict}
            );
        }

        // Check for room number conflicts (if updating room number)
        if (updateData.roomNumber && updateData.roomNumber !== existingRoom.roomNumber) {
            const roomNumberConflict = await prisma.room.findUnique({
                where: {roomNumber: updateData.roomNumber},
                select: {id: true},
            });

            if (roomNumberConflict && roomNumberConflict.id !== roomId) {
                return NextResponse.json<ApiResponse<ApiErrorResponse>>(
                    {
                        success: false,
                        message: "Room with this number already exists",
                        data: null,
                        errors: {type: "ConflictError"},
                    },
                    {status: HttpStatusCode.Conflict}
                );
            }
        }

        // Verify room type exists (if updating)
        if (updateData.roomTypeId) {
            const roomType = await prisma.roomType.findUnique({
                where: {id: updateData.roomTypeId, isDeleted: false},
                select: {id: true},
            });

            if (!roomType) {
                return NextResponse.json<ApiResponse<ApiErrorResponse>>(
                    {
                        success: false,
                        message: "Room type not found",
                        data: null,
                        errors: {type: "NotFoundError"},
                    },
                    {status: HttpStatusCode.NotFound}
                );
            }
        }

        // Verify amenities exist (if updating)
        if (updateData.amenityIds && updateData.amenityIds.length > 0) {
            const amenitiesCount = await prisma.amenity.count({
                where: {
                    id: {in: updateData.amenityIds},
                    isDeleted: false,
                    isActive: true,
                },
            });

            if (amenitiesCount !== updateData.amenityIds.length) {
                return NextResponse.json<ApiResponse<ApiErrorResponse>>(
                    {
                        success: false,
                        message: "One or more amenities not found or inactive",
                        data: null,
                        errors: {type: "NotFoundError"},
                    },
                    {status: HttpStatusCode.NotFound}
                );
            }
        }

        // Update the room with related data
        const updatedRoom = await prisma.$transaction(async (tx) => {
            // Update room basic data
            const roomUpdateData: Prisma.RoomUpdateInput = {};
            if (updateData.roomNumber !== undefined) roomUpdateData.roomNumber = updateData.roomNumber;
            if (updateData.roomTypeId !== undefined) {
                roomUpdateData.roomType = {connect: {id: updateData.roomTypeId}}; // Use connect for relation
            }
            if (updateData.floor !== undefined) roomUpdateData.floor = updateData.floor;
            if (updateData.isActive !== undefined) roomUpdateData.isActive = updateData.isActive;

            if (Object.keys(roomUpdateData).length > 0) {
                await tx.room.update({
                    where: {id: roomId},
                    data: roomUpdateData,
                });
            }

            // Update images if provided
            if (updateData.imageUrls !== undefined) {
                // Delete existing images
                await tx.roomImage.deleteMany({
                    where: {roomId},
                });

                // Add new images
                if (updateData.imageUrls.length > 0) {
                    await tx.roomImage.createMany({
                        data: updateData.imageUrls.map((url) => ({
                            roomId,
                            imageUrl: url,
                            caption: null,
                        })),
                    });
                }
            }

            // Update amenities if provided
            if (updateData.amenityIds !== undefined) {
                // Delete existing amenities
                await tx.roomAmenity.deleteMany({
                    where: {roomId},
                });

                // Add new amenities
                if (updateData.amenityIds.length > 0) {
                    await tx.roomAmenity.createMany({
                        data: updateData.amenityIds.map((amenityId) => ({
                            roomId,
                            amenityId,
                        })),
                    });
                }
            }

            // Return the complete updated room data
            const updatedRoom = await tx.room.findUnique({
                where: {id: roomId},
                include: {
                    roomType: {
                        select: {
                            id: true,
                            name: true,
                            basePrice: true,
                        }
                    },
                    images: {
                        select: {
                            id: true,
                            imageUrl: true,
                            caption: true,
                        },
                },
                amenities: {
                    select: {
                        id: true,
                        amenity: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        },

)
    ;

    if (!updatedRoom) {
        throw new Error("Room not found after update");
    }

    return updatedRoom;
}
)
;

return NextResponse.json<ApiResponse<UpdatedRoom>>({
    success: true,
    message: "Room updated successfully",
    data: updatedRoom as UpdatedRoom, // Type is now compatible
});
} catch
(err)
{
    if (err instanceof AuthError) {
        return NextResponse.json<ApiResponse<ApiErrorResponse>>(
            {
                success: false,
                message: err.message,
                data: null,
                errors: {type: "AuthError"},
            },
            {status: err.statusCode}
        );
    }

    // Handle Prisma unique constraint violation
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>(
                {
                    success: false,
                    message: "Room with this number already exists",
                    data: null,
                    errors: {type: "ConflictError"},
                },
                {status: HttpStatusCode.Conflict}
            );
        }
    }

    console.error("Error updating room:", err);
    return NextResponse.json<ApiResponse<ApiErrorResponse>>(
        {
            errors: {type: "ServerError"},
            data: null,
            success: false,
            message: "Error updating room",
        },
        {status: HttpStatusCode.InternalServerError}
    );
}
}
;

// DELETE /api/admin/rooms/[Imageid]
export const DELETE = async (req: NextRequest, {params}: { params: Promise<{ id: string }> }) => {
    try {
        requireAdminAuth(req);
        const {id} = await params
        const roomId = parseInt(id);
        if (isNaN(roomId)) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>(
                {
                    success: false,
                    message: "Invalid room ID",
                    data: null,
                    errors: {type: "ValidationError"},
                },
                {status: HttpStatusCode.BadRequest}
            );
        }

        // Check if room exists
        const existingRoom = await prisma.room.findUnique({
            where: {id: roomId},
            select: {
                id: true,
                isDeleted: true,
                roomNumber: true,
                _count: {
                    select: {
                        bookings: {
                            where: {
                                status: {
                                    in: ["PENDING", "CONFIRMED"],
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!existingRoom) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>(
                {
                    success: false,
                    message: "Room not found",
                    data: null,
                    errors: {type: "NotFoundError"},
                },
                {status: HttpStatusCode.NotFound}
            );
        }

        if (existingRoom.isDeleted) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>(
                {
                    success: false,
                    message: "Room is already deleted",
                    data: null,
                    errors: {type: "ConflictError"},
                },
                {status: HttpStatusCode.Conflict}
            );
        }

        // Check for active bookings
        if (existingRoom._count.bookings > 0) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>(
                {
                    success: false,
                    message: "Cannot delete room with active bookings",
                    data: null,
                    errors: {type: "ConflictError"},
                },
                {status: HttpStatusCode.Conflict}
            );
        }

        // Soft delete the room and clean up related data
        await prisma.$transaction(async (tx) => {
            // Soft delete the room
            await tx.room.update({
                where: {id: roomId},
                data: {
                    isDeleted: true,
                    isActive: false,
                    updatedAt: new Date(),
                },
            });

            // Delete room images (cascade delete)
            await tx.roomImage.deleteMany({
                where: {roomId},
            });

            // Delete room amenities (cascade delete)
            await tx.roomAmenity.deleteMany({
                where: {roomId},
            });

            // Delete room availability records (cascade delete)
            await tx.roomAvailability.deleteMany({
                where: {roomId},
            });
        });

        return NextResponse.json<ApiResponse<{ message: string }>>({
            success: true,
            message: "Room deleted successfully",
            data: {message: `Room ${existingRoom.roomNumber} has been deleted`},
        });
    } catch (err) {
        if (err instanceof AuthError) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>(
                {
                    success: false,
                    message: err.message,
                    data: null,
                    errors: {type: "AuthError"},
                },
                {status: err.statusCode}
            );
        }

        console.error("Error deleting room:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>(
            {
                errors: {type: "ServerError"},
                data: null,
                success: false,
                message: "Error deleting room",
            },
            {status: HttpStatusCode.InternalServerError}
        );
    }
};