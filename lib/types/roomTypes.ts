import { z } from "zod";
import {$Enums, Amenity, Room, RoomImage, RoomType} from "@/app/generated/prisma";
import BookingStatus = $Enums.BookingStatus;

export const RoomTypeSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    description: z.string().optional(),
    basePrice: z.number().positive("Base price must be positive"),
    maxGuests: z.number().int().positive("Max guests must be positive"),
    imageUrl: z.string().url().optional(),
});

export const CreateRoomSchema = z.object({
    roomNumber: z.string().min(1, "Room number is required").max(10),
    roomTypeId: z.number().int().positive(),
    floor: z.number().int().optional(),
});
export const ExtendedCreateRoomSchema = CreateRoomSchema.extend({
    imageUrls: z.array(z.string().url()).optional(),
    amenityIds: z.array(z.number().int().positive()).optional(),
});
export const UpdateRoomAvailabilitySchema = z.object({
    date: z.string().datetime(),
    isAvailable: z.boolean(),
    reason: z.string().optional(),
});

// Booking Types
export const CreateBookingSchema = z.object({
    roomId: z.number().int().positive(),
    checkIn: z.string().datetime(),
    checkOut: z.string().datetime(),
    guests: z.number().int().positive().default(1),
    specialRequests: z.string().optional(),
});

export const UpdateBookingStatusSchema = z.object({
    status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]),
});

// Query Params
export const RoomQuerySchema = z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
    sortBy: z.enum(["price", "rating", "name", "createdAt"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    minPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    maxPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    maxGuests: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    available: z.string().optional().transform(val => val === "true"),
    checkIn: z.string().optional(),
    checkOut: z.string().optional(),
    search: z.string().optional(),

});

export const BookingQuerySchema = z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
    status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "ALL"]).optional().default("ALL"),
    userId: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    roomId: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    checkIn: z.string().optional(),
    checkOut: z.string().optional(),
});

// Response Types
export interface RoomWithDetails {
    id: number;
    roomNumber: string;
    floor: number | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    roomType: {
        id: number;
        name: string;
        description: string | null;
        basePrice: number;
        maxGuests: number;
        imageUrl: string | null;
    };
    amenities: Array<{
        amenity: {
            id: number;
            name: string;
            icon: string | null;
            description: string | null;
        };
    }>;
    images: Array<{
        id: number;
        imageUrl: string;
        caption: string | null;
    }>;

}

export interface BookingWithDetails {
    id: number;
    checkIn: Date;
    checkOut: Date;
    guests: number;
    totalAmount: number;
    status: BookingStatus;
    specialRequests: string | null;
    createdAt: Date;
    updatedAt: Date;
    user: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        phone: string | null;
    };
    room: {
        id: number;
        roomNumber: string;
        roomType: {
            name: string;
            basePrice: number;
        };
    };
}

export interface AdminDashboardStats {
    totalBookings: number;
    activeGuests: number;
    availableRooms: number;
    monthlyRevenue: number;
    occupancyRate: number;
    averageRating: number;
    recentBookings: BookingWithDetails[];
    revenueData: Array<{
        month: string;
        revenue: number;
        bookings: number;
        occupancy: number;
    }>;
}

export const BookingCreateSchema = z.object({
    userId: z.number().int().positive(),
    roomId: z.number().int().positive(),
    checkIn: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid check-in date" }),
    checkOut: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid check-out date" }),
    guests: z.number().int().positive(),
    specialRequests: z.string().optional(),
});

export interface RouteParams {
    params: { id: string };
}
export type CreateRoomTypeData = z.infer<typeof RoomTypeSchema>;
export type CreateRoomData = z.infer<typeof CreateRoomSchema>;
export type CreateBookingData = z.infer<typeof CreateBookingSchema>;
export type UpdateBookingStatusData = z.infer<typeof UpdateBookingStatusSchema>;
export type RoomQuery = z.infer<typeof RoomQuerySchema>;
export type BookingQuery = z.infer<typeof BookingQuerySchema>;
export type RoomTypeWithDetails = RoomType & {
    rooms: Array<Room & {
        amenities: { amenity: Amenity }[];
        images: RoomImage[];
        _count: { bookings: number };
    }>;
    _count: { rooms: number };
};