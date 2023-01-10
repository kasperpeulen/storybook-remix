import type { ActionFunction, LinksFunction, LoaderFunction } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/router";

import type { RouteObject } from "react-router-dom";
import { createMemoryRouter } from "react-router-dom";
import * as IndexModule from "~/routes";
import * as JokesModule from "~/routes/jokes";
import * as JokesIndexModule from "~/routes/jokes/index";
import * as NewJokeModule from "~/routes/jokes/new";
import * as JokeModule from "~/routes/jokes/$jokeId";
import * as LoginModule from "~/routes/login";
import * as LogoutModule from "~/routes/logout";
import { RemixRouteError } from "~/test/utils/RemixRouteError";
import type { ServerRouteModule } from "@remix-run/server-runtime/dist/routeModules";
import { isPageLinkDescriptor } from "@remix-run/react/dist/links";
import { PrefetchPageLinks } from "@remix-run/react";
import * as React from "react";

type DataFunction = LoaderFunction | ActionFunction;
type DataFunctionArgs = LoaderFunctionArgs | ActionFunctionArgs;
type Middleware = (fn: DataFunction) => (args: DataFunctionArgs) => ReturnType<DataFunction>;

export function createTestRouter({ middleware, url }: { middleware: Middleware; url: string }) {
  return createMemoryRouter(
    [
      {
        path: "/",
        ...routeFromModule({ module: IndexModule, middleware }),
      },
      {
        path: "jokes",
        ...routeFromModule({ module: JokesModule, middleware }),
        children: [
          {
            index: true,
            ...routeFromModule({ module: JokesIndexModule, middleware }),
          },
          {
            path: "new",
            ...routeFromModule({ module: NewJokeModule, middleware }),
          },
          {
            path: ":jokeId",
            ...routeFromModule({ module: JokeModule, middleware }),
          },
        ],
      },
      {
        path: "login",
        ...routeFromModule({ module: LoginModule, middleware }),
      },
      {
        path: "logout",
        ...routeFromModule({ module: LogoutModule, middleware }),
      },
    ],
    {
      initialEntries: [url],
    }
  );
}

function routeFromModule({ module, middleware }: { module: Partial<ServerRouteModule>; middleware: Middleware }) {
  const Component = module.default;
  return {
    loader: module.loader ? middleware(module.loader) : undefined,
    action: module.action ? middleware(module.action) : undefined,
    element: Component ? (
      <>
        {module.links && <Links links={module.links} />}
        <Component />
      </>
    ) : undefined,
    errorElement: <RemixRouteError ErrorBoundary={module.ErrorBoundary} CatchBoundary={module.CatchBoundary} />,
  } satisfies RouteObject;
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
