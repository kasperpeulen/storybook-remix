import { PrismaClient } from "@prisma/client";
import { getJokes } from "~/mocks/jokes";

const db = new PrismaClient();

async function seed() {
  for (const joke of getJokes()) {
    await new Promise((r) => setTimeout(r, 1));
    await db.joke.create({ data: joke });
  }
}

seed();
