import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Button, Card, ErrorFallback, PageContainer } from "~/components";
import { getBook } from "~/models/book.server";
import { getCategory } from "~/models/bookCategory.server";
import { getImage } from "~/models/image.server";
import { requireUser } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
  await requireUser(request);
  invariant(params.categoryName, "CategoryName is required");
  const bookCategory = await getCategory(params.categoryName);
  if (!bookCategory) {
    throw new Response(
      `Category with slug "${params.categoryName}" doesn't exist!`,
      {
        status: 404,
      }
    );
  }
  const image = await getImage(bookCategory.imageId);
  invariant(
    image,
    `Image not found for category ${bookCategory.name}. Something went wrong.`
  );
  const book = await getBook(bookCategory.slug);

  return json({
    bookCategory,
    image: image.encoded,
    book,
  });
}

export default function CategoryPage() {
  const { bookCategory, image, book } = useLoaderData<typeof loader>();
  const { name } = bookCategory;

  return (
    <PageContainer className="gap-4">
      <header className="flex flex-col gap-2">
        <h1>{name}</h1>
        <section className="flex gap-2">
          {bookCategory.isActive ? (
            <div className="rounded bg-primary-600 px-3 py-1">Aktywna</div>
          ) : null}
          {bookCategory.wasPicked ? (
            <div className="rounded bg-primary-600 px-3 py-1">Wylosowana</div>
          ) : null}
        </section>
      </header>
      <main className="flex flex-col gap-4 md:flex-row">
        <div className="max-w-sm">
          <Card src={image} alt={`Card for category ${bookCategory.name}`} />
        </div>
        <section className="flex grow flex-col gap-2">
          <h2>Wybrana książka:</h2>
          {book ? (
            "Jest książka"
          ) : (
            <Button variant="secondary" to="book/new">
              Dodaj książkę
            </Button>
          )}
        </section>
      </main>
    </PageContainer>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  return <ErrorFallback>{caught.data}</ErrorFallback>;
}
