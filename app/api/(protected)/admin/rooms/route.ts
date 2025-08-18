import {NextRequest, NextResponse} from "next/server";
import {prismaClient as prisma} from "@/lib/prismaClient";
import {HttpStatusCode} from "axios";
import {ApiErrorResponse, ApiResponse} from "@/types/commonTypes";
import {AuthError, requireAdminAuth} from "@/middleware/auth";
import {Prisma} from "@/app/generated/prisma";
import {z} from "zod";
import {Decimal} from "@prisma/client/runtime/library";
import RoomWhereInput = Prisma.RoomWhereInput;

export interface RoomInternal {
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
        basePrice: Decimal;
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

export const GET = async (req: NextRequest) => {
    try {
        requireAdminAuth(req);
        const {searchParams} = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const search = searchParams.get("search") || "";
        const roomTypeId = searchParams.get("roomTypeId") || "";
        const floor = searchParams.get("floor") || "";
        const isActive = searchParams.get("isActive");
        const includeDeleted = searchParams.get("includeDeleted") === "true";

        const skip = (page - 1) * limit;

        const where: RoomWhereInput = {};

        if (!includeDeleted) {
            where.isDeleted = false;
        }

        if (search) {
            where.OR = [
                {roomNumber: {contains: search, mode: "insensitive"}},
                {roomType: {name: {contains: search, mode: "insensitive"}}},
            ];
        }

        if (roomTypeId && roomTypeId !== "ALL") {
            where.roomTypeId = parseInt(roomTypeId);
        }

        if (floor && floor !== "ALL") {
            where.floor = parseInt(floor);
        }

        if (isActive !== null && isActive !== undefined) {
            where.isActive = isActive === "true";
        }

        const [rooms, totalCount] = await Promise.all([
            prisma.room.findMany({
                where,
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
                orderBy: {createdAt: "desc"},
                skip,
                take: limit,
            },),
            prisma.room.count({where}),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json<
            ApiResponse<{
                rooms: RoomInternal[];
                pagination: {
                    page: number;
                    limit: number;
                    totalCount: number;
                    totalPages: number;
                };
            }>
        >({
            success: true,
            message: "Rooms retrieved successfully",
            data: {
                rooms: rooms as RoomInternal[], // Type is now compatible
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
            }, {status: err.statusCode})
        }

        console.error("Error fetching rooms:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: {type: "ServerError"},
            data: null,
            success: false,
            message: "Error fetching rooms",
        }, {status: HttpStatusCode.InternalServerError});
    }
};

const createRoomSchema = z.object({
    roomNumber: z.string().min(1, "Room number is required").max(10, "Room number too long"),
    roomTypeId: z.number().int().positive("Room type ID must be a positive integer"),
    floor: z.number().int().min(1).max(100).optional().nullable(),
    imageUrls: z.array(z.string().url("Invalid image URL")).optional().default([]),
    amenityIds: z.array(z.number().int().positive()).optional().default([]),
    isActive: z.boolean().optional().default(true),
});

interface CreateRoomRequest {
    roomNumber: string;
    roomTypeId: number;
    floor?: number | null;
    imageUrls?: string[];
    amenityIds?: number[];
    isActive?: boolean;
}

interface CreatedRoom {
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

export const POST = async (req: NextRequest) => {
    try {
        requireAdminAuth(req);

        const body: CreateRoomRequest = await req.json();

        const validationResult = createRoomSchema.safeParse(body);
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

        const {roomNumber, roomTypeId, floor, imageUrls = [], amenityIds = [], isActive = true} = validationResult.data;

        // Check if room number already exists
        const existingRoom = await prisma.room.findUnique({
            where: {roomNumber},
            select: {id: true, isDeleted: true},
        });

        if (existingRoom && !existingRoom.isDeleted) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Room with this number already exists",
                data: null,
                errors: {type: "ConflictError"},
            }, {status: HttpStatusCode.Conflict});
        }

        // Verify room type exists
        const roomType = await prisma.roomType.findUnique({
            where: {id: roomTypeId, isDeleted: false},
            select: {id: true, name: true, basePrice: true},
        });

        if (!roomType) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Room type not found",
                data: null,
                errors: {type: "NotFoundError"},
            }, {status: HttpStatusCode.NotFound});
        }

        // Verify amenities exist
        if (amenityIds.length > 0) {
            const amenitiesCount = await prisma.amenity.count({
                where: {
                    id: {in: amenityIds},
                    isDeleted: false,
                    isActive: true,
                },
            });

            if (amenitiesCount !== amenityIds.length) {
                return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                    success: false,
                    message: "One or more amenities not found or inactive",
                    data: null,
                    errors: {type: "NotFoundError"},
                }, {status: HttpStatusCode.NotFound});
            }
        }

        // Create the room with related data
        const newRoom = await prisma.$transaction(async (tx) => {
            // Create the room
            const room = await tx.room.create({
                data: {
                    roomNumber,
                    roomType: {connect: {id: roomTypeId}}, // Use connect for relation
                    floor,
                    isActive,
                    isDeleted: false,
                },
            });

            // Add room images
            if (imageUrls.length > 0) {
                await tx.roomImage.createMany({
                    data: imageUrls.map((url) => ({
                        roomId: room.id,
                        imageUrl: url,
                        caption: null,
                    })),
                });
            }

            // Add room amenities
            if (amenityIds.length > 0) {
                await tx.roomAmenity.createMany({
                    data: amenityIds.map((amenityId) => ({
                        roomId: room.id,
                        amenityId,
                    })),
                });
            }

            // Return the complete room data
            const createdRoom = await tx.room.findUnique({
                where: {id: room.id},
                include: {
                    roomType: {
                        select: {
                            id: true,
                            name: true,
                            basePrice: true,
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
                    images: {
                        select: {
                            id: true,
                            imageUrl: true,
                            caption: true,
                        },
                    },
                },
            });

            if (!createdRoom) {
                throw new Error("Room not found after creation");
            }

            return createdRoom;
        });

        return NextResponse.json<ApiResponse<CreatedRoom>>({
            success: true,
            message: "Room created successfully",
            data: newRoom as CreatedRoom, // Type is now compatible
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
            if (err.code === "P2002") {
                return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                    success: false,
                    message: "Room with this number already exists",
                    data: null,
                    errors: {type: "ConflictError"},
                }, {status: HttpStatusCode.Conflict});
            }
        }

        console.error("Error creating room:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: {type: "ServerError"},
            data: null,
            success: false,
            message: "Error creating room",
        }, {status: HttpStatusCode.InternalServerError});
    }
};