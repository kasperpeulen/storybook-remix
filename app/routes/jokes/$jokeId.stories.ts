import type { Meta, StoryObj } from "@storybook/react";
import { getTestContext, testAppDefaultProps, TestAppStory } from "~/test/TestApp";
import { v5 } from "uuid";
import { uuidNamespace } from "~/test/test-context";
import { userEvent, waitFor, within } from "@storybook/testing-library";
import { expect } from "@storybook/jest";

const meta = {
  title: "routes/jokes/:jokeId",
  component: TestAppStory,
  args: {
    ...testAppDefaultProps,
    url: "/jokes/107a0c13-e44e-55e8-a090-522a4b7cb5af",
  },
} satisfies Meta<typeof TestAppStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Delete: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: /delete/i }));
  },
};

export const GET404: Story = {
  args: {
    url: `/jokes/${v5("something", uuidNamespace)}`,
  },
};

export const POST404: Story = {
  args: {
    // joke of mr.bean
    loggedInUser: "kody",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // try to delete a joke that doesn't exist
    const form = (await canvas.findByRole("form")) as HTMLFormElement;
    form.action = `/jokes/${v5("something", uuidNamespace)}`;

    await userEvent.click(await canvas.findByRole("button", { name: /delete/i }));
  },
};

export const _400: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = (await canvas.findByRole("button", { name: /delete/i })) as HTMLButtonElement;
    button.value = "update";
    await userEvent.click(button);
  },
};

export const _403: Story = {
  args: {
    // joke of mr.bean
    url: "/jokes/cc3d7637-5ea8-5cff-bc98-6315cc8244ea",
    loggedInUser: "mr.bean",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // try to delete kody's joke
    const form = (await canvas.findByRole("form")) as HTMLFormElement;
    form.action = "/jokes/107a0c13-e44e-55e8-a090-522a4b7cb5af";

    await userEvent.click(await canvas.findByRole("button", { name: /delete/i }));
  },
};

export const _500 = {
  play: async (context) => {
    const { canvasElement, args } = context;
    const canvas = within(canvasElement);

    const button = await canvas.findByRole("button", { name: /delete/i });
    // @ts-expect-error Force 500
    getTestContext(context).db.joke.findUnique = null;
    await userEvent.click(button);

    await waitFor(() => expect(args.onResponse).toHaveBeenCalledWith(expect.objectContaining({ status: 500 })));
  },
} satisfies Story;
