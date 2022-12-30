import type { PrismaClient } from "@prisma/client";
import type { Random } from "~/context/random";
import type { SessionStorage } from "@remix-run/node";

export interface Context {
  db: PrismaClient;
  random: Random;
  sessionStorage: SessionStorage;
}
