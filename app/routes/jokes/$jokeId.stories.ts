import type { Meta, StoryObj } from "@storybook/react";
import { TestApp } from "~/test/TestApp";
import { getJokes } from "~/test/mocks/jokes";
import { getUsers } from "~/test/mocks/users";

const meta = {
  title: "JokeRoute",
  component: TestApp,
  args: {
    url: "/jokes/3",
    loggedInUser: "kody",
    jokes: getJokes(),
    users: getUsers(),
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
