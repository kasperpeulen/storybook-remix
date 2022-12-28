import type { PrismaClient } from "@prisma/client";
import { Random } from "~/context/random";

export interface Context {
  db: PrismaClient;
  random: Random;
}
