import { v4, v5 } from "uuid";

export interface IdGenerator {
  next(): string;
}

export class UuidV4Generator {
  n: number = 1;
  next = v4;
}

export class UuidV5Generator {
  private n: number = 1;

  next = () => v5((this.n++).toString(), "6c7fda6d-f92f-4bd2-9d4d-da26a59196a6");
}
