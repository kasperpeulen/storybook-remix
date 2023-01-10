import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/server-runtime";
import { Link, useLoaderData } from "@remix-run/react";
import { useCatch } from "@remix-run/react/dist/errorBoundaries";

export const loader = async ({ request, context: ctx }: LoaderArgs) => {
  const count = await ctx.db.joke.count();
  const randomRowNumber = Math.floor(ctx.random.getNumber() * count);

  const [randomJoke] = await ctx.db.joke.findMany({
    take: 1,
    skip: randomRowNumber,
  });
  if (!randomJoke) {
    throw new Response("No jokes to be found!", { status: 404 });
  }
  return json({ randomJoke });
};

export default function JokesIndexRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <p>Here's a random joke:</p>
      <p>{data.randomJoke.content}</p>
      <Link to={data.randomJoke.id}>"{data.randomJoke.name}" Permalink</Link>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught?.status === 404) {
    return (
      <div className="error-container">
        <p>There are no jokes to display.</p>
        <Link to="new">Add your own</Link>
      </div>
    );
  }
  throw new Error(`Unexpected caught response with status: ${caught?.status}`);
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return <div>I did a whoopsies.</div>;
}
