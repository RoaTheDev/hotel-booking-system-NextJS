import {NextRequest, NextResponse} from "next/server";
import {prismaClient as prisma} from "@/lib/prismaClient";
import {HttpStatusCode} from "axios";
import {ApiErrorResponse, ApiResponse} from "@/lib/types/commonTypes";
import {Amenity, Prisma} from "@/app/generated/prisma";
import {z, ZodError} from "zod";
import {validationErrorFormat} from "@/lib/zodErrorFormat";
import {AuthError, requireAdminAuth} from "@/lib/middleware/auth";
import AmenityWhereInput = Prisma.AmenityWhereInput;

const AmenitySchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    icon: z.string().optional(),
    description: z.string().optional(),
});

export const GET = async (req: NextRequest) => {
    try {
        requireAdminAuth(req)
        const {searchParams} = new URL(req.url);
        const includeDeleted = searchParams.get("includeDeleted") === "true";
        const activeOnly = searchParams.get("activeOnly") === "true";

        const where: AmenityWhereInput = {};

        if (!includeDeleted) {
            where.isDeleted = false;
        }

        if (activeOnly) {
            where.isActive = true;
        }

        const amenities = await prisma.amenity.findMany({
            where,
            include: {
                _count: {
                    select: {rooms: true}
                }
            },
            orderBy: {createdAt: "desc"}
        });

        return NextResponse.json<ApiResponse<{
            amenities: (Amenity & { _count: { rooms: number } })[];
        }>>({
            success: true,
            message: "Amenities retrieved successfully",
            data: {amenities},
        });

    } catch (err) {
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
        const validatedData = AmenitySchema.parse(body);

        const existingAmenity = await prisma.amenity.findFirst({
            where: {
                name: validatedData.name,
                isDeleted: false
            }
        });

        if (existingAmenity) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Amenity name already exists",
                data: null,
                errors: {type: "ValidationError"},
            }, {status: HttpStatusCode.BadRequest});
        }

        const newAmenity = await prisma.amenity.create({
            data: validatedData,
            include: {
                _count: {
                    select: {rooms: true}
                }
            }
        });

        return NextResponse.json<ApiResponse<Amenity & { _count: { rooms: number } }>>({
            success: true,
            message: "Amenity created successfully",
            data: newAmenity,
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

        console.error("Error creating amenity:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: {type: "ServerError"},
            data: null,
            success: false,
            message: "Error creating amenity",
        }, {status: HttpStatusCode.InternalServerError});
    }
};
