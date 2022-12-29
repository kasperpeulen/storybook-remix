import type { Context } from "~/context/context";
import { PrismaClient } from "@prisma/client";

export function createLiveContext(): Context & Record<string, unknown> {
  return {
    db: new PrismaClient(),
    random: {
      getNumber: Math.random,
    },
  };
}
