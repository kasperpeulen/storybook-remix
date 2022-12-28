import type { Context } from "~/context/context";
import { createPrismaMock } from "~/utils/prisma-mock";
import json from "../../prisma/dmmf.json";
import type { Prisma } from "@prisma/client";
import { getJokes } from "~/mocks/jokes";
import { TestRandom } from "~/context/random";

export function createTestContext({ db }: Partial<Context> = {}): Context &
  Record<string, unknown> {
  const datamodel = json.datamodel as Prisma.DMMF.Datamodel;
  return {
    db: db ?? createPrismaMock(datamodel, { joke: getJokes() }),
    random: new TestRandom(),
  };
}
