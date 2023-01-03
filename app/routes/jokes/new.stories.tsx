import { expect } from "@storybook/jest";
import type { Meta, StoryObj } from "@storybook/react";
import { TestAppStory, testAppDefaultProps } from "~/test/TestApp";
import { userEvent, waitFor, within } from "@storybook/testing-library";
import type { PlayContext } from "~/test/utils/storybook";
import type { jest } from "@storybook/jest";

const meta = {
  title: "NewJokeRoute",
  component: TestAppStory,
  args: {
    ...testAppDefaultProps,
    url: "/jokes/new",
  },
} satisfies Meta<typeof TestAppStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

async function postJoke({ canvasElement }: PlayContext, name: string, content: string) {
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

    // TODO we should type all arg function starting with on as Jest Mock
    (args.onLocationChanged as jest.Mock).mockReset();
    await waitFor(() => expect(args.onLocationChanged).toHaveBeenCalled());

    expect(args.onMutate).toHaveBeenCalledWith(
      expect.objectContaining({ model: "Joke", action: "create", data: expect.objectContaining({ name, content }) })
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

    expect(args.onMutate).not.toHaveBeenCalledWith(expect.objectContaining({ model: "Joke", action: "create" }));
  },
} satisfies Story;

// export const PostAfterSessionExpiration = {
//   args: {
//     url: "/jokes",
//     loggedInUser: "kody",
//   },
//   decorators: [
//     (Story) => {
//       return <Story args={{}}></Story>;
//     },
//   ],
//   play: async (context) => {
//     const { args, canvasElement } = context;
//     const canvas = within(canvasElement);
//
//     await userEvent.click(await canvas.findByRole("link", { name: /add your own/i }));
//
//     // TODO let's find a solid way to inject the test context in the story context
//     await args.clock.sleep(1000 * 60 * 60 * 24 * 60);
//
//     await postJoke(context, "Frisbee", "I was wondering why the frisbee was getting bigger, then it hit me.");
//
//     // Should go to login
//     await waitFor(() => {
//       expect(args.onLocationChanged).toHaveBeenCalledWith(expect.objectContaining({ pathname: "/login" }));
//     });
//
//     // Should not post joke
//     expect(args.onMutate).not.toHaveBeenCalledWith(expect.objectContaining({ table: "joke", action: "create" }));
//   },
// } satisfies Story;
