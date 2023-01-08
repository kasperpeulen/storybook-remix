import type { Config } from "jest";
import { getJestConfig } from "@storybook/test-runner";

// removing reporters as jest give validation errors, as they need to be in the root jest config it seems
const { reporters, watchPlugins, ...config } = getJestConfig();

export default {
  ...config,
  testMatch: ["<rootDir>/app/**/*.stories.*"],
  setupFilesAfterEnv: [...config.setupFilesAfterEnv, "jest-playwright-istanbul/lib/setup"],
  transform: {
    "^.+\\.stories\\.[jt]sx?$": "@storybook/test-runner/playwright/transform",
    "^.+\\.[jt]sx?$": "ts-jest",
  },
} satisfies Config;
