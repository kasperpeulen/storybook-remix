import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/server-runtime";
import { Form, Link, Outlet, useLoaderData } from "@remix-run/react";

import { getUser } from "~/utils/session";
import stylesUrl from "../styles/jokes.css?url";

export const loader = async ({ request, context: ctx }: LoaderArgs) => {
  const { db } = ctx;
  const user = await getUser(ctx, request);

  const jokeListItems = await db.joke.findMany({
    take: 5,
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });

  return json({ jokeListItems, user });
};

export const links: LinksFunction = () => [{ rel: "stylesheet", href: stylesUrl }];

export default function JokesScreen() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="jokes-layout">
      <header className="jokes-header">
        <div className="container">
          <h1 className="home-link">
            <Link to="/" title="Remix Jokes" aria-label="Remix Jokes">
              <span className="logo">🤪</span>
              <span className="logo-medium">J🤪KES</span>
            </Link>
          </h1>
          {data.user ? (
            <div className="user-info">
              <span>{`Hi ${data.user.username}`}</span>
              <Form action="/logout" method="post">
                <button type="submit" className="button">
                  Logout
                </button>
              </Form>
            </div>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>
      <main className="jokes-main">
        <div className="container">
          <div className="jokes-list">
            <Link to=".">Get a random joke</Link>
            <p>Here are a few more jokes to check out:</p>
            <ul>
              {data.jokeListItems?.map(({ id, name }) => (
                <li key={id}>
                  <Link to={id} /* not supported yet in React Router prefetch="intent" */>{name}</Link>
                </li>
              ))}
            </ul>
            <Link to="new" className="button">
              Add your own
            </Link>
          </div>
          <div className="jokes-outlet">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
