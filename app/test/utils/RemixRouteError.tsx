import { useLocation } from "@remix-run/react";
import { useRouteError } from "react-router";
import { RemixCatchBoundary, RemixErrorBoundary } from "@remix-run/react/dist/errorBoundaries";
import React from "react";
import { ErrorResponse } from "@remix-run/router";
import { ErrorBoundary as RootErrorBoundary } from "~/root";
import type { CatchBoundaryComponent, ErrorBoundaryComponent } from "@remix-run/server-runtime/dist/routeModules";

/**
 * Adapted from https://github.com/remix-run/remix/blob/7f81a3e83107ac13ec25193e327d6011ba4a622f/packages/remix-react/components.tsx#L143-L211
 */
export function RemixRouteError({
  CatchBoundary,
  ErrorBoundary,
}: {
  CatchBoundary?: CatchBoundaryComponent;
  ErrorBoundary?: ErrorBoundaryComponent;
}) {
  let error = useRouteError();
  const location = useLocation();
  if (error instanceof ErrorResponse) {
    if (error.status === 500 && ErrorBoundary) {
      return <RemixErrorBoundary location={location} component={ErrorBoundary} error={error.data} />;
    }
    if (CatchBoundary) {
      return <RemixCatchBoundary component={CatchBoundary} catch={error} />;
    }
  }
  return (
    <RemixErrorBoundary
      location={location}
      component={RootErrorBoundary}
      error={error instanceof Error ? error : new Error(error?.toString())}
    />
  );
}
