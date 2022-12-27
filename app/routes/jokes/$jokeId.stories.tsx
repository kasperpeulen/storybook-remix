import type { Meta, StoryObj } from "@storybook/react";
import { TestRoot } from "../../../test/root";

const meta = {
  title: "JokeRoute",
  component: TestRoot,
  tags: ["autodocs"],
  args: {
    path: "/jokes/some-id",
  },
} satisfies Meta<typeof TestRoot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
