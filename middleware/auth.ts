// lib/middleware/auth.ts
import {NextRequest} from "next/server";
import {verifyToken} from "@/utils/jwt";
import {$Enums} from "@/app/generated/prisma";
import Role = $Enums.Role;

export interface AuthUser {
    userId: number;
    email: string;
    role: Role;
}

export class AuthError extends Error {
    constructor(message: string, public statusCode: number = 401) {
        super(message);
        this.name = 'AuthError';
    }
}

export const authenticateUser = (req: NextRequest): AuthUser => {
    const token = req.cookies.get("tranquility_token")?.value ||
        req.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new AuthError("Authentication token required", 401);
    }

    try {
        const payload = verifyToken(token);
        return payload as AuthUser;
    } catch {
        throw new AuthError("Invalid or expired token", 401);
    }
};

export const requireAdmin = (user: AuthUser): void => {
    if (user.role !== Role.ADMIN) {
        throw new AuthError("Admin access required", 403);
    }
};

export const requireAuth = (req: NextRequest): AuthUser => {
    return authenticateUser(req);
};

export const requireAdminAuth = (req: NextRequest): AuthUser => {
    const user = authenticateUser(req);
    requireAdmin(user);
    return user;
};