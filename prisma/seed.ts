import { PrismaClient } from "@prisma/client";
import { seed } from "~/test/mocks/seed";

const prismaClient = new PrismaClient();

seed(prismaClient);
