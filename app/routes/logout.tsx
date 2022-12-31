import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/server-runtime";

import { logout } from "~/utils/session";

export const action = (async ({ request, context: ctx }) => {
  return logout(ctx, request);
}) satisfies ActionFunction;

export const loader = (() => redirect("/")) satisfies LoaderFunction;
