import {getTokenFromReq, verifyToken} from "@/lib/jwt";
import {NextRequest, NextResponse} from "next/server";
import {HttpStatusCode} from "axios";
import {prismaClient} from "@/lib/prismaClient";

export const GET = async (request: NextRequest) => {
    try {

        const token = getTokenFromReq(request)

        if (!token) {
            return NextResponse.json(
                {message: "You are not authorized or expired session"}
                , {status: HttpStatusCode.Forbidden})
        }
        const payload = verifyToken(token)

        const user = await prismaClient.user.findUnique({
            where: {id: payload.userId},
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                createdAt: true
            }
        })

        if (!user) {
            return NextResponse.json({
                message: "user does not exist"
            }, {status: HttpStatusCode.NotFound})
        }

        return NextResponse.json({user},
            {status: HttpStatusCode.Ok})

    } catch {
        return NextResponse.json(
            {error: 'Internal server error'},
            {status: 500}
        );
    }
}