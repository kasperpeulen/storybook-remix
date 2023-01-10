import type { Meta, StoryObj } from "@storybook/react";
import { getTestContext, testAppDefaultProps, TestAppStory } from "~/test/TestApp";
import { userEvent, waitFor, within } from "@storybook/testing-library";
import { expect } from "@storybook/jest";

const meta = {
  title: "routes/jokes/index",
  component: TestAppStory,
  args: {
    ...testAppDefaultProps,
    url: "/jokes",
  },
} satisfies Meta<typeof TestAppStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export const NotLoggedIn = {
  args: {
    loggedInUser: "none",
  },
} satisfies Story;

export const _404 = {
  args: { jokes: [] },
} satisfies Story;

export const _500 = {
  play: async (context) => {
    const { args, canvasElement } = context;
    const canvas = within(canvasElement);

    const button = await canvas.findByRole("link", { name: /get a random joke/i });
    // @ts-expect-error Force 500
    getTestContext(context).db.joke.count = null;
    await userEvent.click(button);

    await waitFor(() => expect(args.onResponse).toHaveBeenCalledWith(expect.objectContaining({ status: 500 })));
  },
} satisfies Story;
