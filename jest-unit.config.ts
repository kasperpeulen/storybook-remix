import type { Config } from "jest";

export default {
  preset: "ts-jest",
  testMatch: ["<rootDir>/app/**/*.test.*"],
} satisfies Config;
