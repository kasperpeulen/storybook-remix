import type { ActionFunctionArgs, LoaderFunctionArgs, Location } from "@remix-run/router";
import type { Prisma } from "@prisma/client";
import * as React from "react";
import { useEffect, useRef } from "react";
import type { ActionFunction, LoaderFunction, SessionData } from "@remix-run/node";
import { RouterProvider } from "react-router-dom";

import type { TestContext } from "~/test/test-context";
import { createTestContext, createTestLayer } from "~/test/test-context";
import { createPrismaMock } from "~/test/utils/prisma-mock";
import { createSeedData } from "~/test/mocks/seed";
import { cookieKey } from "~/utils/session";
import { LiveClock, sleep, TestClock } from "./utils/clock";
import { getJokes } from "~/test/mocks/jokes";
import { getUsers } from "~/test/mocks/users";
import dmmf from "../../prisma/dmmf.json";

import { createTestRouter } from "~/test/router";
import isChromatic from "chromatic";
import type { PlayContext } from "~/test/utils/storybook";
import type { Mock } from "jest-mock";
import { json } from "@remix-run/server-runtime";

interface TestAppStoryProps {
  /**
   * The url of the application, can be one of:
   * * "/"
   * * "/jokes"
   * * "/jokes/new"
   * * "/jokes/:jokeId"
   * * "/login"
   */
  url: string;
  loggedInUser: "none" | "kody" | "mr.bean";
  connection: "super fast" | "fast" | "slow" | "super slow";
  inputDelay: number;

  clock: "test" | "live";
  testClockDate: Date;

  jokes: Prisma.JokeUncheckedCreateInput[];
  users: Prisma.UserUncheckedCreateInput[];

  onLocationChanged(location: Location): void;

  onRequest(request: object): void;
  onResponse(response: object): void;
  onDbQuery(event: DbEvent): void;
  onDbMutate(event: DbEvent): void;

  onCookieSet(data: SessionData & { cookie: string; expires: Date }): void;
  onContextCreated(context: TestContext): void;
}

export interface DbEvent {
  model: string;
  action: string;
}

export const testAppDefaultProps = {
  url: "/",
  loggedInUser: "kody",
  connection: "super fast",
  inputDelay: isChromatic() || process.env.NODE_ENV === "test" ? 0 : 15,
  clock: "test",
  testClockDate: new Date(2022, 11, 25),
  jokes: getJokes(),
  users: getUsers(),
} satisfies Partial<TestAppStoryProps>;

/**
 * This component is mainly used to map storybook controls to the TestApp
 * Using unions of string literals so that you can easily select an option.
 * And also making sure that event emit plain javascript objects to inspect this in the action panel.
 *
 * This could have been a decorator as well, but then storybook won't auto generate docs and controls for it.
 */
export function TestAppStory({
  url,
  loggedInUser,
  jokes,
  users,
  onLocationChanged,
  onDbQuery,
  onDbMutate,
  onCookieSet,
  connection,
  onRequest,
  onResponse,
  clock,
  testClockDate,
  onContextCreated,
}: TestAppStoryProps) {
  const testLayer = createTestLayer({
    clock: clock === "test" ? new TestClock(testClockDate) : new LiveClock(),
  });
  const ctx = createTestContext({
    ...testLayer,
    db: createPrismaMock(dmmf.datamodel as Prisma.DMMF.Datamodel, {
      data: createSeedData({ jokes, users }),
      ...testLayer,
    }),
  });
  onContextCreated(ctx);

  return (
    <TestApp
      url={url}
      delay={connection === "super fast" ? 0 : connection === "fast" ? 100 : connection === "slow" ? 500 : 1000}
      username={loggedInUser === "none" ? undefined : loggedInUser}
      ctx={ctx}
      onLocationChanged={onLocationChanged}
      onCookieSet={onCookieSet}
      onResponse={async (response) => {
        const cloned = response.clone();
        const statusText = cloned.statusText;
        const status = cloned.status;
        const headers = Object.fromEntries(cloned.headers);
        // let body = await cloned.text();
        // try {
        //   body = JSON.parse(body);
        // } catch (e) {}
        onResponse({
          headers,
          status,
          statusText,
          // body,
        });
      }}
      onRequest={(request) =>
        onRequest({ method: request.method, url: request.url, headers: Object.fromEntries(request.headers) })
      }
      onDbAction={(params) => {
        const event = params.action.includes("find") || params.action === "count" ? onDbQuery : onDbMutate;
        event({
          model: params.model,
          action: params.action,
          ...params.args,
          // TODO use seperate event for tracking the data of the database
          // @ts-ignore
          db: params.db,
        });
      }}
    />
  );
}

export function TestApp({
  url,
  ctx,
  username,
  delay = 0,
  onLocationChanged,
  onCookieSet,
  onRequest,
  onResponse,
  onDbAction,
}: {
  url: string;
  username?: string;
  delay?: number;
  ctx: TestContext;
  onLocationChanged(location: Location): void;
  onCookieSet(data: SessionData & { cookie: string; expires: Date }): void;
  onRequest(request: Request): void;
  onResponse(response: Response): void;
  onDbAction(params: Prisma.MiddlewareParams): void;
}) {
  const cookieRef = useRef<{ cookie: string; expires: Date; options: Record<string, string> } | undefined>();

  async function setCookie(cookieHeader: string) {
    const [cookie, ...rawOptions] = cookieHeader.split("; ");
    const options = Object.fromEntries(rawOptions.map((it) => it.split("=")));
    const expires =
      typeof options["Max-Age"] !== "undefined"
        ? new Date(ctx.clock.now().getTime() + options["Max-Age"] * 1000)
        : new Date(options["Expires"]);
    cookieRef.current = { cookie, expires, options: options };
    const session = await ctx.sessionStorage.getSession(cookie);
    onCookieSet({ cookie, expires, ...session.data, ...options });
  }

  type DataFunction = LoaderFunction | ActionFunction;
  type DataFunctionArgs = LoaderFunctionArgs | ActionFunctionArgs;

  const withMiddleware = (fn: DataFunction) => async (args: DataFunctionArgs) => {
    if ((onCookieSet as jest.Mock).mock.calls.length === 0) {
      const user = username == null ? null : await ctx.db.user.findUnique({ where: { username } });
      if (user != null) {
        const session = await ctx.sessionStorage.getSession();
        session.set("userId", user.id);
        await setCookie(await ctx.sessionStorage.commitSession(session));
      } else {
        cookieRef.current = undefined;
      }
    }

    if (cookieRef.current && cookieRef.current.expires < ctx.clock.now()) {
      console.log("Cookie expired");
      cookieRef.current = undefined;
    }

    if (cookieRef.current) args.request.headers.set(`${cookieKey}`, cookieRef.current.cookie);

    onRequest(args.request);

    await sleep(0);
    let response;
    try {
      response = await fn({ ...args, context: ctx });
    } catch (e) {
      let response;
      if (e instanceof Response) {
        response = e;
      } else if (e instanceof Error) {
        response = json({ message: e.message, stack: e.stack }, { status: 500 });
      } else {
        response = json({ message: typeof e === "string" ? e : "" }, { status: 500 });
      }
      onResponse(response);
      throw response;
    }
    await sleep(delay);

    if (response instanceof Response) {
      onResponse(response);
      const newCookie = response.headers.get(`Set-${cookieKey}`);
      if (newCookie != null) await setCookie(newCookie);
    }

    return response;
  };

  const router = createTestRouter({ middleware: withMiddleware, url });

  useEffect(() => {
    ctx.db.$use((params, next) => {
      onDbAction(params);
      return next(params);
    });
  }, [ctx, onDbAction]);

  useEffect(() => {
    return router.subscribe(({ location, navigation }) => {
      if (navigation.state === "idle") onLocationChanged(location);
    });
  }, [router, onLocationChanged]);

  return <RouterProvider router={router} />;
}

export function getTestContext(playContext: PlayContext) {
  return (playContext.args.onContextCreated as Mock).mock.lastCall?.[0] as TestContext;
}
