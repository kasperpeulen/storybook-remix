import type { Context } from "~/context";
import { createPrismaMock } from "~/test/utils/prisma-mock";
import json from "../../prisma/dmmf.json";
import type { Prisma } from "@prisma/client";
import { createSeedData } from "~/test/mocks/seed";
import { TestRandom } from "./utils/random";
import { createTestCookieSessionStorage } from "~/test/utils/testCookieStorage";
import type { Clock } from "~/test/utils/clock";
import { TestClock } from "~/test/utils/clock";
import type { IdGenerator } from "~/test/utils/id-generator";
import { UuidV5Generator } from "~/test/utils/id-generator";
import { createCookieOptions } from "~/context/cookie";

export type TestContext = ReturnType<typeof createTestContext>;

export function createTestContext({
  db,
  random,
  sessionStorage,
  clock,
  idGenerator,
}: Partial<Context> & Partial<TestLayer> = {}) {
  const testLayer = createTestLayer();
  return {
    clock: clock ?? testLayer.clock,
    idGenerator: idGenerator ?? testLayer.idGenerator,
    db: db ?? createPrismaMock(json.datamodel as Prisma.DMMF.Datamodel, { data: createSeedData(), ...testLayer }),
    random: random ?? new TestRandom(),
    sessionStorage:
      sessionStorage ??
      createTestCookieSessionStorage({
        cookie: createCookieOptions({
          secrets: ["test"],
        }),
      }),
  } satisfies Context & Record<string, unknown>;
}

export const uuidNamespace = "6c7fda6d-f92f-4bd2-9d4d-da26a59196a6";

/**
 * We mock the clock and id generation, to get more deterministic test data.
 */
export interface TestLayer {
  clock: Clock;
  idGenerator: IdGenerator;
}

export function createTestLayer({ clock, idGenerator }: Partial<TestLayer> = {}) {
  return {
    clock: clock ?? new TestClock(new Date(2023, 0, 1)),
    idGenerator: idGenerator ?? new UuidV5Generator(uuidNamespace),
  };
}
