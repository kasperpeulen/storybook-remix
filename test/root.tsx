import { createMemoryRouter, RouterProvider } from "react-router-dom";
import IndexRoute from "~/routes";
import JokesRoute from "~/routes/jokes";
import JokesIndexRoute from "~/routes/jokes/index";

interface TestRootProps {
  /**
   * The url of the application, can be one of:
   * * "/"
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
