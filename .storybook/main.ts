import { StorybookConfig } from "@storybook/react-vite";
import path from "node:path";

export default {
  stories: ["../app/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  staticDirs: [path.resolve("public"), path.resolve("app/styles")],
} satisfies StorybookConfig;
