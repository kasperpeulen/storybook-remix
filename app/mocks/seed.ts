import type { Prisma, PrismaClient } from "@prisma/client";
import type { PrismaMockData } from "~/utils/prisma-mock";
import { getUsers } from "~/mocks/users";
import { getJokes } from "~/mocks/jokes";

export async function seed(db: PrismaClient) {
  await Promise.all(getUsers().map((user) => db.user.create({ data: user })));
  await Promise.all(getJokes().map((joke) => db.joke.create({ data: joke })));
}

export function createSeedData({
  jokes,
  users,
}: {
  jokes?: Prisma.JokeUncheckedCreateInput[];
  users?: Prisma.UserUncheckedCreateInput[];
} = {}) {
  return {
    joke: jokes ?? getJokes(),
    user: users ?? getUsers(),
  } as PrismaMockData<PrismaClient>;
}
