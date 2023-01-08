import path from "node:path";
// TODO somehow the test runner crashes in github actions when this is in TS and module syntax
// But not locally, very weird

export default {
  stories: ["../app/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  features: {
    interactionsDebugger: true,
  },
  staticDirs: [path.resolve("public"), path.resolve("app/styles")],
};
