import type { LoaderArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Button, PageContainer } from "~/components";
import { getUserBookGroups } from "~/models/bookGroup.server";
import { requireUser } from "~/session.server";
import { useOptionalUser } from "~/utils";

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);
  const bookGroups = await getUserBookGroups(user.id);
  return json({
    bookGroups: bookGroups.map(({ creatorId, slug, name }) => ({
      creatorId,
      slug,
      name,
    })),
  });
}

export default function BookGroups() {
  const { bookGroups } = useLoaderData<typeof loader>();
  const user = useOptionalUser();
  return (
    <PageContainer>
      <h1>Book groups</h1>
      <Button
        className="mb-3"
        variant="secondary"
        to="/book-group-form"
        prefetch="intent"
      >
        Add new group
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
    </PageContainer>
  );
}
