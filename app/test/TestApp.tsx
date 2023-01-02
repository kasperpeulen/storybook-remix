import type { ActionFunctionArgs, LoaderFunctionArgs, Location } from "@remix-run/router";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import IndexRoute from "~/routes";
import JokesRoute, { loader as jokesLoader } from "~/routes/jokes";
import JokesIndexRoute, { loader as jokesIndexLoader } from "~/routes/jokes/index";
import NewJokeRoute, { action as newJokeAction } from "~/routes/jokes/new";
import JokeRoute, { ErrorBoundary, loader as jokeLoader } from "~/routes/jokes/$jokeId";
import { createTestContext } from "~/test/context/context";
import type { Prisma } from "@prisma/client";
import type { Event } from "~/test/utils/prisma-mock";
import { createPrismaMock } from "~/test/utils/prisma-mock";
import dmmf from "../../prisma/dmmf.json";
import { useEffect, useRef } from "react";
import type { ActionFunction, LoaderFunction, SessionData } from "@remix-run/node";
import Login, { action as loginAction } from "~/routes/login";
import { action as logoutAction } from "~/routes/logout";
import { createSeedData } from "~/test/mocks/seed";
import { cookieKey } from "~/utils/session";
import { createTestLayer } from "~/test/context/test-layer";
import { LiveClock, sleep, TestClock } from "./utils/clock";
import { getJokes } from "~/test/mocks/jokes";
import { getUsers } from "~/test/mocks/users";

interface TestAppProps {
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

  onQuery(event: Event): void;
  onRequest(request: object): void;
  onResponse(response: object): void;
  onMutate(event: Event): void;

  onCookieSet(data: SessionData & { cookie: string; expires: Date }): void;
}

export const testAppDefaultProps = {
  url: "/",
  loggedInUser: "kody",
  connection: "super fast",
  clock: "test",
  testClockDate: new Date(2022, 11, 25),
  jokes: getJokes(),
  users: getUsers(),
} satisfies Partial<TestAppProps>;

export function TestApp({
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
}: TestAppProps) {
  const dataModel = dmmf.datamodel as Prisma.DMMF.Datamodel;
  const testLayer = createTestLayer({ clock: clock === "test" ? new TestClock(testClockDate) : new LiveClock() });
  const ctx = createTestContext({
    db: createPrismaMock(dataModel, {
      onMutate,
      onQuery,
      data: createSeedData({ jokes, users }),
      ...testLayer,
    }),
  });

  const cookieRef = useRef<{ cookie: string; expires: Date; options: Record<string, string> } | undefined>();

  async function setCookie(cookieHeader: string) {
    const [cookie, ...rawOptions] = cookieHeader.split("; ");
    const options = Object.fromEntries(rawOptions.map((it) => it.split("=")));
    const expires =
      typeof options["Max-Age"] !== "undefined"
        ? new Date(testLayer.clock.now().getTime() + options["Max-Age"] * 1000)
        : new Date(options["Expires"]);
    cookieRef.current = { cookie, expires, options: options };
    const session = await ctx.sessionStorage.getSession(cookie);
    onCookieSet({ cookie, expires, ...session.data, ...options });
  }

  const withMiddleware =
    (fn: LoaderFunction | ActionFunction) => async (args: LoaderFunctionArgs | ActionFunctionArgs) => {
      if ((onCookieSet as jest.Mock).mock.calls.length === 0) {
        if (loggedInUser !== "none") {
          const user = await ctx.db.user.findUnique({ where: { username: loggedInUser } });
          if (user) {
            const session = await ctx.sessionStorage.getSession();
            session.set("userId", user.id);
            await setCookie(await ctx.sessionStorage.commitSession(session));
          }
        } else {
          cookieRef.current = undefined;
        }
      }

      if (cookieRef.current && cookieRef.current.expires < testLayer.clock.now()) {
        console.log("Cookie expired");
        cookieRef.current = undefined;
      }

      if (cookieRef.current) {
        args.request.headers.set(`${cookieKey}`, cookieRef.current.cookie);
      }

      onRequest({
        method: args.request.method,
        url: args.request.url,
        headers: Object.fromEntries(args.request.headers),
      });

      const response = await fn({ ...args, context: ctx });

      if (connection !== "super fast") {
        await sleep(connection === "fast" ? 100 : connection === "slow" ? 500 : 1000);
      }

      if (response instanceof Response) {
        onResponse({
          headers: Object.fromEntries(response.headers),
          status: response.status,
          statusText: response.statusText,
        });
        const newCookie = response.headers.get(`Set-${cookieKey}`);
        if (newCookie != null) await setCookie(newCookie);
      }

      return response;
    };

  const router = createMemoryRouter(
    [
      {
        path: "/",
        element: <IndexRoute />,
      },
      {
        path: "jokes",
        loader: withMiddleware(jokesLoader),
        element: <JokesRoute />,
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
        element: <Login />,
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
    return router.subscribe(({ location, navigation }) => {
      if (navigation.state === "idle") onLocationChanged(location);
    });
  }, [router, onLocationChanged]);

  return <RouterProvider router={router} />;
}
