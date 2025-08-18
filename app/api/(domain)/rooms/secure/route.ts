import {NextRequest, NextResponse} from "next/server";
import {AuthError, requireAdminAuth} from "@/middleware/auth";
import {ExtendedCreateRoomSchema, RoomWithDetails} from "@/types/roomTypes";
import {prismaClient as prisma} from "@/lib/prismaClient";
import {ApiErrorResponse, ApiResponse} from "@/types/commonTypes";
import {HttpStatusCode} from "axios";
import {ZodError} from "zod";
import {validationErrorFormat} from "@/utils/zodErrorFormat";

export const GET = async (req: NextRequest) => {
    try {

        requireAdminAuth(req);

        const {searchParams} = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const includeDeleted = searchParams.get("includeDeleted") === "true";

        const skip = (page - 1) * limit;

        const where = includeDeleted ? {} : {isDeleted: false};

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
                        select: {bookings: true},
                    },
                },
                orderBy: {createdAt: "desc"},
                skip,
                take: limit,
            }),
            prisma.room.count({where}),
        ]);
        const formattedRooms: RoomWithDetails[] = rooms.map(room => ({
            ...room,
            roomType: {
                ...room.roomType,
                basePrice: room.roomType.basePrice.toNumber(), // Convert Decimal to number
            },
            amenities: room.amenities.map((item) => ({
                ...item,
                amenity: {
                    ...item.amenity,
                },
            })),
            images: room.images.map((image) => ({
                ...image,
            })),
        }));
        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json<ApiResponse<{
            rooms: RoomWithDetails[];
            pagination: {
                page: number;
                limit: number;
                totalCount: number;
                totalPages: number;
            };
        }>>({
            success: true,
            message: "Rooms retrieved successfully",
            data: {
                rooms: formattedRooms,
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

        console.error("Error fetching rooms:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: {type: "ServerError"},
            data: null,
            success: false,
            message: "Error fetching rooms",
        }, {status: HttpStatusCode.InternalServerError});
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
