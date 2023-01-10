import type { PrismaClient } from "@prisma/client";
import type { Random } from "~/context/random";
import type { SessionStorage } from "@remix-run/node";
import { createCookieSessionStorage } from "@remix-run/node";
import { createDb } from "~/utils/db.server";
import { createCookieOptions } from "~/utils/session";

export interface Context {
  db: PrismaClient;
  random: Random;
  sessionStorage: SessionStorage;
}

export function createLiveContext(): Context & Record<string, unknown> {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) throw new Error("SESSION_SECRET must be set");

  return {
    db: createDb(),
    random: { getNumber: Math.random },
    sessionStorage: createCookieSessionStorage({ cookie: createCookieOptions({ secrets: [sessionSecret] }) }),
  };
}
