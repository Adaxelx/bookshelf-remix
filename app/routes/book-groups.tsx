import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Button } from "~/components";
import { getUserBookGroups } from "~/models/bookGroup.server";
import { getUserId } from "~/session.server";
import { useOptionalUser } from "~/utils";

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);
  if (!userId) return redirect("/login");
  const bookGroups = await getUserBookGroups(userId);
  return json({ bookGroups });
}

export default function BookGroups() {
  const { bookGroups } = useLoaderData<typeof loader>();
  const user = useOptionalUser();
  return (
    <main className="p-3">
      <h1>Book groups</h1>
      <Button className="mb-3" to="new">
        Dodaj nową grupę
      </Button>
      <article className="flex flex-col gap-4">
        {bookGroups.map((bookGroup) => {
          const isAdmin = user?.id === bookGroup.creatorId;
          return (
            <Link to={bookGroup.slug} key={bookGroup.slug}>
              <section
                className={`flex items-center justify-between gap-2 rounded bg-primary-300 p-3`}
              >
                <p className="text-lg font-medium">{bookGroup.name}</p>
                {isAdmin && (
                  <div className="rounded bg-primary-600 py-1 px-3">Admin</div>
                )}
              </section>
            </Link>
          );
        })}
      </article>
    </main>
  );
}
