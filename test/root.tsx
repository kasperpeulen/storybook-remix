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
import { getJokes } from "~/mocks/jokes";
import { useEffect, useState } from "react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";

interface TestRootProps {
  /**
   * The url of the application, can be one of:
   * * "/"
   * * "/jokes"
   * * "/jokes/new"
   * * "/jokes/:jokeId"
   */
  url: string;

  jokes?: Prisma.JokeCreateInput[];

  onLocationChanged(location: Location): void;

  onMutate(event: Event): void;
  onQuery(event: Event): void;
}

export function TestRoot({
  url,
  jokes,
  onLocationChanged,
  onQuery,
  onMutate,
}: TestRootProps) {
  const [router, setRouter] = useState<Router | undefined>();

  useEffect(() => {
    (async () => {
      const dataModel = dmmf.datamodel as Prisma.DMMF.Datamodel;
      const context = createTestContext({
        db: createPrismaMock(dataModel, { onMutate, onQuery }),
      });
      // createPrismaMock also have a second (sync) data argument, but then ids won't be created
      // TODO fix that
      for (const joke of jokes ?? getJokes()) {
        await new Promise((r) => setTimeout(r, 1));
        await context.db.joke.create({ data: joke });
      }
      const withContext =
        (fn: LoaderFunction | ActionFunction) =>
        (args: LoaderFunctionArgs | ActionFunctionArgs) =>
          fn({ ...args, context });

      const router = createMemoryRouter(
        [
          {
            path: "/",
            element: <IndexRoute />,
          },
          {
            path: "jokes",
            loader: withContext(jokesLoader),
            element: <JokesRoute />,
            children: [
              {
                index: true,
                loader: withContext(jokesIndexLoader),
                element: <JokesIndexRoute />,
              },
              {
                path: "new",
                element: <NewJokeRoute />,
                action: withContext(newJokeAction),
              },
              {
                path: ":jokeId",
                loader: withContext(jokeLoader),
                element: <JokeRoute />,
              },
            ],
          },
        ],
        {
          initialEntries: [url],
        }
      );

      setRouter(router);
      return router.subscribe(({ location, navigation }) => {
        if (navigation.state === "idle") onLocationChanged(location);
      });
    })();
  }, [jokes, url, onLocationChanged, onQuery, onMutate]);

  if (router == null) return null;

  return <RouterProvider router={router} />;
}
