import { json } from "@remix-run/server-runtime";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";

export const loader = (async ({ context: { db, random } }) => {
  const count = await db.joke.count();
  const randomRowNumber = Math.floor(random.getNumber() * count);
  const [randomJoke] = await db.joke.findMany({
    take: 1,
    skip: randomRowNumber,
  });
  return json({ randomJoke });
}) satisfies LoaderFunction;

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
