import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  Location,
  Router,
} from "@remix-run/router";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import IndexRoute from "~/routes";
import JokesRoute, { loader as jokesLoader } from "~/routes/jokes";
import JokesIndexRoute, {
  loader as jokesIndexLoader,
} from "~/routes/jokes/index";
import NewJokeRoute, { action as newJokeAction } from "~/routes/jokes/new";
import JokeRoute, { loader as jokeLoader } from "~/routes/jokes/$jokeId";
import { createTestContext } from "~/context/test-context";
import type { Prisma } from "@prisma/client";
import type { Event } from "~/utils/prisma-mock";
import { createPrismaMock } from "~/utils/prisma-mock";
import dmmf from "../prisma/dmmf.json";
import { useEffect, useRef, useState } from "react";
import type {
  ActionFunction,
  LoaderFunction,
  SessionData,
} from "@remix-run/node";
import Login, { action as loginAction } from "~/routes/login";
import { action as logoutAction } from "~/routes/logout";
import { createSeedData } from "~/mocks/seed";
import { cookieKey } from "~/utils/session";
import { createTestLayer } from "~/context/test-layer";
import { sleep } from "~/context/clock";

interface TestRootProps {
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
  connection?: "super fast" | "fast" | "slow" | "super slow";
  jokes?: Prisma.JokeUncheckedCreateInput[];
  users?: Prisma.UserUncheckedCreateInput[];

  onLocationChanged(location: Location): void;

  onQuery(event: Event): void;

  onMutate(event: Event): void;

  onCookieSet(data: SessionData & { cookie: string }): void;
}

export function TestRoot({
  url,
  loggedInUser,
  jokes,
  users,
  onLocationChanged,
  onQuery,
  onMutate,
  onCookieSet,
  connection,
}: TestRootProps) {
  const [router, setRouter] = useState<Router | undefined>();
  const cookie = useRef<string | undefined>();

  useEffect(() => {
    (async () => {
      const dataModel = dmmf.datamodel as Prisma.DMMF.Datamodel;
      const ctx = createTestContext({
        db: createPrismaMock(dataModel, {
          onMutate,
          onQuery,
          data: createSeedData({ jokes, users }),
          ...createTestLayer(),
        }),
      });

      if (loggedInUser !== "none") {
        const user = await ctx.db.user.findUnique({
          where: { username: loggedInUser },
        });
        if (user) {
          const session = await ctx.sessionStorage.getSession();
          session.set("userId", user.id);
          cookie.current = await ctx.sessionStorage.commitSession(session);
          onCookieSet({ cookie: cookie.current, ...session.data });
        }
      }

      const withMiddleware =
        (fn: LoaderFunction | ActionFunction) =>
        async (args: LoaderFunctionArgs | ActionFunctionArgs) => {
          if (cookie.current) {
            args.request.headers.set(`${cookieKey}`, cookie.current);
          }
          let response = await fn({ ...args, context: ctx });
          if (response instanceof Response) {
            const newCookie = response.headers.get(`Set-${cookieKey}`);
            if (newCookie != null) {
              cookie.current = newCookie;
              const session = await ctx.sessionStorage.getSession(newCookie);
              onCookieSet({ cookie: newCookie, ...session.data });
              console.log("onCookieSet", {
                cookie: newCookie,
                ...session.data,
              });
            }
          }
          await sleep(
            connection === "fast"
              ? 100
              : connection === "slow"
              ? 500
              : connection === "super slow"
              ? 1000
              : 0
          );
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

      setRouter(router);
      router.subscribe(({ location, navigation }) => {
        if (navigation.state === "idle") onLocationChanged(location);
      });
    })();
  }, [
    jokes,
    url,
    onLocationChanged,
    onQuery,
    onMutate,
    loggedInUser,
    onCookieSet,
    users,
    connection,
  ]);

  if (router == null) return null;

  return <RouterProvider router={router} />;
}
