import type { Meta, StoryObj } from "@storybook/react";
import { JokeDisplay } from "~/components/JokeDisplay";
import { getJokes } from "~/test/mocks/jokes";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import * as React from "react";

const meta = {
  component: JokeDisplay,
  args: { joke: getJokes()[0], isOwner: true, canDelete: true },
  decorators: [
    (Story, ctx) => {
      const router = createMemoryRouter([{ path: "/", element: <JokeDisplay {...ctx.args} /> }], {
        initialEntries: ["/"],
      });
      return <RouterProvider router={router} />;
    },
  ],
} satisfies Meta<typeof JokeDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NotOwner: Story = {
  args: {
    isOwner: false,
    canDelete: false,
  },
};
