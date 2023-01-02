import { UuidV5Generator } from "~/test/utils/id-generator";
import type { Clock } from "../utils/clock";
import { TestClock } from "../utils/clock";

/**
 * You can see the TestLayer as being the context of the test context.
 * We mock the clock and id generation, to get more deterministic test data.
 */
export interface TestLayer {
  clock: Clock;
  idGenerator: {
    next(): string;
  };
}

export function createTestLayer({ clock, idGenerator }: Partial<TestLayer> = {}) {
  return {
    clock: clock ?? new TestClock(new Date(2023, 0, 1)),
    idGenerator: idGenerator ?? new UuidV5Generator(),
  };
}
