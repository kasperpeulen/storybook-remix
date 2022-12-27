import type { Meta, StoryObj } from "@storybook/react";
import { TestRoot } from "../../test/root";

const meta = {
  title: "IndexRoute",
  component: TestRoot,
  tags: ["autodocs"],
  args: {
    path: "/",
  },
} satisfies Meta<typeof TestRoot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
