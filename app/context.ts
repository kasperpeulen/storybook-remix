import { PrismaClient } from "@prisma/client";
import type { Random } from "~/context/random";
import type { SessionStorage } from "@remix-run/node";
import { createCookieSessionStorage } from "@remix-run/node";
import { createCookieOptions } from "~/context/cookie";

export interface Context {
  db: PrismaClient;
  random: Random;
  sessionStorage: SessionStorage;
}

export function createLiveContext(): Context & Record<string, unknown> {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) throw new Error("SESSION_SECRET must be set");

  return {
    db: new PrismaClient(),
    random: { getNumber: Math.random },
    sessionStorage: createCookieSessionStorage({ cookie: createCookieOptions({ secrets: [sessionSecret] }) }),
  };
}
