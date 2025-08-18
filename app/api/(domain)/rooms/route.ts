import {NextRequest, NextResponse} from "next/server";
import {prismaClient as prisma} from "@/lib/prismaClient";
import {HttpStatusCode} from "axios";
import {ZodError} from "zod";
import {ApiErrorResponse, ApiResponse} from "@/types/commonTypes";
import { RoomQuerySchema, RoomWithDetails} from "@/types/roomTypes";
import {validationErrorFormat} from "@/utils/zodErrorFormat";
import {Prisma} from "@/app/generated/prisma";
import RoomOrderByWithRelationInput = Prisma.RoomOrderByWithRelationInput;
import RoomWhereInput = Prisma.RoomWhereInput;



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
            search, // Add search parameter
        } = RoomQuerySchema.parse(queryParams);

        const skip = (page - 1) * limit;

        const where: RoomViaWhereInput = {
            isDeleted: false,
            isActive: true,
        };

        // Fix price filtering logic
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

        if (search) {
            where.OR = [
                {
                    roomType: {
                        name: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                },
                {
                    roomType: {
                        description: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                },
                // You can add more search fields here if needed
                // For example, search in amenities:
                {
                    amenities: {
                        some: {
                            amenity: {
                                name: {
                                    contains: search,
                                    mode: 'insensitive',
                                },
                            },
                        },
                    },
                },
            ];
        }

        // Availability filtering logic (unchanged)
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
                message: "Invalid hooks parameters",
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


