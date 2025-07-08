import { PrismaClient } from "@/app/generated/prisma";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};
export const prismaClient = globalForPrisma.prisma ??
    new PrismaClient({
        log: ['error', 'warn'],
    })

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaClient
}
