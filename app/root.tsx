import type { LinksFunction } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts } from "@remix-run/react";
import { useCatch } from "@remix-run/react/dist/errorBoundaries";

import globalStylesUrl from "./styles/global.css?url";
import globalMediumStylesUrl from "./styles/global-medium.css?url";
import globalLargeStylesUrl from "./styles/global-large.css?url";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: globalStylesUrl },
    {
      rel: "stylesheet",
      href: globalMediumStylesUrl,
      media: "print, (min-width: 640px)",
    },
    {
      rel: "stylesheet",
      href: globalLargeStylesUrl,
      media: "screen and (min-width: 1024px)",
    },
  ];
};

function Document({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <html lang="en">
      <head>
        <Meta />
        {title ? <title>{title}</title> : null}
        <Links />
      </head>
      <body>
        {children}
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <div className="error-container">
        <h1>
          {caught.status} {caught.statusText}
        </h1>
      </div>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return (
    <Document title="Uh-oh!">
      <div className="error-container">
        <h1>App Error</h1>
        <pre>{error.message}</pre>
      </div>
    </Document>
  );
}
