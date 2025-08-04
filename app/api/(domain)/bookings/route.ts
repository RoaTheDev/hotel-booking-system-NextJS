import {NextRequest, NextResponse} from "next/server";
import {prismaClient as prisma} from "@/lib/prismaClient";
import {HttpStatusCode} from "axios";
import {ZodError} from "zod";
import {ApiErrorResponse, ApiResponse} from "@/lib/types/commonTypes";
import {validationErrorFormat} from "@/lib/zodErrorFormat";
import {AuthError, requireAuth} from "@/lib/middleware/auth";
import {BookingWithDetails, CreateBookingData, CreateBookingSchema} from "@/lib/types/roomTypes";
import {BookingStatus, Prisma} from "@/app/generated/prisma";
import BookingWhereInput = Prisma.BookingWhereInput;


export const GET = async (req: NextRequest) => {
    try {
        const user = requireAuth(req);

        const {searchParams} = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const status = searchParams.get("status") || "";

        const skip = (page - 1) * limit;

        const where: BookingWhereInput = {userId: user.userId};

        if (status && status !== "ALL") {
            where.status = status as BookingStatus;
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
                bookings: bookings.map(booking => ({
                    ...booking,
                    totalAmount: booking.totalAmount.toNumber(),
                    room: {
                        ...booking.room,
                        roomType: {
                            ...booking.room.roomType,
                            basePrice: booking.room.roomType.basePrice.toNumber(),
                        },
                    },
                })),
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

        console.error("Error fetching bookings:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: {type: "ServerError"},
            data: null,
            success: false,
            message: "Error fetching bookings",
        }, {status: HttpStatusCode.InternalServerError});
    }
};

export const POST = async (req: NextRequest) => {
    try {
        const user = requireAuth(req);

        const body: CreateBookingData = await req.json();
        const validatedData = CreateBookingSchema.parse(body);

        const checkInDate = new Date(validatedData.checkIn);
        const checkOutDate = new Date(validatedData.checkOut);

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

        // Fetch the room details
        const room = await prisma.room.findFirst({
            where: {
                id: validatedData.roomId,
                isActive: true,
                isDeleted: false
            },
            include: {
                roomType: true
            }
        });

        if (!room) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Room not found or not available",
                data: null,
                errors: {type: "NotFound"},
            }, {status: HttpStatusCode.NotFound});
        }

        if (validatedData.guests > room.roomType.maxGuests) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: `Room can only accommodate ${room.roomType.maxGuests} guests`,
                data: null,
                errors: {type: "ValidationError"},
            }, {status: HttpStatusCode.BadRequest});
        }

        // Check for conflicting bookings
        const conflictingBooking = await prisma.booking.findFirst({
            where: {
                roomId: validatedData.roomId,
                status: {not: "CANCELLED"},
                OR: [
                    {
                        AND: [
                            {checkIn: {lte: checkInDate}},
                            {checkOut: {gt: checkInDate}}
                        ]
                    },
                    {
                        AND: [
                            {checkIn: {lt: checkOutDate}},
                            {checkOut: {gte: checkOutDate}}
                        ]
                    },
                    {
                        AND: [
                            {checkIn: {gte: checkInDate}},
                            {checkOut: {lte: checkOutDate}}
                        ]
                    }
                ]
            }
        });

        if (conflictingBooking) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Room is not available for the selected dates",
                data: null,
                errors: {type: "ValidationError"},
            }, {status: HttpStatusCode.BadRequest});
        }

        const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
        const totalAmount = room.roomType.basePrice.toNumber() * nights;  // Ensure totalAmount is a number

        // Create the new booking
        const newBooking = await prisma.booking.create({
            data: {
                userId: user.userId,
                roomId: validatedData.roomId,
                checkIn: checkInDate,
                checkOut: checkOutDate,
                guests: validatedData.guests,
                totalAmount: totalAmount,
                specialRequests: validatedData.specialRequests,
                status: "PENDING" as BookingStatus,
            },
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
            }
        });

        // Format the new booking data to ensure Decimal fields are converted to numbers
        const formatBookingData = {
            ...newBooking,
            totalAmount: newBooking.totalAmount.toNumber(),  // Convert totalAmount to number
            room: {
                ...newBooking.room,
                roomType: {
                    ...newBooking.room.roomType,
                    basePrice: newBooking.room.roomType.basePrice.toNumber(),  // Convert basePrice to number
                },
            },
        };

        // Log the booking status
        await prisma.bookingStatusLog.create({
            data: {
                bookingId: newBooking.id,
                status: "PENDING" as BookingStatus,
            }
        });

        return NextResponse.json<ApiResponse<BookingWithDetails>>({
            success: true,
            message: "Booking created successfully",
            data: formatBookingData,
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

        if (err instanceof ZodError) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid input data",
                data: null,
                errors: validationErrorFormat(err),
            }, {status: HttpStatusCode.BadRequest});
        }

        console.error("Error creating booking:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: {type: "ServerError"},
            data: null,
            success: false,
            message: "Error creating booking",
        }, {status: HttpStatusCode.InternalServerError});
    }
};
