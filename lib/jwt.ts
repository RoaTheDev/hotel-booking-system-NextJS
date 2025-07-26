import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import {AppJwtPayload} from "@/lib/types/authTypes";
import {NextRequest} from "next/server";

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const JWT_EXPIRE_IN = (process.env.JWT_EXPIRE_IN || '7d') as
    | `${number}${'d' | 'h' | 'm' | 's'}`
    | `${number}`;

if (!JWT_SECRET_KEY) {
    throw new Error("JWT key is required in ENV");
}
if (!JWT_EXPIRE_IN) {
    throw new Error("JWT key is required in ENV");
}
export const hashPassword =  async(password: string): Promise<string> => {
    const saltRound = 12;
    return await bcrypt.hash(password, saltRound);
}

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash)
}

export const generateToken = (payload: Omit<AppJwtPayload, "iat" | "exp">): string => {
    return jwt.sign(payload, JWT_SECRET_KEY, {algorithm: "HS256", expiresIn: JWT_EXPIRE_IN});
}

export const verifyToken = (token: string): AppJwtPayload => {
    return jwt.verify(token, JWT_SECRET_KEY, {algorithms: ["HS256"]}) as AppJwtPayload;
}

export const getTokenFromCookie = (request: NextRequest) => {
    return request.cookies.get("tranquility_token")?.value || null;
}