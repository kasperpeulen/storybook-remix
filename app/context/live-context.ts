import type { Context } from "~/context/context";
import { PrismaClient } from "@prisma/client";
import { LiveRandom } from "~/context/random";

export function createLiveContext(): Context {
  return {
    db: new PrismaClient(),
    random: {
      getNumber: Math.random,
    },
  };
}
