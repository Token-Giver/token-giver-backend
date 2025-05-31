import { PrismaClient } from '@prisma/client';

export interface IPrismaService {
    campaign: PrismaClient['campaign'];
}

export const PRISMA_SERVICE = 'PRISMA_SERVICE'; 