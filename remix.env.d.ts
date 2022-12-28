/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node" />

import { Context } from "~/context/context";

declare module "@remix-run/node" {
  interface AppLoadContext extends Context {}
}
