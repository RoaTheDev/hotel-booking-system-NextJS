import {NextRequest, NextResponse} from "next/server";
import {prismaClient as prisma} from "@/lib/prismaClient";
import {HttpStatusCode} from "axios";
import {ApiErrorResponse, ApiResponse} from "@/types/commonTypes";
import {Amenity} from "@/app/generated/prisma";

export const GET = async (req: NextRequest) => {
    try {
        const amenities = await prisma.amenity.findMany({
            include: {
                _count: {
                    select: {rooms: true}
                }
            },
            orderBy: {createdAt: "desc"},
            where: {isActive: true, isDeleted: false}
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
