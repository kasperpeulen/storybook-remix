import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/server-runtime";
import { Link, useLoaderData } from "@remix-run/react";

export const loader = (async ({ params, context: { db } }) => {
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });
  if (!joke) {
    throw new Error("Joke not found");
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
