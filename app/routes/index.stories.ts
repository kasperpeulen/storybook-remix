import type { Meta, StoryObj } from "@storybook/react";
import { TestApp, testAppDefaultProps } from "~/test/TestApp";

const meta = {
  title: "IndexRoute",
  component: TestApp,
  args: {
    ...testAppDefaultProps,
    url: "/",
    loggedInUser: "none",
  },
} satisfies Meta<typeof TestApp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
