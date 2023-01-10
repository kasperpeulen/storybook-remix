import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/server-runtime";
import { useLoaderData, useParams } from "@remix-run/react";
import { useCatch } from "@remix-run/react/dist/errorBoundaries";

import { getUserId, requireUserId } from "~/utils/session";
import { JokeDisplay } from "~/components/JokeDisplay";

export const loader = async ({ params, request, context: ctx }: LoaderArgs) => {
  const { db } = ctx;
  const joke = await db.joke.findUnique({ where: { id: params.jokeId } });
  if (!joke) {
    throw new Response("What a joke! Not found.", { status: 404 });
  }
  const userId = await getUserId(ctx, request);
  return json({ joke, isOwner: userId === joke.jokesterId });
};

export const action = async ({ params, request, context: ctx }: ActionArgs) => {
  const { db } = ctx;

  const form = await request.formData();
  if (form.get("intent") !== "delete") {
    throw new Response(`The intent ${form.get("intent")} is not supported`, {
      status: 400,
    });
  }
  const userId = await requireUserId(ctx, request);
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });
  if (!joke) {
    throw new Response("Can't delete what does not exist", { status: 404 });
  }
  if (joke.jokesterId !== userId) {
    throw new Response("Pssh, nice try. That's not your joke", {
      status: 403,
    });
  }
  await db.joke.delete({ where: { id: params.jokeId } });
  return redirect("/jokes");
};

export default function JokeRoute() {
  const data = useLoaderData<typeof loader>();

  return <JokeDisplay joke={data.joke} isOwner={data.isOwner} />;
}

export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();
  switch (caught.status) {
    case 400: {
      return <div className="error-container">What you're trying to do is not allowed.</div>;
    }
    case 404: {
      return <div className="error-container">Huh? What the heck is {params.jokeId}?</div>;
    }
    case 403: {
      return <div className="error-container">Sorry, but {params.jokeId} is not your joke.</div>;
    }
    default: {
      throw new Error(`Unhandled error: ${caught.status}`);
    }
  }
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  const { jokeId } = useParams();
  return <div className="error-container">There was an error loading joke by the id {jokeId}. Sorry.</div>;
}
