import { expect } from "@storybook/jest";
import type { Meta, StoryObj } from "@storybook/react";
import { TestRoot } from "../../../test/root";
import { getJokes } from "~/mocks/jokes";
import { userEvent, waitFor, within } from "@storybook/testing-library";

const meta = {
  title: "NewJokeRoute",
  component: TestRoot,
  args: {
    url: "/jokes/new",
    jokes: getJokes(),
  },
} satisfies Meta<typeof TestRoot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TooShortName: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // TODO can be removed when we fix the creation of testdata to be sync
    await waitFor(() => expect(canvas.getByRole("button")).toBeInTheDocument());

    const name = await canvas.getByLabelText("Name:");
    await userEvent.type(name, "😅", { delay: 10 });

    const content = await canvas.getByLabelText("Content:");
    await userEvent.type(
      content,
      "I was wondering why the frisbee was getting bigger, then it hit me.",
      { delay: 10 }
    );

    const submitButton = canvas.getByRole("button");
    await userEvent.click(submitButton);
  },
};

export const TooShortContent: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // TODO can be removed when we fix the creation of testdata to be sync
    await waitFor(() => expect(canvas.getByRole("button")).toBeInTheDocument());

    const name = await canvas.getByLabelText("Name:");
    await userEvent.type(name, "Frisbee", { delay: 10 });

    const content = await canvas.getByLabelText("Content:");
    await userEvent.type(content, "Shortie", { delay: 10 });

    const submitButton = canvas.getByRole("button");
    await userEvent.click(submitButton);
  },
};

export const Valid: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // TODO can be removed when we fix the creation of testdata to be sync
    await waitFor(() => expect(canvas.getByRole("button")).toBeInTheDocument());

    const name = await canvas.getByLabelText("Name:");
    await userEvent.type(name, "Frisbee", { delay: 10 });

    const content = await canvas.getByLabelText("Content:");
    await userEvent.type(
      content,
      "I was wondering why the frisbee was getting bigger, then it hit me.",
      { delay: 10 }
    );

    const submitButton = canvas.getByRole("button");
    await userEvent.click(submitButton);
  },
};
