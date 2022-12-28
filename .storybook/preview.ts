import { Parameters } from "@storybook/react";

import isChromatic from "chromatic/isChromatic";

// Use the document.fonts API to check if fonts have loaded
// https://developer.mozilla.org/en-US/docs/Web/API/Document/fonts API to
const fontLoader = async () => ({
  fonts: await document.fonts.ready,
});

/* 👇 It's configured as a global loader
 * See https://storybook.js.org/docs/react/writing-stories/loaders
 * to learn more about loaders
 */
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
