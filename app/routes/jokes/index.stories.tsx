import type { Meta, StoryObj } from "@storybook/react";
import { TestRoot } from "../../../test/root";
import { getJokes } from "~/mocks/jokes";
import { getUsers } from "~/mocks/users";

const meta = {
  title: "JokesIndexRoute",
  component: TestRoot,
  args: {
    url: "/jokes",
    loggedInUser: "kody",
    jokes: getJokes(),
    users: getUsers(),
  },
} satisfies Meta<typeof TestRoot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
