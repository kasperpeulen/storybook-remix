import { expect } from "@storybook/jest";
import type { Meta, StoryObj } from "@storybook/react";
import { TestRoot } from "../../../test/root";
import { getJokes } from "~/mocks/jokes";
import { userEvent, waitFor, within } from "@storybook/testing-library";
import { getUsers } from "~/mocks/users";

const meta = {
  title: "NewJokeRoute",
  component: TestRoot,
  args: {
    url: "/jokes/new",
    loggedInUser: "kody",
    jokes: getJokes(),
    users: getUsers(),
  },
} satisfies Meta<typeof TestRoot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export const TooShortName = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const name = await canvas.findByLabelText("Name:");
    await userEvent.type(name, "😅", { delay: 10 });

    const content = await canvas.findByLabelText("Content:");
    await userEvent.type(
      content,
      "I was wondering why the frisbee was getting bigger, then it hit me.",
      { delay: 10 }
    );

    const submitButton = await canvas.findByRole("button", { name: /add/i });
    await userEvent.click(submitButton);
  },
} satisfies Story;

export const TooShortContent = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const name = await canvas.findByLabelText("Name:");
    await userEvent.type(name, "Frisbee", { delay: 10 });

    const content = await canvas.findByLabelText("Content:");
    await userEvent.type(content, "Shortie", { delay: 10 });

    const submitButton = await canvas.findByRole("button", { name: /add/i });
    await userEvent.click(submitButton);
  },
} satisfies Story;

export const Valid = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const name = "Frisbee";
    const content =
      "I was wondering why the frisbee was getting bigger, then it hit me.";

    const nameInput = await canvas.findByLabelText("Name:");
    await userEvent.type(nameInput, name, { delay: 10 });

    const contentInput = await canvas.findByLabelText("Content:");
    await userEvent.type(contentInput, content, { delay: 10 });

    const submitButton = await canvas.findByRole("button", { name: /add/i });
    await userEvent.click(submitButton);

    await waitFor(() =>
      expect(args.onMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          table: "joke",
          method: "create",
          data: expect.objectContaining({ content, name }),
        })
      )
    );
  },
} satisfies Story;
