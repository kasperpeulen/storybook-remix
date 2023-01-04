import type { ActionFunctionArgs, LoaderFunctionArgs, Location } from "@remix-run/router";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import IndexRoute, { links as indexLinks } from "~/routes";
import JokesRoute, { loader as jokesLoader, links as jokesLinks } from "~/routes/jokes";
import JokesIndexRoute, { loader as jokesIndexLoader } from "~/routes/jokes/index";
import NewJokeRoute, { action as newJokeAction } from "~/routes/jokes/new";
import JokeRoute, { ErrorBoundary, loader as jokeLoader } from "~/routes/jokes/$jokeId";
import type { TestContext } from "~/test/context/context";
import { createTestContext } from "~/test/context/context";
import type { Prisma } from "@prisma/client";
import { createPrismaMock } from "~/test/utils/prisma-mock";
import dmmf from "../../prisma/dmmf.json";
import { useEffect, useRef } from "react";
import type { ActionFunction, LoaderFunction, SessionData } from "@remix-run/node";
import Login, { action as loginAction, links as loginLinks } from "~/routes/login";
import { action as logoutAction } from "~/routes/logout";
import { createSeedData } from "~/test/mocks/seed";
import { cookieKey } from "~/utils/session";
import { createTestLayer } from "~/test/context/test-layer";
import { LiveClock, sleep, TestClock } from "./utils/clock";
import { getJokes } from "~/test/mocks/jokes";
import { getUsers } from "~/test/mocks/users";
import type { LinksFunction } from "@remix-run/node";
import { isPageLinkDescriptor } from "@remix-run/react/dist/links";
import { PrefetchPageLinks } from "@remix-run/react";
import * as React from "react";

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
  clock: "test" | "live";
  testClockDate: Date;

  jokes: Prisma.JokeUncheckedCreateInput[];
  users: Prisma.UserUncheckedCreateInput[];

  onLocationChanged(location: Location): void;

  onQuery(event: DbEvent): void;
  onRequest(request: object): void;
  onResponse(response: object): void;
  onMutate(event: DbEvent): void;

  onCookieSet(data: SessionData & { cookie: string; expires: Date }): void;
}

export interface DbEvent {
  model: string;
  action: string;
}

export const testAppDefaultProps = {
  url: "/",
  loggedInUser: "kody",
  connection: "super fast",
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
  onQuery,
  onMutate,
  onCookieSet,
  connection,
  onRequest,
  onResponse,
  clock,
  testClockDate,
}: TestAppStoryProps) {
  const testLayer = createTestLayer({ clock: clock === "test" ? new TestClock(testClockDate) : new LiveClock() });
  const dataModel = dmmf.datamodel as Prisma.DMMF.Datamodel;
  const ctx = createTestContext({
    db: createPrismaMock(dataModel, {
      data: createSeedData({ jokes, users }),
      ...testLayer,
    }),
  });

  return (
    <TestApp
      url={url}
      delay={connection === "super fast" ? 0 : connection === "fast" ? 100 : connection === "slow" ? 500 : 1000}
      username={loggedInUser === "none" ? undefined : loggedInUser}
      ctx={ctx}
      onLocationChanged={onLocationChanged}
      onCookieSet={onCookieSet}
      onResponse={(response) =>
        onResponse({
          headers: Object.fromEntries(response.headers),
          status: response.status,
          statusText: response.statusText,
        })
      }
      onRequest={(request) =>
        onRequest({ method: request.method, url: request.url, headers: Object.fromEntries(request.headers) })
      }
      onDbAction={(params) => {
        const event = params.action.includes("find") || params.action === "count" ? onQuery : onMutate;
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
        ? new Date(ctx.testLayer.clock.now().getTime() + options["Max-Age"] * 1000)
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

    if (cookieRef.current && cookieRef.current.expires < ctx.testLayer.clock.now()) {
      console.log("Cookie expired");
      cookieRef.current = undefined;
    }

    if (cookieRef.current) args.request.headers.set(`${cookieKey}`, cookieRef.current.cookie);

    onRequest(args.request);

    await sleep(0);
    const response = await fn({ ...args, context: ctx });
    await sleep(delay);

    if (response instanceof Response) {
      onResponse(response);
      const newCookie = response.headers.get(`Set-${cookieKey}`);
      if (newCookie != null) await setCookie(newCookie);
    }

    return response;
  };

  const router = createMemoryRouter(
    [
      {
        path: "/",
        element: (
          <>
            <Links links={indexLinks} />
            <IndexRoute />
          </>
        ),
      },
      {
        path: "jokes",
        loader: withMiddleware(jokesLoader),
        element: (
          <>
            <Links links={jokesLinks} />
            <JokesRoute />
          </>
        ),
        children: [
          {
            index: true,
            loader: withMiddleware(jokesIndexLoader),
            element: <JokesIndexRoute />,
          },
          {
            path: "new",
            element: <NewJokeRoute />,
            action: withMiddleware(newJokeAction),
          },
          {
            path: ":jokeId",
            loader: withMiddleware(jokeLoader),
            element: <JokeRoute />,
            errorElement: <ErrorBoundary />,
          },
        ],
      },
      {
        path: "login",
        // TODO Somehow when changing stories the preloading doesn't work well.
        // This works, but a bit tedious, could be abstracted.
        loader: () => waitFor('link[href="/app/styles/login.css"][rel="stylesheet"]'),
        element: (
          <>
            <Links links={loginLinks} />
            <Login />
          </>
        ),
        action: withMiddleware(loginAction),
      },
      {
        path: "logout",
        action: withMiddleware(logoutAction),
      },
    ],
    {
      initialEntries: [url],
    }
  );

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

  return (
    <>
      {/**
       * Preloading links as we mock Remix <link/>'s by running them in the body instead of the head with React Router.
       * This causes flashes of un styled content if not preloaded.
       */}
      {[...indexLinks(), ...jokesLinks(), ...loginLinks()].map((link, i) => (
        <link key={i} {...link} rel="preload" as="style" />
      ))}
      <RouterProvider router={router} />
    </>
  );
}

export function Links({ links }: { links: LinksFunction }) {
  return (
    <>
      {links().map((link) => {
        // Copied from https://github.com/remix-run/remix/blob/main/packages/remix-react/components.tsx#L563-L600
        if (isPageLinkDescriptor(link)) {
          return <PrefetchPageLinks key={link.page} {...link} />;
        }

        let imageSrcSet: string | null = null;

        // In React 17, <link imageSrcSet> and <link imageSizes> will warn
        // because the DOM attributes aren't recognized, so users need to pass
        // them in all lowercase to forward the attributes to the node without a
        // warning. Normalize so that either property can be used in Remix.
        if ("useId" in React) {
          if (link.imagesrcset) {
            link.imageSrcSet = imageSrcSet = link.imagesrcset;
            delete link.imagesrcset;
          }

          if (link.imagesizes) {
            link.imageSizes = link.imagesizes;
            delete link.imagesizes;
          }
        } else {
          if (link.imageSrcSet) {
            link.imagesrcset = imageSrcSet = link.imageSrcSet;
            delete link.imageSrcSet;
          }

          if (link.imageSizes) {
            link.imagesizes = link.imageSizes;
            delete link.imageSizes;
          }
        }

        return (
          <link
            id={link.rel + (link.href || "") + (imageSrcSet || "")}
            key={link.rel + (link.href || "") + (imageSrcSet || "")}
            {...link}
          />
        );
      })}
    </>
  );
}

export default function waitFor(selector: string, times = 20): Promise<null> {
  if (document.querySelector(selector) === null && times > 0) {
    return new Promise(requestAnimationFrame).then(() => waitFor(selector, --times));
  } else {
    return Promise.resolve(null);
  }
}
