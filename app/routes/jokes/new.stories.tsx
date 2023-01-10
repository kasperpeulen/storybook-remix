import type { jest } from "@storybook/jest";
import { expect } from "@storybook/jest";
import type { Meta, StoryObj } from "@storybook/react";
import { getTestContext, testAppDefaultProps, TestAppStory } from "~/test/TestApp";
import { userEvent, waitFor, within } from "@storybook/testing-library";
import type { PlayContext } from "~/test/utils/storybook";
import { Login } from "~/routes/login.stories";

const meta = {
  title: "routes/new",
  component: TestAppStory,
  args: {
    ...testAppDefaultProps,
    url: "/jokes/new",
  },
} satisfies Meta<typeof TestAppStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

async function postJoke({ canvasElement, args }: PlayContext, name: string, content: string) {
  const canvas = within(canvasElement);

  await userEvent.type(await canvas.findByLabelText("Name:"), name, { delay: args.inputDelay });
  await userEvent.type(await canvas.findByLabelText("Content:"), content, { delay: args.inputDelay });
  await userEvent.click(await canvas.findByRole("button", { name: /add/i }));
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

    // TODO we should type all arg function starting with on as Jest Mock
    (args.onLocationChanged as jest.Mock).mockReset();
    await waitFor(() => expect(args.onLocationChanged).toHaveBeenCalled());

    expect(args.onDbMutate).toHaveBeenCalledWith(
      expect.objectContaining({ model: "Joke", action: "create", data: expect.objectContaining({ name, content }) })
    );
  },
} satisfies Story;

export const NotLoggedIn = {
  args: { loggedInUser: "none" },
} satisfies Story;

export const LoginToCreateJoke = {
  ...NotLoggedIn,
  play: async (context) => {
    const canvas = within(context.canvasElement);
    const text = await canvas.findByText(/you must be logged in to create a joke./i);
    const link = await within(text.parentElement!).findByRole("link", { name: /login/i });
    await userEvent.click(link);

    await Login.play(context);
    await Valid.play(context);
  },
} satisfies Story;

export const PostAfterSessionExpiration = {
  args: {
    loggedInUser: "kody",
  },
  play: async (context) => {
    const { args, canvasElement } = context;
    const canvas = within(canvasElement);

    await canvas.findByRole("form");

    // Let's go forward 2 months in time!
    await getTestContext(context).clock.sleep(1000 * 60 * 60 * 24 * 60);

    await postJoke(context, "Frisbee", "Some joke ... ");

    // Should go to login
    await waitFor(() => {
      expect(args.onLocationChanged).toHaveBeenCalledWith(expect.objectContaining({ pathname: "/login" }));
    });

    // Should not post joke
    expect(args.onDbMutate).not.toHaveBeenCalledWith(expect.objectContaining({ table: "joke", action: "create" }));
  },
} satisfies Story;

export const _400 = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    (await canvas.findByLabelText("Content:")).remove();
    await userEvent.click(await canvas.findByRole("button", { name: /add/i }));
  },
} satisfies Story;

export const _500 = {
  play: async (context) => {
    const { args } = context;
    const canvas = within(context.canvasElement);
    await canvas.findByRole("form");

    // @ts-expect-error Force 500
    getTestContext(context).db.joke.create = null;

    await postJoke(context, "Frisbee", "Some joke ... ");

    await waitFor(() => expect(args.onResponse).toHaveBeenCalledWith(expect.objectContaining({ status: 500 })));
  },
} satisfies Story;
