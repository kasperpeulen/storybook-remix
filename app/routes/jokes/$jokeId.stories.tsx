import type { Meta, StoryObj } from "@storybook/react";
import { TestRoot } from "../../../test/root";
import { getJokes } from "~/mocks/jokes";
import { getUsers } from "~/mocks/users";

const meta = {
  title: "JokeRoute",
  component: TestRoot,
  args: {
    url: "/jokes/3",
    loggedInUser: "kody",
    jokes: getJokes(),
    users: getUsers(),
  },
} satisfies Meta<typeof TestRoot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
