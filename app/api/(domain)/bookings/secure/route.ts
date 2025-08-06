import {NextRequest, NextResponse} from "next/server";
import {prismaClient as prisma} from "@/lib/prismaClient";
import {HttpStatusCode} from "axios";
import {ZodError} from "zod";
import {ApiErrorResponse, ApiResponse} from "@/lib/types/commonTypes";
import {validationErrorFormat} from "@/lib/zodErrorFormat";
import {AuthError, requireAdminAuth} from "@/lib/middleware/auth";
import {BookingCreateSchema, BookingQuerySchema, BookingWithDetails} from "@/lib/types/roomTypes";
import {Prisma} from "@/app/generated/prisma";
import BookingWhereInput = Prisma.BookingWhereInput;

export const POST = async (req: NextRequest) => {
    try {
        requireAdminAuth(req);

        const body = await req.json();
        const bookingData = BookingCreateSchema.parse(body);

        const { userId, roomId, checkIn, checkOut, guests, specialRequests } = bookingData;

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        const conflictingBookings = await prisma.booking.findMany({
            where: {
                roomId,
                status: { notIn: ['CANCELLED', 'COMPLETED'] },
                OR: [
                    {
                        AND: [
                            { checkIn: { lte: checkOutDate } },
                            { checkOut: { gte: checkInDate } },
                        ],
                    },
                ],
            },
        });

        if (conflictingBookings.length > 0) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Room is not available for the selected dates due to existing bookings.",
                data: null,
                errors: { type: "RoomAvailabilityError" },
            }, { status: HttpStatusCode.BadRequest });
        }

        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: {
                roomType: true,
            },
        });

        if (!room) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Room not found.",
                data: null,
                errors: { type: "RoomError" },
            }, { status: HttpStatusCode.NotFound });
        }

        const totalAmount = room.roomType.basePrice.toNumber() * guests;

        const booking = await prisma.booking.create({
            data: {
                userId,
                roomId,
                checkIn: checkInDate,
                checkOut: checkOutDate,
                guests,
                totalAmount,
                specialRequests,
                status: "CONFIRMED",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
                room: {
                    include: {
                        roomType: {
                            select: {
                                name: true,
                                basePrice: true,
                            },
                        },
                    },
                },
            },
        });

        await prisma.roomAvailability.updateMany({
            where: {
                roomId,
                date: {
                    gte: checkInDate,
                    lte: checkOutDate,
                },
            },
            data: {
                isAvailable: false,
            },
        });

        const formatBookingData = {
            ...booking,
            totalAmount: booking.totalAmount.toNumber(),
            room: {
                ...booking.room,
                roomType: {
                    ...booking.room.roomType,
                    basePrice: booking.room.roomType.basePrice.toNumber(),
                },
            },
        };

        return NextResponse.json<ApiResponse<BookingWithDetails>>({
            success: true,
            message: "Booking created successfully",
            data: formatBookingData,
        });
    } catch (err) {
        if (err instanceof AuthError) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: err.message,
                data: null,
                errors: { type: "AuthError" },
            }, { status: err.statusCode });
        }

        if (err instanceof ZodError) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid input data",
                data: null,
                errors: validationErrorFormat(err),
            }, { status: HttpStatusCode.BadRequest });
        }

        console.error("Error creating booking:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            success: false,
            message: "Error creating booking",
            data: null,
            errors: { type: "ServerError" },
        }, { status: HttpStatusCode.InternalServerError });
    }
};
export const GET = async (req: NextRequest) => {
    try {
        requireAdminAuth(req);

        const {searchParams} = new URL(req.url);
        const queryParams = Object.fromEntries(searchParams.entries());

        const {
            page,
            limit,
            status,
            userId,
            roomId,
            checkIn,
            checkOut
        } = BookingQuerySchema.parse(queryParams);

        const skip = (page - 1) * limit;

        const where: BookingWhereInput = {};

        if (status !== "ALL") {
            where.status = status;
        }

        if (userId) {
            where.userId = userId;
        }

        if (roomId) {
            where.roomId = roomId;
        }

        if (checkIn && checkOut) {
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);

            where.OR = [
                {
                    AND: [
                        {checkIn: {gte: checkInDate}},
                        {checkIn: {lte: checkOutDate}}
                    ]
                },
                {
                    AND: [
                        {checkOut: {gte: checkInDate}},
                        {checkOut: {lte: checkOutDate}}
                    ]
                },
                {
                    AND: [
                        {checkIn: {lte: checkInDate}},
                        {checkOut: {gte: checkOutDate}}
                    ]
                }
            ];
        }

        const [bookings, totalCount] = await Promise.all([
            prisma.booking.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true
                        }
                    },
                    room: {
                        include: {
                            roomType: {
                                select: {
                                    name: true,
                                    basePrice: true
                                }
                            }
                        }
                    }
                },
                orderBy: {createdAt: "desc"},
                skip,
                take: limit,
            }),
            prisma.booking.count({where}),
        ]);
        const bookingsWithDetails = bookings.map((booking) => ({
            ...booking,
            totalAmount: booking.totalAmount.toNumber(),
            room: {
                ...booking.room,
                roomType: {
                    ...booking.room.roomType,
                    basePrice: booking.room.roomType.basePrice.toNumber()
                }
            }
        })) as BookingWithDetails[];
        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json<ApiResponse<{
            bookings: BookingWithDetails[];
            pagination: {
                page: number;
                limit: number;
                totalCount: number;
                totalPages: number;
            };
        }>>({
            success: true,
            message: "Bookings retrieved successfully",
            data: {
                bookings: bookingsWithDetails,
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

        if (err instanceof ZodError) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid query parameters",
                data: null,
                errors: validationErrorFormat(err),
            }, {status: HttpStatusCode.BadRequest});
        }

        console.error("Error fetching bookings:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: {type: "ServerError"},
            data: null,
            success: false,
            message: "Error fetching bookings",
        }, {status: HttpStatusCode.InternalServerError});
    }
};
