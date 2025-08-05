import {NextRequest, NextResponse} from "next/server";
import {prismaClient as prisma} from "@/lib/prismaClient";
import {HttpStatusCode} from "axios";
import {ApiErrorResponse, ApiResponse} from "@/lib/types/commonTypes";
import {AuthError, requireAdminAuth, requireAuth} from "@/lib/middleware/auth";
import {BookingWithDetails} from "@/lib/types/roomTypes";
import {$Enums, BookingStatus, Prisma} from "@/app/generated/prisma";
import {z, ZodError} from "zod";
import {validationErrorFormat} from "@/lib/zodErrorFormat";
import Role = $Enums.Role;
import BookingWhereInput = Prisma.BookingWhereInput;

interface RouteParams {
    params: { id: string };
}
export const GET = async (req: NextRequest, { params }: RouteParams) => {
    try {
        const user = requireAuth(req);

        const bookingId = parseInt(params.id);
        if (isNaN(bookingId)) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid booking ID",
                data: null,
                errors: { type: "ValidationError" },
            }, { status: HttpStatusCode.BadRequest });
        }

        const where: BookingWhereInput = { id: bookingId };
        if (user.role !== Role.ADMIN) {
            where.userId = user.userId;
        }

        const booking = await prisma.booking.findFirst({
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
            }
        });

        if (!booking) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Booking not found",
                data: null,
                errors: { type: "NotFound" },
            }, { status: HttpStatusCode.NotFound });
        }

        const formattedBooking = {
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
            message: "Booking retrieved successfully",
            data: formattedBooking as BookingWithDetails,
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

        console.error("Error fetching booking:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: { type: "ServerError" },
            data: null,
            success: false,
            message: "Error fetching booking",
        }, { status: HttpStatusCode.InternalServerError });
    }
};

export const DELETE = async (req: NextRequest, { params }: RouteParams) => {
    try {
        const user = requireAuth(req);

        const bookingId = parseInt(params.id);
        if (isNaN(bookingId)) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid booking ID",
                data: null,
                errors: { type: "ValidationError" },
            }, { status: HttpStatusCode.BadRequest });
        }

        const where: BookingWhereInput = { id: bookingId };
        if (user.role !== Role.ADMIN) {
            where.userId = user.userId;
        }

        const booking = await prisma.booking.findFirst({ where });

        if (!booking) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Booking not found",
                data: null,
                errors: { type: "NotFound" },
            }, { status: HttpStatusCode.NotFound });
        }

        if (booking.status === "CANCELLED") {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Booking is already cancelled",
                data: null,
                errors: { type: "ValidationError" },
            }, { status: HttpStatusCode.BadRequest });
        }

        if (booking.status === "COMPLETED") {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Cannot cancel completed booking",
                data: null,
                errors: { type: "ValidationError" },
            }, { status: HttpStatusCode.BadRequest });
        }

        const [cancelledBooking] = await Promise.all([
            prisma.booking.update({
                where: { id: bookingId },
                data: { status: "CANCELLED" },
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
            }),
            prisma.bookingStatusLog.create({
                data: {
                    bookingId: bookingId,
                    status: "CANCELLED"
                }
            })
        ]);

        const formattedCancelledBooking = {
            ...cancelledBooking,
            totalAmount: cancelledBooking.totalAmount.toNumber(),
            room: {
                ...cancelledBooking.room,
                roomType: {
                    ...cancelledBooking.room.roomType,
                    basePrice: cancelledBooking.room.roomType.basePrice.toNumber(),
                },
            },
        };

        return NextResponse.json<ApiResponse<BookingWithDetails>>({
            success: true,
            message: "Booking cancelled successfully",
            data: formattedCancelledBooking as BookingWithDetails,
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

        console.error("Error cancelling booking:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: { type: "ServerError" },
            data: null,
            success: false,
            message: "Error cancelling booking",
        }, { status: HttpStatusCode.InternalServerError });
    }
};

const BookingStatusUpdateSchema = z.object({
    status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"], {
        errorMap: () => ({ message: "Status must be PENDING, CONFIRMED, CANCELLED, or COMPLETED" })
    }),
    reason: z.string()
        .max(255, { message: "Reason cannot exceed 255 characters" })
        .optional()
        .transform(val => val?.trim() || undefined),
    checkInTime: z.string()
        .refine(val => !isNaN(Date.parse(val)), { message: "Invalid check-in time format" })
        .optional(),
    checkOutTime: z.string()
        .refine(val => !isNaN(Date.parse(val)), { message: "Invalid check-out time format" })
        .optional(),
});

export const PATCH = async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
        requireAdminAuth(req);

        const bookingId = parseInt(params.id);
        if (isNaN(bookingId) || bookingId <= 0) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid booking ID",
                data: null,
                errors: { type: "ValidationError" },
            }, { status: HttpStatusCode.BadRequest });
        }

        const body = await req.json();
        const { status, reason, checkInTime, checkOutTime } = BookingStatusUpdateSchema.parse(body);

        const existingBooking = await prisma.booking.findUnique({
            where: { id: bookingId },
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

        if (!existingBooking) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Booking not found",
                data: null,
                errors: { type: "NotFound" },
            }, { status: HttpStatusCode.NotFound });
        }

        const validTransitions: Record<BookingStatus, BookingStatus[]> = {
            PENDING: ["CONFIRMED", "CANCELLED"],
            CONFIRMED: ["COMPLETED", "CANCELLED"],
            CANCELLED: [],
            COMPLETED: [],
        };

        if (!validTransitions[existingBooking.status].includes(status)) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: `Cannot change status from ${existingBooking.status} to ${status}`,
                data: null,
                errors: { type: "ValidationError" },
            }, { status: HttpStatusCode.BadRequest });
        }

        const updateData: BookingUpdateData = {
            status,
            updatedAt: new Date(),
        };

        if (status === "CONFIRMED" && checkInTime) {
            updateData.checkInTime = new Date(checkInTime);
        }

        if (status === "COMPLETED" && checkOutTime) {
            updateData.checkOutTime = new Date(checkOutTime);
        }

        if (status === "CONFIRMED" && !checkInTime) {
            updateData.checkInTime = new Date();
        }

        if (status === "COMPLETED" && !checkOutTime) {
            updateData.checkOutTime = new Date();
        }

        const updatedBooking = await prisma.$transaction(async (tx) => {
            const booking = await tx.booking.update({
                where: { id: bookingId },
                data: updateData,
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

            await tx.bookingStatusLog.create({
                data: {
                    bookingId,
                    status,
                },
            });

            if (status === "CANCELLED") {
                await tx.roomAvailability.updateMany({
                    where: {
                        roomId: existingBooking.roomId,
                        date: {
                            gte: existingBooking.checkIn,
                            lte: existingBooking.checkOut,
                        },
                    },
                    data: {
                        isAvailable: true,
                        reason: null,
                    },
                });
            } else if (status === "CONFIRMED") {
                await tx.roomAvailability.updateMany({
                    where: {
                        roomId: existingBooking.roomId,
                        date: {
                            gte: existingBooking.checkIn,
                            lte: existingBooking.checkOut,
                        },
                    },
                    data: {
                        isAvailable: false,
                        reason: `Booked by ${existingBooking.user.firstName} ${existingBooking.user.lastName}`,
                    },
                });
            }

            return booking;
        });

        // Format the response data
        const formatBookingData: BookingWithDetails = {
            ...updatedBooking,
            totalAmount: updatedBooking.totalAmount.toNumber(),
            room: {
                ...updatedBooking.room,
                roomType: {
                    ...updatedBooking.room.roomType,
                    basePrice: updatedBooking.room.roomType.basePrice.toNumber(),
                },
            },
        };

        return NextResponse.json<ApiResponse<BookingWithDetails>>({
            success: true,
            message: `Booking status updated to ${status}${reason ? ` - ${reason}` : ''}`,
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

        console.error("Error updating booking status:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            success: false,
            message: "Error updating booking status",
            data: null,
            errors: { type: "ServerError" },
        }, { status: HttpStatusCode.InternalServerError });
    }
};

type BookingUpdateData = {
    status: BookingStatus;
    updatedAt: Date;
    checkInTime?: Date;
    checkOutTime?: Date;
};

export type BookingStatusUpdateData = z.infer<typeof BookingStatusUpdateSchema>;