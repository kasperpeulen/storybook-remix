import type { Meta, StoryObj } from "@storybook/react";
import { TestAppStory, testAppDefaultProps } from "~/test/TestApp";
import { userEvent, within } from "@storybook/testing-library";
import { Valid as NewValidJoke } from "~/routes/jokes/new.stories";
import type { PlayContext } from "~/test/utils/storybook";

const meta = {
  title: "Login",
  component: TestAppStory,
  args: {
    ...testAppDefaultProps,
    url: "/login",
    loggedInUser: "none",
  },
} satisfies Meta<typeof TestAppStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

async function login(ctx: PlayContext, name: string, password: string) {
  const canvas = within(ctx.canvasElement);

  await userEvent.type(await canvas.findByLabelText("Username"), name, { delay: 10 });
  await userEvent.type(await canvas.findByLabelText("Password"), password, { delay: 10 });
  await userEvent.click(await canvas.findByRole("button", { name: /submit/i }));
}

async function register(ctx: PlayContext, name: string, password: string) {
  const canvas = within(ctx.canvasElement);

  await userEvent.click(await canvas.findByLabelText("Register"));
  await login(ctx, name, password);
}

export const Login = {
  play: async (context) => {
    await login(context, "kody", "testtest");
  },
} satisfies Story;

export const WrongPassword = {
  play: async (context) => {
    await login(context, "kody", "123456");
  },
} satisfies Story;

export const LoginAndPost: Story = {
  play: async (context) => {
    const canvas = within(context.canvasElement);
    await Login.play(context);

    await userEvent.click(await canvas.findByRole("link", { name: /add your own/i }));

    await NewValidJoke.play(context);
  },
};

export const RegisterUsedAccount = {
  play: async (context) => {
    await register(context, "mr.bean", "testtest");
  },
} satisfies Story;

export const RegisterWithShortPassword = {
  play: async (context) => {
    await register(context, "mr.bean2", "test");
  },
} satisfies Story;

export const RegisterWithShortName = {
  play: async (context) => {
    await register(context, "mr", "testtest");
  },
} satisfies Story;

export const RegisterNewAccount = {
  play: async (context) => {
    await register(context, "mr.bean2", "testtest");
  },
} satisfies Story;

export const RegisterNewAccountAndPostJoke = {
  play: async (context) => {
    const canvas = within(context.canvasElement);

    await RegisterNewAccount.play(context);

    const link = await canvas.findByRole("link", { name: /add your own/i });
    await userEvent.click(link);

    await NewValidJoke.play(context);
  },
} satisfies Story;
