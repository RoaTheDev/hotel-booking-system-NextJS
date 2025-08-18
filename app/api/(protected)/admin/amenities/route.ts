import {NextRequest, NextResponse} from "next/server";
import {AuthError, requireAdminAuth} from "@/middleware/auth";
import {prismaClient as prisma} from "@/lib/prismaClient";
import {ApiErrorResponse, ApiResponse} from "@/types/commonTypes";
import {HttpStatusCode} from "axios";
import {z, ZodError} from "zod";
import {validationErrorFormat} from "@/utils/zodErrorFormat";
import {Prisma} from "@/app/generated/prisma";
import AmenityWhereInput = Prisma.AmenityWhereInput;

const CreateAmenitySchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
    icon: z.string().optional(),
    description: z.string().max(255, "Description must be less than 255 characters").optional(),
    isActive: z.boolean().default(true),
});


export interface AmenityWithDetails {
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

export const GET = async (req: NextRequest) => {
    try {
        requireAdminAuth(req);

        const {searchParams} = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const includeDeleted = searchParams.get("includeDeleted") === "true";
        const includeInactive = searchParams.get("includeInactive") === "true";

        const skip = (page - 1) * limit;

        const where: AmenityWhereInput = {};
        if (!includeDeleted) {
            where.isDeleted = false;
        }
        if (!includeInactive) {
            where.isActive = true;
        }

        const [amenities, totalCount] = await Promise.all([
            prisma.amenity.findMany({
                where,
                include: {
                    _count: {
                        select: {rooms: true},
                    },
                },
                orderBy: {name: "asc"},
                skip,
                take: limit,
            }),
            prisma.amenity.count({where}),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json<ApiResponse<{
            amenities: AmenityWithDetails[];
            pagination: {
                page: number;
                limit: number;
                totalCount: number;
                totalPages: number;
            };
        }>>({
            success: true,
            message: "Amenities retrieved successfully",
            data: {
                amenities,
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

        console.error("Error fetching amenities:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: {type: "ServerError"},
            data: null,
            success: false,
            message: "Error fetching amenities",
        }, {status: HttpStatusCode.InternalServerError});
    }
};

export const POST = async (req: NextRequest) => {
    try {
        requireAdminAuth(req);
        const body = await req.json();
        const {name, icon, description, isActive} = CreateAmenitySchema.parse(body);

        // Check if amenity name already exists
        const existingAmenity = await prisma.amenity.findUnique({
            where: {name},
        });

        if (existingAmenity && !existingAmenity.isDeleted) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Amenity name already exists",
                data: null,
                errors: {type: "ValidationError"},
            }, {status: HttpStatusCode.Conflict});
        }

        const amenity = await prisma.amenity.create({
            data: {
                name,
                icon: icon || null,
                description: description || null,
                isActive,
                isDeleted: false,
            },
            include: {
                _count: {
                    select: {rooms: true},
                },
            },
        });

        return NextResponse.json<ApiResponse<AmenityWithDetails>>({
            success: true,
            message: "Amenity created successfully",
            data: amenity,
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

        console.error("Error creating amenity:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: {type: "ServerError"},
            data: null,
            success: false,
            message: "Error creating amenity",
        }, {status: HttpStatusCode.InternalServerError});
    }
};