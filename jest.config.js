const { getJestConfig } = require("@storybook/test-runner");

process.env.STORYBOOK_CONFIG_DIR ??= ".storybook";
process.env.TARGET_URL ??= "http://localhost:6006";
process.env.TEST_BROWSERS ??= "chromium";

module.exports = {
  projects: ["<rootDir>/jest-unit.config.js", "<rootDir>/jest-storybook.config.js"],
  watchPlugins: getJestConfig().watchPlugins,
};
