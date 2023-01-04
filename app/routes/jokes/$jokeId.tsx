import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/server-runtime";
import { Link, useLoaderData, useParams } from "@remix-run/react";

export const loader = (async ({ params, context: ctx }) => {
  const { db } = ctx;
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });
  if (!joke) {
    throw new Error("Joke not found");
  }
  if (Math.random() > 2) {
    throw new Error("Unreachable");
  }
  return json({ joke });
}) satisfies LoaderFunction;

export default function JokeRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>{data.joke.content}</p>
      <Link to=".">{data.joke.name} Permalink</Link>
    </div>
  );
}

export function ErrorBoundary() {
  const { jokeId } = useParams();
  return <div className="error-container">{`There was an error loading joke by the id ${jokeId}. Sorry.`}</div>;
}
