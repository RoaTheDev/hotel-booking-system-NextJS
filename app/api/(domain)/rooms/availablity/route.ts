import {NextRequest, NextResponse} from "next/server";
import {prismaClient as prisma} from "@/lib/prismaClient";
import {HttpStatusCode} from "axios";
import {z, ZodError} from "zod";
import {ApiErrorResponse, ApiResponse} from "@/types/commonTypes";
import {validationErrorFormat} from "@/utils/zodErrorFormat";
import {RoomWithDetails} from "@/types/roomTypes";

const AvailabilityQuerySchema = z.object({
    checkIn: z.string().datetime(),
    checkOut: z.string().datetime(),
    guests: z.string().optional().transform(val => val ? parseInt(val) : 1),
});

export const GET = async (req: NextRequest) => {
    try {
        const {searchParams} = new URL(req.url);
        const queryParams = Object.fromEntries(searchParams.entries());

        const {checkIn, checkOut, guests} = AvailabilityQuerySchema.parse(queryParams);

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        // Validate dates
        if (checkInDate >= checkOutDate) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Check-out date must be after check-in date",
                data: null,
                errors: {type: "ValidationError"},
            }, {status: HttpStatusCode.BadRequest});
        }

        if (checkInDate < new Date()) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Check-in date cannot be in the past",
                data: null,
                errors: {type: "ValidationError"},
            }, {status: HttpStatusCode.BadRequest});
        }

        const availableRooms = await prisma.room.findMany({
            where: {
                isDeleted: false,
                isActive: true,
                roomType: {
                    maxGuests: {gte: guests},
                },
                NOT: {
                    bookings: {
                        some: {
                            OR: [
                                {
                                    AND: [
                                        {checkIn: {lte: checkInDate}},
                                        {checkOut: {gt: checkInDate}},
                                        {status: {not: "CANCELLED"}}
                                    ]
                                },
                                {
                                    AND: [
                                        {checkIn: {lt: checkOutDate}},
                                        {checkOut: {gte: checkOutDate}},
                                        {status: {not: "CANCELLED"}}
                                    ]
                                },
                                {
                                    AND: [
                                        {checkIn: {gte: checkInDate}},
                                        {checkOut: {lte: checkOutDate}},
                                        {status: {not: "CANCELLED"}}
                                    ]
                                }
                            ]
                        }
                    }
                }
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

        const roomsWithNumberPrice: RoomWithDetails[] = availableRooms.map(room => ({
            ...room,
            roomType: {
                ...room.roomType,
                basePrice: Number(room.roomType.basePrice),
            },
        }));

        return NextResponse.json<ApiResponse<{ availableRooms: RoomWithDetails[] }>>({
            success: true,
            message: "Available rooms retrieved successfully",
            data: {availableRooms: roomsWithNumberPrice},
        });

    } catch (err) {
        if (err instanceof ZodError) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid hooks parameters",
                data: null,
                errors: validationErrorFormat(err),
            }, {status: HttpStatusCode.BadRequest});
        }

        console.error("Error checking availability:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: {type: "ServerError"},
            data: null,
            success: false,
            message: "Error checking availability",
        }, {status: HttpStatusCode.InternalServerError});
    }
};