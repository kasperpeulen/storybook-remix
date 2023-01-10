import { redirect } from "@remix-run/server-runtime";
import type { SessionIdStorageStrategy } from "@remix-run/server-runtime";
import * as bcrypt from "@isbl/bcryptjs";
import type { Context } from "~/context";

type LoginForm = {
  username: string;
  password: string;
};

export async function register(ctx: Context, { username, password }: LoginForm) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await ctx.db.user.create({
    data: { username, passwordHash },
  });
  return { id: user.id, username };
}

export async function login(ctx: Context, { username, password }: LoginForm) {
  const user = await ctx.db.user.findUnique({
    where: { username },
  });
  if (!user) return null;
  const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isCorrectPassword) return null;
  return { id: user.id, username };
}

export const createCookieOptions = ({ secrets }: { secrets: string[] }): SessionIdStorageStrategy["cookie"] => {
  return {
    name: "RJ_session",
    secrets,
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  };
};

export function getUserSession(ctx: Context, request: Request) {
  return ctx.sessionStorage.getSession(request.headers.get(cookieKey));
}

export async function getUserId(ctx: Context, request: Request) {
  const session = await getUserSession(ctx, request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") return null;
  return userId;
}

export async function requireUserId(
  ctx: Context,
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userId = await getUserId(ctx, request);
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function getUser(ctx: Context, request: Request) {
  const userId = await getUserId(ctx, request);
  if (typeof userId !== "string") {
    return null;
  }

  try {
    const user = await ctx.db.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true },
    });
    return user;
  } catch {
    throw await logout(ctx, request);
  }
}

export async function logout(ctx: Context, request: Request) {
  const session = await getUserSession(ctx, request);
  return redirect("/login", {
    headers: {
      [`Set-${cookieKey}`]: await ctx.sessionStorage.destroySession(session),
    },
  });
}

export async function createUserSession(ctx: Context, userId: string, redirectTo: string) {
  const session = await ctx.sessionStorage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      [`Set-${cookieKey}`]: await ctx.sessionStorage.commitSession(session),
    },
  });
}

// You can not set the Set-Cookie of a Response or the Cookie header of a request in the browser
// So we use Test-Cookie for that, for browser testing.
export const cookieKey = typeof document === "undefined" ? "Cookie" : "Test-Cookie";
