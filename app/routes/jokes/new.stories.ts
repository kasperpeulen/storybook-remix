import { expect } from "@storybook/jest";
import type { Meta, StoryObj } from "@storybook/react";
import { TestApp } from "~/test/TestApp";
import { getJokes } from "~/test/mocks/jokes";
import { userEvent, waitFor, within } from "@storybook/testing-library";
import { getUsers } from "~/test/mocks/users";

const meta = {
  title: "NewJokeRoute",
  component: TestApp,
  args: {
    url: "/jokes/new",
    loggedInUser: "kody",
    jokes: getJokes(),
    users: getUsers(),
  },
} satisfies Meta<typeof TestApp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

type Ctx = Parameters<typeof TooShortName["play"]>[0];

async function postJoke({ canvasElement }: Ctx, name: string, content: string) {
  const canvas = within(canvasElement);

  const nameInput = await canvas.findByLabelText("Name:");
  await userEvent.type(nameInput, name, { delay: 10 });

  const contentInput = await canvas.findByLabelText("Content:");
  await userEvent.type(contentInput, content, { delay: 10 });

  const submitButton = await canvas.findByRole("button", { name: /add/i });
  await userEvent.click(submitButton);
}

export const TooShortName = {
  play: async (context) => {
    await postJoke(context, "😅", "I was wondering why the frisbee was getting bigger, then it hit me.");
  },
} satisfies Story;

export const TooShortContent = {
  play: async (context) => {
    await postJoke(context, "Frisbee", "Shortie");
  },
} satisfies Story;

export const Valid = {
  play: async (context) => {
    const { args } = context;

    const name = "Frisbee";
    const content = "I was wondering why the frisbee was getting bigger, then it hit me.";

    await postJoke(context, name, content);

    await waitFor(() =>
      expect(args.onMutate).toHaveBeenCalledWith(
        expect.objectContaining({ table: "joke", method: "create", data: expect.objectContaining({ name, content }) })
      )
    );
  },
} satisfies Story;

export const NotLoggedIn = {
  args: { loggedInUser: "none" },
  play: async (context) => {
    const { args } = context;

    const name = "Frisbee";
    const content = "I was wondering why the frisbee was getting bigger, then it hit me.";

    await postJoke(context, name, content);

    await waitFor(() => {
      expect(args.onLocationChanged).toHaveBeenCalledWith(expect.objectContaining({ pathname: "/login" }));
    });

    expect(args.onMutate).not.toHaveBeenCalledWith(expect.objectContaining({ table: "joke", method: "create" }));
  },
} satisfies Story;
