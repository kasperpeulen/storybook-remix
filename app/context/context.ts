import type { PrismaClient } from "@prisma/client";

export interface Context {
  db: PrismaClient;
}
