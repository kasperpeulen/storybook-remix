import { PassThrough } from "stream";
import type { EntryContext } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { renderToPipeableStream } from "react-dom/server";

export default function (
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  return new Promise((resolve, reject) => {
    let didError = false;
    const { pipe, abort } = renderToPipeableStream(<RemixServer context={remixContext} url={request.url} />, {
      onShellReady() {
        const body = new PassThrough();
        responseHeaders.set("Content-Type", "text/html");
        resolve(new Response(body, { headers: responseHeaders, status: didError ? 500 : responseStatusCode }));
        pipe(body);
      },
      onShellError: reject,
      onError(error: unknown) {
        didError = true;
        console.error(error);
      },
    });
    setTimeout(abort, 5000);
  });
}
