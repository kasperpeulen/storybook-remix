import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

const hydrate = () =>
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <RemixBrowser />
      </StrictMode>
    );
  });

// Safari doesn't support requestIdleCallback https://caniuse.com/requestidlecallback
window.requestIdleCallback ? window.requestIdleCallback(hydrate) : window.setTimeout(hydrate, 1);
