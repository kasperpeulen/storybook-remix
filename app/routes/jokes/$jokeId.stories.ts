import type { Meta, StoryObj } from "@storybook/react";
import { TestApp } from "~/test/TestApp";

const meta = {
  title: "JokeRoute",
  component: TestApp,
  args: {
    url: "/jokes/cc31033b-5da7-5c9e-adf2-80a2963e19a8",
    loggedInUser: "kody",
  },
} satisfies Meta<typeof TestApp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NotFound: Story = {
  args: {
    url: "/jokes/something",
  },
};
