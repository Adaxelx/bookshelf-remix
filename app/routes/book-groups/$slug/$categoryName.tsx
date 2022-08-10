import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { ErrorFallback, PageContainer } from "~/components";
import { getCategory } from "~/models/bookCategory.server";
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

  return json({
    bookCategory,
  });
}

export default function CategoryPage() {
  const { bookCategory } = useLoaderData<typeof loader>();
  const { name } = bookCategory;

  return (
    <PageContainer>
      <h1>{name}</h1>
    </PageContainer>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  return <ErrorFallback>{caught.data}</ErrorFallback>;
}
