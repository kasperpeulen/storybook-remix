import type { LinksFunction } from "@remix-run/node";
import { Links, LiveReload, Outlet } from "@remix-run/react";

import globalCss from "./styles/global.css";
import globalMediumCss from "./styles/global-medium.css";
import globalLargeCss from "./styles/global-large.css";

const rel = "stylesheet";
export const links: LinksFunction = () => {
  return [
    { rel, href: globalCss },
    { rel, href: globalMediumCss, media: "print, (min-width: 640px)" },
    { rel, href: globalLargeCss, media: "screen and (min-width: 1024px)" },
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
