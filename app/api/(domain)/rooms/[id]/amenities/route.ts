import { NextRequest, NextResponse } from "next/server";
import { prismaClient as prisma } from "@/lib/prismaClient";
import { HttpStatusCode } from "axios";
import { ZodError } from "zod";
import { z } from "zod";
import { ApiErrorResponse, ApiResponse } from "@/types/commonTypes";
import { validationErrorFormat } from "@/utils/zodErrorFormat";
import { requireAdminAuth, AuthError } from "@/middleware/auth";

const RoomAmenitySchema = z.object({
    amenityIds: z.array(z.number().int().positive()),
});

interface RouteParams {
    params: { id: string };
}

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
        const { amenityIds } = RoomAmenitySchema.parse(body);

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

        const amenities = await prisma.amenity.findMany({
            where: {
                id: { in: amenityIds },
                isDeleted: false,
                isActive: true
            }
        });

        if (amenities.length !== amenityIds.length) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "One or more amenities not found or inactive",
                data: null,
                errors: { type: "ValidationError" },
            }, { status: HttpStatusCode.BadRequest });
        }

        await prisma.$transaction(async (tx) => {
            await tx.roomAmenity.deleteMany({
                where: { roomId }
            });

            await tx.roomAmenity.createMany({
                data: amenityIds.map(amenityId => ({
                    roomId,
                    amenityId
                }))
            });
        });

        const updatedRoom = await prisma.room.findUnique({
            where: { id: roomId },
            include: {
                amenities: {
                    include: {
                        amenity: true
                    }
                }
            }
        });

        return NextResponse.json<ApiResponse<any>>({
            success: true,
            message: "Room amenities updated successfully",
            data: updatedRoom,
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

        if (err instanceof ZodError) {
            return NextResponse.json<ApiResponse<ApiErrorResponse>>({
                success: false,
                message: "Invalid input data",
                data: null,
                errors: validationErrorFormat(err),
            }, { status: HttpStatusCode.BadRequest });
        }

        console.error("Error updating room amenities:", err);
        return NextResponse.json<ApiResponse<ApiErrorResponse>>({
            errors: { type: "ServerError" },
            data: null,
            success: false,
            message: "Error updating room amenities",
        }, { status: HttpStatusCode.InternalServerError });
    }
};
