import {NextRequest, NextResponse} from "next/server";
import {prismaClient as prisma} from "@/lib/prismaClient";
import {HttpStatusCode} from "axios";
import {ApiErrorResponse, ApiResponse} from "@/lib/types/commonTypes";
import {AuthError, requireAdminAuth} from "@/lib/middleware/auth";
import {AdminDashboardStats, BookingWithDetails} from "@/lib/types/roomTypes";

export const GET = async (req: NextRequest) => {
    try {
        requireAdminAuth(req);

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        const [
            totalBookings,
            activeBookings,
            totalRooms,
            monthlyRevenue,
            averageRating,
            recentBookings,
            monthlyData
        ] = await Promise.all([
            prisma.booking.count({
                where: {createdAt: {gte: startOfYear}}
            }),

            prisma.booking.count({
                where: {
                    status: "CONFIRMED",
                    checkIn: {lte: now},
                    checkOut: {gte: now}
                }
            }),

            prisma.room.count({
                where: {
                    isActive: true,
                    isDeleted: false
                }
            }),

            prisma.booking.aggregate({
                where: {
                    createdAt: {gte: startOfMonth},
                    status: {in: ["CONFIRMED", "COMPLETED"]}
                },
                _sum: {totalAmount: true}
            }),
            4.8,

            prisma.booking.findMany({
                take: 10,
                orderBy: {createdAt: "desc"},
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

            Promise.all(
                Array.from({length: 6}, async (_, i) => {
                    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

                    const [revenue] = await Promise.all([
                        prisma.booking.aggregate({
                            where: {
                                createdAt: {gte: date, lt: nextMonth},
                                status: {in: ["CONFIRMED", "COMPLETED"]}
                            },
                            _sum: {totalAmount: true},
                            _count: true
                        }),
                        prisma.booking.count({
                            where: {
                                createdAt: {gte: date, lt: nextMonth}
                            }
                        })
                    ]);
                    return ({
                        month: date.toLocaleDateString('en-US', {month: 'short'}),
                        revenue: revenue._sum.totalAmount?.toNumber() || 0,
                        bookings: revenue._count,
                        occupancy: Math.floor(Math.random() * 20) + 75
                    });
                })
            )
        ]);

        const recentBookingsWithDetails = recentBookings.map(booking => ({
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

        const dashboardStats: AdminDashboardStats = {
            totalBookings,
            activeGuests: activeBookings,
            availableRooms: totalRooms - activeBookings,
            monthlyRevenue: monthlyRevenue._sum.totalAmount?.toNumber() || 0,
            occupancyRate: totalRooms > 0 ? Math.round((activeBookings / totalRooms) * 100) : 0,
            averageRating,
            recentBookings: recentBookingsWithDetails,
            revenueData: monthlyData.reverse()
        };

        return NextResponse.json<ApiResponse<AdminDashboardStats>>({
            success: true,
            message: "Dashboard data retrieved successfully",
            data: dashboardStats,
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

        console.error("Error fetching dashboard data:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: {type: "ServerError"},
            data: null,
            success: false,
            message: "Error fetching dashboard data",
        }, {status: HttpStatusCode.InternalServerError});
    }
};