import type { Prisma } from "@prisma/client";
import * as bcrypt from "@isbl/bcryptjs";

export function getUsers(): Prisma.UserUncheckedCreateInput[] {
  return [
    {
      username: "kody",
      passwordHash: bcrypt.hashSync("testtest", 10),
    },
    {
      username: "mr.bean",
      passwordHash: bcrypt.hashSync("testtest", 10),
    },
  ];
}
