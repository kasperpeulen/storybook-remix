const { getJestConfig } = require("@storybook/test-runner");

// removing reporters as jest give validation errors, as they need to be in the root jest config it seems
const { reporters, watchPlugins, ...config } = getJestConfig();

module.exports = {
  ...config,
  preset: "ts-jest",
  testMatch: ["<rootDir>/app/**/*.stories.*"],
};
