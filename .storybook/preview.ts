import { Parameters } from "@storybook/react";

import isChromatic from "chromatic/isChromatic";

const fontLoader = async () => ({
  // or
  fonts: await document.fonts.ready,
});

export const loaders = isChromatic() && document.fonts ? [fontLoader] : [];

export const parameters: Parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
