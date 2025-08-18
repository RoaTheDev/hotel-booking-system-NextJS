// /api/admin/rooms/[roomId]/images/[imageId]/route.ts
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

// GET /api/admin/rooms/[roomId]/images/[imageId]
export const GET = async (req: NextRequest, { params }: { params: { id: string; imageId: string } }) => {
    try {
        requireAdminAuth(req);

        const roomId = parseInt(params.id);
        const imageId = parseInt(params.imageId);

        if (isNaN(roomId) || isNaN(imageId)) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid room ID or image ID",
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

        const image = await prisma.roomImage.findUnique({
            where: {
                id: imageId,
                roomId: roomId
            }
        });

        if (!image) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Room image not found",
                data: null,
                errors: { type: "NotFoundError" },
            }, { status: HttpStatusCode.NotFound });
        }

        return NextResponse.json<ApiResponse<RoomImage>>({
            success: true,
            message: "Room image retrieved successfully",
            data: image,
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

        console.error("Error fetching room image:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: { type: "ServerError" },
            data: null,
            success: false,
            message: "Error fetching room image",
        }, { status: HttpStatusCode.InternalServerError });
    }
}

const updateRoomImageSchema = z.object({
    imageUrl: z.string().url("Invalid image URL").max(255, "Image URL too long").optional(),
    caption: z.string().max(255, "Caption too long").optional().nullable(),
});

interface UpdateRoomImageRequest {
    imageUrl?: string;
    caption?: string | null;
}

// PUT /api/admin/rooms/[roomId]/images/[imageId]
export const PUT = async (req: NextRequest, { params }: { params: { id: string; imageId: string } }) => {
    try {
        requireAdminAuth(req);

        const roomId = parseInt(params.id);
        const imageId = parseInt(params.imageId);

        if (isNaN(roomId) || isNaN(imageId)) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid room ID or image ID",
                data: null,
                errors: { type: "ValidationError" },
            }, { status: HttpStatusCode.BadRequest });
        }

        const body: UpdateRoomImageRequest = await req.json();

        const validationResult = updateRoomImageSchema.safeParse(body);
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

        const updateData = validationResult.data;

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

        // Verify image exists and belongs to the room
        const existingImage = await prisma.roomImage.findUnique({
            where: {
                id: imageId,
                roomId: roomId
            }
        });

        if (!existingImage) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Room image not found",
                data: null,
                errors: { type: "NotFoundError" },
            }, { status: HttpStatusCode.NotFound });
        }

        // Check for URL conflicts (if updating URL)
        if (updateData.imageUrl && updateData.imageUrl !== existingImage.imageUrl) {
            const urlConflict = await prisma.roomImage.findFirst({
                where: {
                    roomId,
                    imageUrl: updateData.imageUrl,
                    id: { not: imageId }
                }
            });

            if (urlConflict) {
                return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                    success: false,
                    message: "Image URL already exists for this room",
                    data: null,
                    errors: { type: "ConflictError" },
                }, { status: HttpStatusCode.Conflict });
            }
        }

        // Prepare update data
        const updateFields: UpdateRoomImageRequest = {};
        if (updateData.imageUrl !== undefined) updateFields.imageUrl = updateData.imageUrl;
        if (updateData.caption !== undefined) updateFields.caption = updateData.caption;

        if (Object.keys(updateFields).length === 0) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "No valid fields to update",
                data: null,
                errors: { type: "ValidationError" },
            }, { status: HttpStatusCode.BadRequest });
        }

        const updatedImage = await prisma.roomImage.update({
            where: { id: imageId },
            data: updateFields
        });

        return NextResponse.json<ApiResponse<RoomImage>>({
            success: true,
            message: "Room image updated successfully",
            data: updatedImage,
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

        console.error("Error updating room image:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: { type: "ServerError" },
            data: null,
            success: false,
            message: "Error updating room image",
        }, { status: HttpStatusCode.InternalServerError });
    }
}

// DELETE /api/admin/rooms/[roomId]/images/[imageId]
export const DELETE = async (req: NextRequest, { params }: { params: { roomId: string; imageId: string } }) => {
    try {
        requireAdminAuth(req);

        const roomId = parseInt(params.roomId);
        const imageId = parseInt(params.imageId);

        if (isNaN(roomId) || isNaN(imageId)) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid room ID or image ID",
                data: null,
                errors: { type: "ValidationError" },
            }, { status: HttpStatusCode.BadRequest });
        }

        // Verify room exists and is not deleted
        const room = await prisma.room.findUnique({
            where: { id: roomId, isDeleted: false },
            select: {
                id: true,
                roomNumber: true,
                _count: {
                    select: {
                        images: true
                    }
                }
            }
        });

        if (!room) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Room not found",
                data: null,
                errors: { type: "NotFoundError" },
            }, { status: HttpStatusCode.NotFound });
        }

        // Verify image exists and belongs to the room
        const existingImage = await prisma.roomImage.findUnique({
            where: {
                id: imageId,
                roomId: roomId
            },
            select: {
                id: true,
                imageUrl: true
            }
        });

        if (!existingImage) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Room image not found",
                data: null,
                errors: { type: "NotFoundError" },
            }, { status: HttpStatusCode.NotFound });
        }

        // Optional: Prevent deletion if it's the only image (business rule)
        // Uncomment if you want to enforce at least one image per room
        /*
        if (room._count.images === 1) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Cannot delete the only image for this room",
                data: null,
                errors: { type: "ConflictError" },
            }, { status: HttpStatusCode.Conflict });
        }
        */

        await prisma.roomImage.delete({
            where: { id: imageId }
        });

        return NextResponse.json<ApiResponse<{ message: string }>>({
            success: true,
            message: "Room image deleted successfully",
            data: {
                message: `Image ${existingImage.imageUrl} has been deleted from room ${room.roomNumber}`
            },
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

        console.error("Error deleting room image:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: { type: "ServerError" },
            data: null,
            success: false,
            message: "Error deleting room image",
        }, { status: HttpStatusCode.InternalServerError });
    }
}