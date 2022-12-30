import type { Clock } from "~/context/clock";
import { TestClock } from "~/context/clock";
import { NaturalsGenerator } from "~/utils/id-generator";

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

export function createTestLayer({
  clock,
  idGenerator,
}: Partial<TestLayer> = {}) {
  return {
    clock: clock ?? new TestClock(new Date(2022, 12, 1)),
    idGenerator: idGenerator ?? new NaturalsGenerator(),
  };
}
