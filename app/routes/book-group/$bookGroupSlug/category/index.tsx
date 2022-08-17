import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import invariant from "tiny-invariant";
import { PageContainer } from "~/components";
import { getCategories } from "~/models/bookCategory.server";
import { requireUser } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
  await requireUser(request);
  invariant(params.bookGroupSlug, "Book group id is required");
  const bookCategories = await getCategories(params.bookGroupSlug);

  return json({
    bookCategories: bookCategories.map(({ slug, name }) => ({ slug, name })),
  });
}

export default function Categories() {
  const { bookCategories } = useLoaderData<typeof loader>();
  return (
    <PageContainer className="gap-4">
      <h1>List of categories</h1>
      <section className="flex flex-col gap-3">
        {bookCategories.map(({ slug, name }) => (
          <Link
            key={slug}
            to={slug}
            prefetch="intent"
            className="cursor-pointer rounded bg-primary-400 p-3"
          >
            <p className="text-lg font-medium">{name}</p>
          </Link>
        ))}
      </section>
    </PageContainer>
  );
}
