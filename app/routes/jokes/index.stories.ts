import type { Meta, StoryObj } from "@storybook/react";
import { TestApp } from "~/test/TestApp";
import { getJokes } from "~/test/mocks/jokes";
import { getUsers } from "~/test/mocks/users";
import { userEvent, within } from "@storybook/testing-library";

const meta = {
  title: "JokesIndexRoute",
  component: TestApp,
  args: {
    url: "/jokes",
    loggedInUser: "kody",
    jokes: getJokes(),
    users: getUsers(),
  },
} satisfies Meta<typeof TestApp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export const Logout = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const submitButton = await canvas.findByRole("button", { name: /logout/i });
    await userEvent.click(submitButton);
  },
} satisfies Story;

export const NotLoggedIn = {
  args: {
    loggedInUser: "none",
  },
} satisfies Story;
