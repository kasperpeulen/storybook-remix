import { PrismaClient } from "@prisma/client";
import { seed } from "~/mocks/seed";

const prismaClient = new PrismaClient();

seed(prismaClient);
