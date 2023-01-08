import { PrismaClient } from "@prisma/client";
import type { Random } from "~/context/random";
import type { SessionStorage } from "@remix-run/node";
import { createCookieSessionStorage } from "@remix-run/node";

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
    sessionStorage: createCookieSessionStorage({
      cookie: {
        name: "RJ_session",
        // normally you want this to be `secure: true`
        // but that doesn't work on localhost for Safari
        // https://web.dev/when-to-use-local-https/
        secure: process.env.NODE_ENV === "production",
        secrets: [sessionSecret],
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
      },
    }),
  };
}
