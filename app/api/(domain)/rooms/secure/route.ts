import {NextRequest, NextResponse} from "next/server";
import {AuthError, requireAdminAuth} from "@/lib/middleware/auth";
import {RoomWithDetails} from "@/lib/types/roomTypes";
import {prismaClient as prisma} from "@/lib/prismaClient";
import {ApiErrorResponse, ApiResponse} from "@/lib/types/commonTypes";
import {HttpStatusCode} from "axios";

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
