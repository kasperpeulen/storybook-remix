import { PrismaClient } from "@prisma/client";

export const createDb = () => new PrismaClient();
