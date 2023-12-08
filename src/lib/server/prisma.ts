import { PrismaClient } from '@prisma/client';
import { dev } from '$app/environment';

let prisma: PrismaClient;

if (dev) {
	prisma = global.prisma || new PrismaClient();
} else {
	prisma = new PrismaClient();
}

export { prisma };
3