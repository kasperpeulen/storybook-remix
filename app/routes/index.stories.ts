import type { Meta, StoryObj } from "@storybook/react";
import { TestAppStory, testAppDefaultProps } from "~/test/TestApp";

const meta = {
  title: "IndexRoute",
  component: TestAppStory,
  args: {
    ...testAppDefaultProps,
    url: "/",
    loggedInUser: "none",
  },
} satisfies Meta<typeof TestAppStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
