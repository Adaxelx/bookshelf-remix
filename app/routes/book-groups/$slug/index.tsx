import type { ActionArgs, LoaderArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Form, useActionData, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import {
  Button,
  Card,
  ErrorFallback,
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
    bookGroup: { name: bookGroup.name },
    bookCategories: bookCategories.map(({ slug }) => slug),
    activeBookCategory: bookCategories.find(({ isActive }) => isActive),
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
  const { bookGroup, bookCategories, activeBookCategory } =
    useLoaderData<typeof loader>();
  const randomCategory = useActionData<typeof action>();

  return (
    <PageContainer className="flex flex-col">
      <div className="shrink grow basis-0">
        <h1>{bookGroup.name}</h1>
        <section className="mb-3 flex flex-col md:flex-row">
          <Button to="category-history" variant="secondary">
            Losowanie kategorii
          </Button>
          <Button to="category-history" variant="secondary">
            Historia kategorii
          </Button>
          <Button to="new-category" variant="secondary">
            Nowa kategoria
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
  return <ErrorFallback>{caught.data}</ErrorFallback>;
}
