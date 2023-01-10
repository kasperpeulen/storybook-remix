import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/server-runtime";

import { logout } from "~/utils/session";

export const action = async ({ request, context: ctx }: ActionArgs) => logout(ctx, request);

export const loader = async () => redirect("/");
