import type { PrismaClient } from "@prisma/client";
import type { Random } from "~/context/random";

export interface Context {
  db: PrismaClient;
  random: Random;
}
