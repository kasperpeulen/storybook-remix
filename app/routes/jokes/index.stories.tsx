import type { Meta, StoryObj } from "@storybook/react";
import { TestRoot } from "../../../test/root";

const meta = {
  title: "JokesIndexRoute",
  component: TestRoot,
  tags: ["autodocs"],
  args: {
    path: "/jokes",
  },
} satisfies Meta<typeof TestRoot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
