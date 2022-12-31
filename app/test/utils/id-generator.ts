import { v4 } from "uuid";

export interface IdGenerator {
  next(): string;
}

export class NaturalsGenerator {
  private n: number = 1;
  next = () => (this.n++).toString();
}

export class UuidV4Generator {
  n: number = 1;
  next = v4;
}
