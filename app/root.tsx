import type { LinksFunction } from "@remix-run/node";
import { Links, LiveReload, Outlet } from "@remix-run/react";

import globalStylesUrl from "./styles/global.css?url";
import globalMediumStylesUrl from "./styles/global-medium.css?url";
import globalLargeStylesUrl from "./styles/global-large.css?url";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: globalStylesUrl },
    { rel: "stylesheet", href: globalMediumStylesUrl, media: "print, (min-width: 640px)" },
    { rel: "stylesheet", href: globalLargeStylesUrl, media: "screen and (min-width: 1024px)" },
  ];
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Remix: So great, it's funny!</title>
        <Links />
      </head>
      <body>
        <Outlet />
        <LiveReload />
      </body>
    </html>
  );
}
