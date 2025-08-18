// /api/admin/rooms/[Imageid]/images/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prismaClient as prisma } from "@/lib/prismaClient";
import { HttpStatusCode } from "axios";
import { ApiErrorResponse, ApiResponse } from "@/types/commonTypes";
import { AuthError, requireAdminAuth } from "@/middleware/auth";
import { z } from "zod";

interface RoomImage {
    id: number;
    roomId: number;
    imageUrl: string;
    caption: string | null;
    createdAt: Date;
}

// GET /api/admin/rooms/[Imageid]/images
export const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
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

        // Verify room exists
        const room = await prisma.room.findUnique({
            where: { id: roomId, isDeleted: false },
            select: { id: true }
        });

        if (!room) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Room not found",
                data: null,
                errors: { type: "NotFoundError" },
            }, { status: HttpStatusCode.NotFound });
        }

        const images = await prisma.roomImage.findMany({
            where: { roomId },
            orderBy: { createdAt: 'asc' }
        });

        return NextResponse.json<ApiResponse<RoomImage[]>>({
            success: true,
            message: "Room images retrieved successfully",
            data: images,
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

        console.error("Error fetching room images:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: { type: "ServerError" },
            data: null,
            success: false,
            message: "Error fetching room images",
        }, { status: HttpStatusCode.InternalServerError });
    }
}

const addRoomImageSchema = z.object({
    imageUrl: z.string().url("Invalid image URL").max(255, "Image URL too long"),
    caption: z.string().max(255, "Caption too long").optional().nullable(),
});

interface AddRoomImageRequest {
    imageUrl: string;
    caption?: string | null;
}

// POST /api/admin/rooms/[Imageid]/images
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

        const body: AddRoomImageRequest = await req.json();

        const validationResult = addRoomImageSchema.safeParse(body);
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

        const { imageUrl, caption } = validationResult.data;

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

        // Check if image URL already exists for this room
        const existingImage = await prisma.roomImage.findFirst({
            where: {
                roomId,
                imageUrl
            }
        });

        if (existingImage) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Image URL already exists for this room",
                data: null,
                errors: { type: "ConflictError" },
            }, { status: HttpStatusCode.Conflict });
        }

        const newImage = await prisma.roomImage.create({
            data: {
                roomId,
                imageUrl,
                caption: caption || null,
            }
        });

        return NextResponse.json<ApiResponse<RoomImage>>({
            success: true,
            message: "Room image added successfully",
            data: newImage,
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

        console.error("Error adding room image:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: { type: "ServerError" },
            data: null,
            success: false,
            message: "Error adding room image",
        }, { status: HttpStatusCode.InternalServerError });
    }
}

