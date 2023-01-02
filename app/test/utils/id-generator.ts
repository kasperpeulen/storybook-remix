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

  constructor(private namespace: string) {}

  next = () => v5((this.n++).toString(), this.namespace);
}
