import { createMemoryRouter, RouterProvider } from "react-router-dom";
import IndexRoute from "~/routes";

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
        ],
        {
          initialEntries: [path],
        }
      )}
    />
  );
}
