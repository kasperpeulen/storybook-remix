import type { Context } from "~/context/context";
import { createPrismaMock } from "~/test/utils/prisma-mock";
import json from "../../../prisma/dmmf.json";
import type { Prisma } from "@prisma/client";
import { createSeedData } from "~/test/mocks/seed";
import { createTestLayer } from "~/test/context/test-layer";
import { TestRandom } from "./random";
import { createTestMemorySessionStorage } from "~/test/context/session";

export function createTestContext({ db, random, sessionStorage }: Partial<Context> = {}): Context &
  Record<string, unknown> {
  const testLayer = createTestLayer();
  const datamodel = json.datamodel as Prisma.DMMF.Datamodel;

  return {
    db: db ?? createPrismaMock(datamodel, { data: createSeedData(), ...testLayer }),
    random: random ?? new TestRandom(),
    sessionStorage:
      sessionStorage ??
      createTestMemorySessionStorage({
        cookie: {
          name: "RJ_session",
          secure: false,
          secrets: [""],
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
          httpOnly: true,
        },
      }),
  };
}
