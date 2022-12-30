import type { Context } from "~/context/context";
import { createPrismaMock } from "~/utils/prisma-mock";
import json from "../../prisma/dmmf.json";
import type { Prisma } from "@prisma/client";
import { TestRandom } from "~/context/random";
import {
  createCookieFactory,
  createMemorySessionStorageFactory,
  createSessionStorageFactory,
} from "@remix-run/server-runtime";
import { createSeedData } from "~/mocks/seed";
import { createTestLayer } from "~/context/test-layer";

export function createTestContext({
  db,
  random,
  sessionStorage,
}: Partial<Context> = {}): Context & Record<string, unknown> {
  const testLayer = createTestLayer();
  const datamodel = json.datamodel as Prisma.DMMF.Datamodel;

  return {
    db:
      db ??
      createPrismaMock(datamodel, { data: createSeedData(), ...testLayer }),
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

const createTestCookie = createCookieFactory({
  sign: async (sign, secret) => sign,
  unsign: async (sign, secret) => sign,
});
const createTestSessionStorage = createSessionStorageFactory(createTestCookie);
const createTestMemorySessionStorage = createMemorySessionStorageFactory(
  createTestSessionStorage
);
