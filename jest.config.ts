import type { Config } from "jest";
import { getJestConfig } from "@storybook/test-runner";

process.env.STORYBOOK_CONFIG_DIR ??= ".storybook";
process.env.TARGET_URL ??= "http://localhost:6006";
process.env.TEST_BROWSERS ??= "chromium";

export default {
  projects: ["<rootDir>/jest-unit.config.ts", "<rootDir>/jest-storybook.config.ts"],
  reporters: ["default", "jest-playwright-istanbul/lib/reporter"],
  watchPlugins: getJestConfig().watchPlugins,
} satisfies Config;
