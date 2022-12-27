import { createMemoryRouter, RouterProvider } from "react-router-dom";
import IndexRoute from "~/routes";
import JokesRoute from "~/routes/jokes";
import JokesIndexRoute from "~/routes/jokes/index";
import NewJokeRoute from "~/routes/jokes/new";
import JokeRoute from "~/routes/jokes/$jokeId";

interface TestRootProps {
  /**
   * The url of the application, can be one of:
   * * "/"
   * * "/jokes"
   * * "/jokes/new"
   * * "/jokes/:jokeId"
   */
  path: string;
}

export function TestRoot({ path }: TestRootProps) {
  return (
    <RouterProvider
      router={createMemoryRouter(
        [
          {
            path: "/",
            element: <IndexRoute />,
          },
          {
            path: "jokes",
            element: <JokesRoute />,
            children: [
              {
                index: true,
                element: <JokesIndexRoute />,
              },
              {
                path: "new",
                element: <NewJokeRoute />,
              },
              {
                path: ":jokeId",
                element: <JokeRoute />,
              },
            ],
          },
        ],
        {
          initialEntries: [path],
        }
      )}
    />
  );
}
