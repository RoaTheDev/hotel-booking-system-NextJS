import {AuthError, requireAdminAuth} from "@/middleware/auth";
import {ApiErrorResponse, ApiResponse} from "@/types/commonTypes";
import {HttpStatusCode} from "axios";
import {NextRequest, NextResponse} from "next/server";
import {prismaClient as prisma} from "@/lib/prismaClient";
import z from "zod";
import {RoomImage} from "@/app/generated/prisma";

const addMultipleImagesSchema = z.object({
    images: z.array(z.object({
        imageUrl: z.string().url("Invalid image URL").max(255, "Image URL too long"),
        caption: z.string().max(255, "Caption too long").optional().nullable(),
    })).min(1, "At least one image is required").max(10, "Maximum 10 images allowed"),
});

interface AddMultipleImagesRequest {
    images: Array<{
        imageUrl: string;
        caption?: string | null;
    }>;
}

// POST /api/admin/rooms/[roomId]/images/bulk

export const POST = async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
        requireAdminAuth(req);

        const roomId = parseInt(params.id);
        if (isNaN(roomId)) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid room ID",
                data: null,
                errors: { type: "ValidationError" },
            }, { status: HttpStatusCode.BadRequest });
        }

        const body: AddMultipleImagesRequest = await req.json();

        const validationResult = addMultipleImagesSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Validation failed",
                data: null,
                errors: {
                    type: "ValidationError",
                },
            }, { status: HttpStatusCode.BadRequest });
        }

        const { images } = validationResult.data;

        // Verify room exists and is not deleted
        const room = await prisma.room.findUnique({
            where: { id: roomId, isDeleted: false },
            select: { id: true, roomNumber: true }
        });

        if (!room) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Room not found",
                data: null,
                errors: { type: "NotFoundError" },
            }, { status: HttpStatusCode.NotFound });
        }

        // Check for duplicate URLs in the request
        const imageUrls = images.map(img => img.imageUrl);
        const uniqueUrls = new Set(imageUrls);
        if (uniqueUrls.size !== imageUrls.length) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Duplicate image URLs in request",
                data: null,
                errors: { type: "ValidationError" },
            }, { status: HttpStatusCode.BadRequest });
        }

        // Check if any image URLs already exist for this room
        const existingImages = await prisma.roomImage.findMany({
            where: {
                roomId,
                imageUrl: { in: imageUrls }
            },
            select: { imageUrl: true }
        });

        if (existingImages.length > 0) {
            const existingUrls = existingImages.map(img => img.imageUrl);
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: `Image URLs already exist: ${existingUrls.join(', ')}`,
                data: null,
                errors: { type: "ConflictError" },
            }, { status: HttpStatusCode.Conflict });
        }

        const newImages = await prisma.roomImage.createManyAndReturn({
            data: images.map(img => ({
                roomId,
                imageUrl: img.imageUrl,
                caption: img.caption || null,
            }))
        });

        return NextResponse.json<ApiResponse<RoomImage[]>>({
            success: true,
            message: `${newImages.length} room images added successfully`,
            data: newImages,
        }, { status: HttpStatusCode.Created });

    } catch (err) {
        if (err instanceof AuthError) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: err.message,
                data: null,
                errors: { type: "AuthError" },
            }, { status: err.statusCode });
        }

        console.error("Error adding multiple room images:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: { type: "ServerError" },
            data: null,
            success: false,
            message: "Error adding multiple room images",
        }, { status: HttpStatusCode.InternalServerError });
    }
}