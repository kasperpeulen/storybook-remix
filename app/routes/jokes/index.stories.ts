import type { Meta, StoryObj } from "@storybook/react";
import { TestApp, testAppDefaultProps } from "~/test/TestApp";
import { userEvent, within } from "@storybook/testing-library";

const meta = {
  title: "JokesIndexRoute",
  component: TestApp,
  args: {
    ...testAppDefaultProps,
    url: "/jokes",
  },
} satisfies Meta<typeof TestApp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export const Logout = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByRole("button", { name: /logout/i }));
  },
} satisfies Story;

export const NotLoggedIn = {
  args: {
    loggedInUser: "none",
  },
} satisfies Story;
