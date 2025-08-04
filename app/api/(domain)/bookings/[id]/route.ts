import { NextRequest, NextResponse } from "next/server";
import { prismaClient as prisma } from "@/lib/prismaClient";
import { HttpStatusCode } from "axios";
import { ApiErrorResponse, ApiResponse } from "@/lib/types/commonTypes";
import { requireAuth, AuthError } from "@/lib/middleware/auth";
import { BookingWithDetails } from "@/lib/types/roomTypes";
import {$Enums, Prisma} from "@/app/generated/prisma";
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
