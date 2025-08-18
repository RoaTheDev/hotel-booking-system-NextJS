import {NextRequest, NextResponse} from "next/server";
import {AuthError, requireAdminAuth} from "@/middleware/auth";
import {prismaClient as prisma} from "@/lib/prismaClient";
import {ApiErrorResponse, ApiResponse} from "@/types/commonTypes";
import {HttpStatusCode} from "axios";
import {ZodError, z} from "zod";
import {validationErrorFormat} from "@/utils/zodErrorFormat";

const CreateRoomTypeSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
    description: z.string().optional(),
    basePrice: z.number().positive("Base price must be positive"),
    maxGuests: z.number().int().positive("Max guests must be a positive integer"),
    imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});


interface RoomTypeWithDetails {
    id: number;
    name: string;
    description: string | null;
    basePrice: number;
    maxGuests: number;
    imageUrl: string | null;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count?: {
        rooms: number;
    };
}

export const GET = async (req: NextRequest) => {
    try {
        requireAdminAuth(req);

        const {searchParams} = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const includeDeleted = searchParams.get("includeDeleted") === "true";

        const skip = (page - 1) * limit;
        const where = includeDeleted ? {} : {isDeleted: false};

        const [roomTypes, totalCount] = await Promise.all([
            prisma.roomType.findMany({
                where,
                include: {
                    _count: {
                        select: {rooms: true},
                    },
                },
                orderBy: {createdAt: "desc"},
                skip,
                take: limit,
            }),
            prisma.roomType.count({where}),
        ]);

        const formattedRoomTypes: RoomTypeWithDetails[] = roomTypes.map(roomType => ({
            ...roomType,
            basePrice: roomType.basePrice.toNumber(),
        }));

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json<ApiResponse<{
            roomTypes: RoomTypeWithDetails[];
            pagination: {
                page: number;
                limit: number;
                totalCount: number;
                totalPages: number;
            };
        }>>({
            success: true,
            message: "Room types retrieved successfully",
            data: {
                roomTypes: formattedRoomTypes,
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

        console.error("Error fetching room types:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: {type: "ServerError"},
            data: null,
            success: false,
            message: "Error fetching room types",
        }, {status: HttpStatusCode.InternalServerError});
    }
};

export const POST = async (req: NextRequest) => {
    try {
        requireAdminAuth(req);
        const body = await req.json();
        const {name, description, basePrice, maxGuests, imageUrl} = CreateRoomTypeSchema.parse(body);

        // Check if room type name already exists
        const existingRoomType = await prisma.roomType.findUnique({
            where: {name},
        });

        if (existingRoomType && !existingRoomType.isDeleted) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Room type name already exists",
                data: null,
                errors: {type: "ValidationError"},
            }, {status: HttpStatusCode.Conflict});
        }

        const roomType = await prisma.roomType.create({
            data: {
                name,
                description: description || null,
                basePrice,
                maxGuests,
                imageUrl: imageUrl || null,
                isDeleted: false,
            },
            include: {
                _count: {
                    select: {rooms: true},
                },
            },
        });

        const formattedRoomType: RoomTypeWithDetails = {
            ...roomType,
            basePrice: Number(roomType.basePrice),
        };

        return NextResponse.json<ApiResponse<RoomTypeWithDetails>>({
            success: true,
            message: "Room type created successfully",
            data: formattedRoomType,
        });

    } catch (err) {
        if (err instanceof ZodError) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid input data",
                data: null,
                errors: validationErrorFormat(err),
            }, {status: HttpStatusCode.BadRequest});
        }

        console.error("Error creating room type:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: {type: "ServerError"},
            data: null,
            success: false,
            message: "Error creating room type",
        }, {status: HttpStatusCode.InternalServerError});
    }
};