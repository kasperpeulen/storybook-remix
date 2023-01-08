import type { Config } from "jest";
import { getJestConfig } from "@storybook/test-runner";

// removing reporters as jest give validation errors, as they need to be in the root jest config it seems
const { reporters, watchPlugins, ...config } = getJestConfig();

export default {
  ...config,
  preset: "ts-jest",
  testMatch: ["<rootDir>/app/**/*.stories.*"],
  setupFilesAfterEnv: ["jest-playwright-istanbul/lib/setup"],
} satisfies Config;
