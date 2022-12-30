import type { Meta, StoryObj } from "@storybook/react";
import { TestRoot } from "../../test/root";
import { userEvent, within } from "@storybook/testing-library";
import { Valid as NewValidJoke } from "~/routes/jokes/new.stories";
import { getJokes } from "~/mocks/jokes";
import { getUsers } from "~/mocks/users";

const meta = {
  title: "Login",
  component: TestRoot,
  args: {
    url: "/login",
    loggedInUser: "none",
    jokes: getJokes(),
    users: getUsers(),
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TestRoot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WrongPassword = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const name = await canvas.findByLabelText("Username");
    await userEvent.type(name, "kody", { delay: 10 });

    const password = await canvas.findByLabelText("Password");
    await userEvent.type(password, "test", { delay: 10 });

    const submitButton = await canvas.findByRole("button", { name: /submit/i });
    await userEvent.click(submitButton);
  },
} satisfies Story;

export const Login = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const name = await canvas.findByLabelText("Username");
    await userEvent.type(name, "kody", { delay: 10 });

    const password = await canvas.findByLabelText("Password");
    await userEvent.type(password, "testtest", { delay: 10 });

    const submitButton = await canvas.findByRole("button", { name: /submit/i });
    await userEvent.click(submitButton);
  },
} satisfies Story;

export const LoginAndPost: Story = {
  play: async (context) => {
    const canvas = within(context.canvasElement);
    await Login.play(context);

    const link = await canvas.findByRole("link", { name: /add your own/i });
    await userEvent.click(link);

    await NewValidJoke.play(context);
  },
};

export const RegisterUsedAccount = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const register = await canvas.findByLabelText("Register");
    await userEvent.click(register);

    const name = await canvas.findByLabelText("Username");
    await userEvent.type(name, "mr.bean", { delay: 10 });

    const password = await canvas.findByLabelText("Password");
    await userEvent.type(password, "testtest", { delay: 10 });

    const submitButton = await canvas.findByRole("button", { name: /submit/i });
    await userEvent.click(submitButton);
  },
} satisfies Story;

export const RegisterWithShortPassword = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const register = await canvas.findByLabelText("Register");
    await userEvent.click(register);

    const name = await canvas.findByLabelText("Username");
    await userEvent.type(name, "mr.bean2", { delay: 10 });

    const password = await canvas.findByLabelText("Password");
    await userEvent.type(password, "test", { delay: 10 });

    const submitButton = await canvas.findByRole("button", { name: /submit/i });
    await userEvent.click(submitButton);
  },
} satisfies Story;

export const RegisterNewAccount = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const register = await canvas.findByLabelText("Register");
    await userEvent.click(register);

    const name = await canvas.findByLabelText("Username");
    await userEvent.type(name, "mr.bean2", { delay: 10 });

    const password = await canvas.findByLabelText("Password");
    await userEvent.type(password, "testtest", { delay: 10 });

    const submitButton = await canvas.findByRole("button", { name: /submit/i });
    await userEvent.click(submitButton);
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
