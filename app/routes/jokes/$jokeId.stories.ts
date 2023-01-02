import type { Meta, StoryObj } from "@storybook/react";
import { TestApp, testAppDefaultProps } from "~/test/TestApp";
import { v5 } from "uuid";
import { uuidNamespace } from "~/test/context/test-layer";

const meta = {
  title: "JokeRoute",
  component: TestApp,
  args: {
    ...testAppDefaultProps,
    url: "/jokes/cc31033b-5da7-5c9e-adf2-80a2963e19a8",
  },
} satisfies Meta<typeof TestApp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NotFound: Story = {
  args: {
    url: `/jokes/${v5("something", uuidNamespace)}`,
  },
};
