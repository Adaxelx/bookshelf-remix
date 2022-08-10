import type { ActionArgs, LoaderArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Form, useActionData, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import {
  Button,
  Card,
  FlipCard,
  flipCardLinks,
  PageContainer,
} from "~/components";
import {
  getCategories,
  getCategory,
  setActiveCategory,
} from "~/models/bookCategory.server";
import { getBookGroup } from "~/models/bookGroup.server";
import { getImage } from "~/models/image.server";
import { requireUser } from "~/session.server";
import backImage from "public/assets/Back.jpg";

export const links = () => [
  ...flipCardLinks(),
  { rel: "image", href: backImage },
];

export async function loader({ request, params }: LoaderArgs) {
  const user = await requireUser(request);
  invariant(params.slug, "Slug is required");
  const bookGroup = await getBookGroup({
    userId: user.id,
    bookGroupId: params.slug,
  });

  if (!bookGroup) {
    throw new Response(`Post with slug "${params.slug}" doesn't exist!`, {
      status: 404,
    });
  }

  const bookCategories = await getCategories(params.slug);
  return json({
    bookGroup,
    bookCategories,
  });
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const slug = formData.get("randomCategory");

  invariant(typeof slug === "string", "Missing random category");
  const category = await getCategory(slug);
  invariant(category, "Category not found. Something went wrong.");
  const image = await getImage(category.imageId);
  invariant(
    image,
    `Image not found for category ${category.name}. Something went wrong.`
  );
  await setActiveCategory(category.slug);
  return json({ name: category.name, imageSrc: image?.encoded });
}

export default function BookGroup() {
  const { bookGroup, bookCategories } = useLoaderData<typeof loader>();
  const randomCategory = useActionData<typeof action>();
  const activeBookCategory = bookCategories.find(({ isActive }) => isActive);

  return (
    <PageContainer className="flex flex-col">
      <div className="shrink grow basis-0">
        <h1>{bookGroup.name}</h1>
        <section className="mb-3 flex flex-col md:flex-row">
          <Button to="new-category" variant="secondary">
            Nowa kategoria
          </Button>
          <Button to="category-history" variant="secondary">
            Historia kategorii
          </Button>
          {activeBookCategory ? (
            <Button to={`${activeBookCategory.slug}`} variant="secondary">
              Pokaż aktywną kategorię
            </Button>
          ) : null}
        </section>
      </div>
      <Form
        method="post"
        className="flex shrink grow basis-0 items-center justify-center"
      >
        <Button
          size="big"
          type="submit"
          name="randomCategory"
          className="w-full md:w-auto"
          disabled={Boolean(activeBookCategory)}
          value={
            bookCategories[Math.floor(Math.random() * bookCategories.length)]
              .slug
          }
        >
          Wylosuj kategorię
        </Button>
      </Form>
      <div className="shrink grow basis-0" />
      {randomCategory ? (
        <FlipCard
          key={randomCategory.imageSrc}
          categoryName={randomCategory.name}
          front={
            <Card
              src={randomCategory?.imageSrc}
              alt={`Front image for category ${randomCategory?.name}`}
            />
          }
          back={<Card src={backImage} alt="Back of card" isBase={false} />}
        />
      ) : null}
    </PageContainer>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <div
      className="flex items-center justify-between gap-4 rounded border border-red-900/10 bg-red-50 p-4 text-red-700"
      role="alert"
    >
      <div className="flex items-center gap-4">
        <span className="rounded-full bg-red-600 p-2 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01"
            />
          </svg>
        </span>

        <p>
          <strong className="text-xl font-medium">{caught.status}</strong>

          <span className="block opacity-90">{caught.data}</span>
        </p>
      </div>
    </div>
  );
}
