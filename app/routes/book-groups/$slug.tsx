import type { ActionArgs, LoaderArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Button, Card, FlipCard, flipCardLinks } from "~/components";
import { getCategories, getCategory } from "~/models/bookCategory.server";
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
    throw new Response("not found", { status: 404 });
  }

  const bookCategories = await getCategories(params.slug);
  return json({
    bookGroup,
    bookCategories: bookCategories.map((data) => ({
      ...data,
    })),
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
  return json({ name: category.name, imageSrc: image?.encoded });
}

export default function BookGroup() {
  const { bookGroup, bookCategories } = useLoaderData<typeof loader>();
  const randomCategory = useActionData<typeof action>();
  const activeBookCategory = bookCategories.find(({ isActive }) => isActive);
  return (
    <main className="p-3">
      <h1>{bookGroup.name}</h1>
      <Form method="post">
        <Button
          type="submit"
          name="randomCategory"
          disabled={Boolean(activeBookCategory)}
          value={
            bookCategories[Math.floor(Math.random() * bookCategories.length)]
              .slug
          }
        >
          Wylosuj kategorię
        </Button>
      </Form>
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
    </main>
  );
}
