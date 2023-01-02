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

// By setting the default props here, storybook can show the default prop in the control panel as well.
// Alternatively, could be spread in every meta args as well.
export const args = testAppDefaultProps;
