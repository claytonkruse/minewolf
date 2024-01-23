import { PrismaClient } from '@prisma/client';
import { dev } from '$app/environment';

let prisma: PrismaClient;

if (dev) {
    prisma = global.prisma ?? new PrismaClient();
    global.prisma = prisma;
} else {
	prisma = new PrismaClient();
}

export { prisma };

