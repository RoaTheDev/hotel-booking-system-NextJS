import { NextRequest, NextResponse } from "next/server";
import { prismaClient as prisma } from "@/lib/prismaClient";
import { HttpStatusCode } from "axios";
import { ZodError } from "zod";
import { z } from "zod";
import { ApiErrorResponse, ApiResponse } from "@/types/commonTypes";
import { validationErrorFormat } from "@/utils/zodErrorFormat";
import { requireAdminAuth, AuthError } from "@/middleware/auth";
import {RouteParams} from "@/types/roomTypes";

const RoomImageSchema = z.object({
    imageUrl: z.string().url("Invalid image URL"),
    caption: z.string().nullable().optional(),
});
type RoomImagesType = z.infer<typeof RoomImageSchema>

export const POST = async (req: NextRequest, { params }: RouteParams) => {
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

        const body = await req.json();
        const validatedData = RoomImageSchema.parse(body);

        const room = await prisma.room.findFirst({
            where: {
                id: roomId,
                isDeleted: false
            }
        });

        if (!room) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Room not found",
                data: null,
                errors: { type: "NotFound" },
            }, { status: HttpStatusCode.NotFound });
        }

        const newImage = await prisma.roomImage.create({
            data: {
                roomId,
                ...validatedData
            }
        });

        return NextResponse.json<ApiResponse<RoomImagesType>>({
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

        if (err instanceof ZodError) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid input data",
                data: null,
                errors: validationErrorFormat(err),
            }, { status: HttpStatusCode.BadRequest });
        }

        console.error("Error adding room image:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: { type: "ServerError" },
            data: null,
            success: false,
            message: "Error adding room image",
        }, { status: HttpStatusCode.InternalServerError });
    }
};