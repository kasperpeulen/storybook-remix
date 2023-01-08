import type { Config } from "jest";

export default {
  testMatch: ["<rootDir>/app/**/*.stories.*"],
  preset: "jest-playwright-preset",
  transform: {
    "^.+\\.stories\\.[jt]sx?$": "@storybook/test-runner/playwright/transform",
    "^.+\\.[jt]sx?$": "ts-jest",
  },
  testEnvironment: "@storybook/test-runner/playwright/custom-environment.js",
  setupFilesAfterEnv: ["jest-playwright-istanbul/lib/setup", "@storybook/test-runner/playwright/jest-setup.js"],
} satisfies Config;
