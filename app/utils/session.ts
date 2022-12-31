import bcrypt from "bcryptjs";
import { redirect } from "@remix-run/server-runtime";
import type { Context } from "~/context/context";

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

function getUserSession(ctx: Context, request: Request) {
  const cookie = request.headers.get(cookieKey);
  return ctx.sessionStorage.getSession(cookie);
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
  const session = await getUserSession(ctx, request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function getUser(ctx: Context, request: Request) {
  const { db } = ctx;
  const userId = await getUserId(ctx, request);
  if (typeof userId !== "string") {
    return null;
  }

  try {
    return await db.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true },
    });
  } catch {
    throw logout(ctx, request);
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
  const cookie = await ctx.sessionStorage.commitSession(session);

  return redirect(redirectTo, {
    headers: {
      [`Set-${cookieKey}`]: cookie,
    },
  });
}

// You can not set the Set-Cookie of a Response or the Cookie header of a request in the browser
// So we use Test-Cookie for that, for browser testing.
export const cookieKey = typeof document === "undefined" ? "Cookie" : "Test-Cookie";
