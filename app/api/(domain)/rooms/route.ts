import {NextRequest, NextResponse} from "next/server";
import {prismaClient as prisma} from "@/lib/prismaClient";
import {HttpStatusCode} from "axios";
import {ZodError} from "zod";
import {ApiErrorResponse, ApiResponse} from "@/lib/types/commonTypes";
import {ExtendedCreateRoomSchema, RoomQuerySchema, RoomWithDetails} from "@/lib/types/roomTypes";
import {validationErrorFormat} from "@/lib/zodErrorFormat";
import {Prisma} from "@/app/generated/prisma";
import RoomOrderByWithRelationInput = Prisma.RoomOrderByWithRelationInput;
import RoomWhereInput = Prisma.RoomWhereInput;
import { requireAdminAuth } from "@/lib/middleware/auth";


type RoomViaWhereInput = RoomWhereInput;
type RoomViaOrderByInput = RoomOrderByWithRelationInput;



export const GET = async (req: NextRequest) => {
    try {
        const { searchParams } = new URL(req.url);
        const queryParams = Object.fromEntries(searchParams.entries());

        const {
            page,
            limit,
            sortBy,
            sortOrder,
            minPrice,
            maxPrice,
            maxGuests,
            available,
            checkIn,
            checkOut,
        } = RoomQuerySchema.parse(queryParams);

        const skip = (page - 1) * limit;

        const where: RoomViaWhereInput = {
            isDeleted: false,
            isActive: true,
        };
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.roomType = {
                basePrice: {
                    ...(minPrice !== undefined && { gte: minPrice }),
                    ...(maxPrice !== undefined && { lte: maxPrice }),
                },
            };
        }

        if (maxGuests !== undefined) {
            where.roomType = {
                maxGuests: { gte: maxGuests },
            };
        }

        if (available !== undefined && checkIn && checkOut) {
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);

            if (available) {
                where.NOT = {
                    bookings: {
                        some: {
                            OR: [
                                {
                                    AND: [
                                        { checkIn: { lte: checkInDate } },
                                        { checkOut: { gt: checkInDate } },
                                        { status: { not: "CANCELLED" } },
                                    ],
                                },
                                {
                                    AND: [
                                        { checkIn: { lt: checkOutDate } },
                                        { checkOut: { gte: checkOutDate } },
                                        { status: { not: "CANCELLED" } },
                                    ],
                                },
                                {
                                    AND: [
                                        { checkIn: { gte: checkInDate } },
                                        { checkOut: { lte: checkOutDate } },
                                        { status: { not: "CANCELLED" } },
                                    ],
                                },
                            ],
                        },
                    },
                };
            }
        }

        let orderBy: RoomViaOrderByInput;
        switch (sortBy) {
            case "price":
                orderBy = { roomType: { basePrice: sortOrder } };
                break;
            case "name":
                orderBy = { roomType: { name: sortOrder } };
                break;
            default:
                orderBy = { [sortBy]: sortOrder };
        }

        const [rooms, totalCount] = await Promise.all([
            prisma.room.findMany({
                where,
                include: {
                    roomType: true,
                    amenities: {
                        include: {
                            amenity: true,
                        },
                    },
                    images: true,
                    _count: {
                        select: { bookings: true },
                    },
                },
                orderBy,
                skip,
                take: limit,
            }),
            prisma.room.count({ where }),
        ]);

        const roomsWithNumberPrice: RoomWithDetails[] = rooms.map(room => ({
            ...room,
            roomType: {
                ...room.roomType,
                basePrice: Number(room.roomType.basePrice)
            },
        }));

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json<
            ApiResponse<{
                rooms: RoomWithDetails[];
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
                rooms: roomsWithNumberPrice,
                pagination: {
                    page,
                    limit,
                    totalCount,
                    totalPages,
                },
            },
        });

    } catch (err) {
        if (err instanceof ZodError) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid query parameters",
                data: null,
                errors: validationErrorFormat(err),
            }, { status: HttpStatusCode.BadRequest });
        }

        console.error("Error fetching rooms:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: { type: "ServerError" },
            data: null,
            success: false,
            message: "Error fetching rooms",
        }, { status: HttpStatusCode.InternalServerError });
    }
};



export const POST = async (req: NextRequest) => {
    try {
        requireAdminAuth(req)
        const body = await req.json();
        const { roomNumber, roomTypeId, floor, imageUrls, amenityIds } = ExtendedCreateRoomSchema.parse(body);

        const room = await prisma.$transaction(async (tx) => {
            const existingRoom = await tx.room.findUnique({
                where: { roomNumber },
            });

            if (existingRoom) {
                throw new Error("Room number already exists");
            }

            const roomType = await tx.roomType.findUnique({
                where: { id: roomTypeId },
            });

            if (!roomType) {
                throw new Error("Room type not found");
            }

            if (amenityIds && amenityIds.length > 0) {
                const existingAmenities = await tx.amenity.findMany({
                    where: {
                        id: { in: amenityIds },
                        isDeleted: false,
                        isActive: true,
                    },
                });

                if (existingAmenities.length !== amenityIds.length) {
                    throw new Error("One or more amenities not found");
                }
            }

            return tx.room.create({
                data: {
                    roomNumber,
                    roomTypeId,
                    floor,
                    isActive: true,
                    isDeleted: false,
                    images: imageUrls
                        ? {
                            create: imageUrls.map((url) => ({
                                imageUrl: url,
                            })),
                        }
                        : undefined,
                    amenities: amenityIds
                        ? {
                            create: amenityIds.map((amenityId) => ({
                                amenityId,
                            })),
                        }
                        : undefined,
                },
                include: {
                    roomType: true,
                    amenities: {
                        include: {
                            amenity: true,
                        },
                    },
                    images: true,
                    _count: {
                        select: {bookings: true},
                    },
                },
            });
        });

        const roomWithNumberPrice: RoomWithDetails = {
            ...room,
            roomType: {
                ...room.roomType,
                basePrice: Number(room.roomType.basePrice),
            },
            amenities: room.amenities,
            images: room.images,
            _count: room._count,
        };

        return NextResponse.json<ApiResponse<RoomWithDetails>>({
            success: true,
            message: "Room created successfully",
            data: roomWithNumberPrice,
        });

    } catch (err) {
        if (err instanceof ZodError) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid input data",
                data: null,
                errors: validationErrorFormat(err),
            }, { status: HttpStatusCode.BadRequest });
        }

        if (err instanceof Error) {
            if (err.message === "Room number already exists") {
                return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                    success: false,
                    message: err.message,
                    data: null,
                    errors: { type: "ValidationError" },
                }, { status: HttpStatusCode.Conflict });
            }

            if (err.message === "Room type not found" || err.message === "One or more amenities not found") {
                return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                    success: false,
                    message: err.message,
                    data: null,
                    errors: { type: "NotFound" },
                }, { status: HttpStatusCode.NotFound });
            }
        }

        console.error("Error creating room:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: { type: "ServerError" },
            data: null,
            success: false,
            message: "Error creating room",
        }, { status: HttpStatusCode.InternalServerError });
    }
};
