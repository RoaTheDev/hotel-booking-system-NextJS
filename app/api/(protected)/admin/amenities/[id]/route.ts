import {NextRequest, NextResponse} from "next/server";
import {AuthError, requireAdminAuth} from "@/middleware/auth";
import {prismaClient as prisma} from "@/lib/prismaClient";
import {ApiErrorResponse, ApiResponse} from "@/types/commonTypes";
import {HttpStatusCode} from "axios";
import {ZodError, z} from "zod";
import {validationErrorFormat} from "@/utils/zodErrorFormat";

const UpdateAmenitySchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters").optional(),
    icon: z.string().optional(),
    description: z.string().max(255, "Description must be less than 255 characters").optional(),
    isActive: z.boolean().optional(),
});

interface AmenityWithDetails {
    id: number;
    name: string;
    icon: string | null;
    description: string | null;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count?: {
        rooms: number;
    };
}

export const GET = async (req: NextRequest, {params}: {params: {id: string}}) => {
    try {
        requireAdminAuth(req);

        const amenityId = parseInt(params.id);
        if (isNaN(amenityId)) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid amenity ID",
                data: null,
                errors: {type: "ValidationError"},
            }, {status: HttpStatusCode.BadRequest});
        }

        const amenity = await prisma.amenity.findUnique({
            where: {
                id: amenityId,
                isDeleted: false,
            },
            include: {
                _count: {
                    select: {rooms: true},
                },
                rooms: {
                    where: {
                        room: {isDeleted: false},
                    },
                    include: {
                        room: {
                            select: {
                                id: true,
                                roomNumber: true,
                                isActive: true,
                            },
                        },
                    },
                },
            },
        });

        if (!amenity) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Amenity not found",
                data: null,
                errors: {type: "NotFound"},
            }, {status: HttpStatusCode.NotFound});
        }

        return NextResponse.json<ApiResponse<typeof amenity>>({
            success: true,
            message: "Amenity retrieved successfully",
            data: amenity,
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

        console.error("Error fetching amenity:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: {type: "ServerError"},
            data: null,
            success: false,
            message: "Error fetching amenity",
        }, {status: HttpStatusCode.InternalServerError});
    }
};

export const PUT = async (req: NextRequest, {params}: {params: {id: string}}) => {
    try {
        requireAdminAuth(req);

        const amenityId = parseInt(params.id);
        if (isNaN(amenityId)) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid amenity ID",
                data: null,
                errors: {type: "ValidationError"},
            }, {status: HttpStatusCode.BadRequest});
        }

        const body = await req.json();
        const validatedData = UpdateAmenitySchema.parse(body);

        // Check if amenity exists
        const existingAmenity = await prisma.amenity.findUnique({
            where: {
                id: amenityId,
                isDeleted: false,
            },
        });

        if (!existingAmenity) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Amenity not found",
                data: null,
                errors: {type: "NotFound"},
            }, {status: HttpStatusCode.NotFound});
        }

        // Check if new name conflicts with existing amenity (if name is being changed)
        if (validatedData.name && validatedData.name !== existingAmenity.name) {
            const nameConflict = await prisma.amenity.findUnique({
                where: {name: validatedData.name},
            });

            if (nameConflict && nameConflict.id !== amenityId && !nameConflict.isDeleted) {
                return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                    success: false,
                    message: "Amenity name already exists",
                    data: null,
                    errors: {type: "ValidationError"},
                }, {status: HttpStatusCode.Conflict});
            }
        }

        const updatedAmenity = await prisma.amenity.update({
            where: {id: amenityId},
            data: {
                ...validatedData,
                updatedAt: new Date(),
            },
            include: {
                _count: {
                    select: {rooms: true},
                },
            },
        });

        return NextResponse.json<ApiResponse<AmenityWithDetails>>({
            success: true,
            message: "Amenity updated successfully",
            data: updatedAmenity,
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

        if (err instanceof AuthError) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: err.message,
                data: null,
                errors: {type: "AuthError"},
            }, {status: err.statusCode});
        }

        console.error("Error updating amenity:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: {type: "ServerError"},
            data: null,
            success: false,
            message: "Error updating amenity",
        }, {status: HttpStatusCode.InternalServerError});
    }
};

export const DELETE = async (req: NextRequest, {params}: {params: {id: string}}) => {
    try {
        requireAdminAuth(req);

        const amenityId = parseInt(params.id);
        if (isNaN(amenityId)) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid amenity ID",
                data: null,
                errors: {type: "ValidationError"},
            }, {status: HttpStatusCode.BadRequest});
        }

        // Check if amenity exists
        const existingAmenity = await prisma.amenity.findUnique({
            where: {
                id: amenityId,
                isDeleted: false,
            },
            include: {
                _count: {
                    select: {rooms: true},
                },
            },
        });

        if (!existingAmenity) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Amenity not found",
                data: null,
                errors: {type: "NotFound"},
            }, {status: HttpStatusCode.NotFound});
        }

        // Check if amenity is being used by any rooms
        if (existingAmenity._count.rooms > 0) {
            const activeRoomCount = await prisma.roomAmenity.count({
                where: {
                    amenityId: amenityId,
                    room: {isDeleted: false},
                },
            });

            if (activeRoomCount > 0) {
                return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                    success: false,
                    message: `Cannot delete amenity. ${activeRoomCount} room(s) are still using this amenity.`,
                    data: null,
                    errors: {type: "ValidationError"},
                }, {status: HttpStatusCode.BadRequest});
            }
        }

        // Soft delete the amenity
        await prisma.amenity.update({
            where: {id: amenityId},
            data: {
                isDeleted: true,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json<ApiResponse<null>>({
            success: true,
            message: "Amenity deleted successfully",
            data: null,
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

        console.error("Error deleting amenity:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: {type: "ServerError"},
            data: null,
            success: false,
            message: "Error deleting amenity",
        }, {status: HttpStatusCode.InternalServerError});
    }
};