import type { Context } from "~/context/context";
import { PrismaClient } from "@prisma/client";

export function createLiveContext(): Context {
  return {
    db: new PrismaClient(),
  };
}
