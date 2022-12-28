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
}

export function TestRoot({ url, jokes, onLocationChanged }: TestRootProps) {
  const datamodel = dmmf.datamodel as Prisma.DMMF.Datamodel;
  const [router, setRouter] = useState<Router | undefined>();

  useEffect(() => {
    (async () => {
      const context = createTestContext({ db: createPrismaMock(datamodel) });
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
      router.subscribe(({ location }) => {
        onLocationChanged(location);
      });
      setRouter(router);
    })();
  }, [jokes, url, onLocationChanged]);

  if (router == null) return null;

  return <RouterProvider router={router} />;
}
