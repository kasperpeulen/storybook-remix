import { Parameters } from "@storybook/react";
import { testAppDefaultProps } from "~/test/TestApp";

export const parameters: Parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  docs: {
    autoplay: true,
  },
};
