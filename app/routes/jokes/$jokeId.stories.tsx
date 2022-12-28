import type { Meta, StoryObj } from "@storybook/react";
import { TestRoot } from "../../../test/root";
import { getJokes } from "~/mocks/jokes";

const meta = {
  title: "JokeRoute",
  component: TestRoot,
  args: {
    url: "/jokes/1",
    jokes: getJokes(),
  },
} satisfies Meta<typeof TestRoot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};