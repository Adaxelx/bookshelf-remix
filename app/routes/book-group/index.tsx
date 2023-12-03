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
    bookGroups: bookGroups.map(({ creatorId, id, name }) => ({
      creatorId,
      id,
      name,
    })),
  });
}

export default function BookGroups() {
  const { bookGroups } = useLoaderData<typeof loader>();
  const user = useOptionalUser();
  return (
    <PageContainer className="gap-3">
      <h1>Book groups</h1>
      <Button
        className="mb-3"
        variant="secondary"
        to="/book-group-form"
        prefetch="intent"
      >
        Add new group
      </Button>
      <section className="flex h-full flex-col gap-4 overflow-auto">
        {bookGroups.map((bookGroup) => {
          const isAdmin = user?.id === bookGroup.creatorId;
          return (
            <Link to={bookGroup.id} key={bookGroup.id} className="min-h-[50%]">
              <article
                className={`flex h-full flex-col items-center justify-center gap-2 rounded bg-primary-300 p-3`}
              >
                <section>
                  <p className=" text-3xl font-medium">{bookGroup.name}</p>
                </section>
                <section>
                  {isAdmin && (
                    <div className="rounded bg-primary-600 py-1 px-3">
                      Admin
                    </div>
                  )}
                </section>
              </article>
            </Link>
          );
        })}
      </section>
    </PageContainer>
  );
}
