import { userEvent, within } from "@storybook/testing-library";
import { testAppDefaultProps, TestAppStory } from "~/test/TestApp";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "routes/logout",
  component: TestAppStory,
  args: testAppDefaultProps,
} satisfies Meta<typeof TestAppStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Logout = {
  args: {
    url: "/jokes",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: /logout/i }));
  },
} satisfies Story;

export const LogoutRoute = {
  args: { url: "/logout" },
} satisfies Story;
