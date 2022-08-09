import type { ActionArgs, LoaderArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Button } from "~/components";
import { getCategories } from "~/models/bookCategory.server";
import { getBookGroup } from "~/models/bookGroup.server";
import { getImage } from "~/models/image.server";
import { requireUser } from "~/session.server";

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
  const image = await getImage(bookCategories[0].imageId);
  return json({
    bookGroup,
    bookCategories: bookCategories.map((data) => ({
      ...data,
      //   image: image?.encoded,
    })),
  });
}

export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData();
  const slug = formData.get("randomCategory");
  return json(slug);
}

export default function BookGroup() {
  const { bookGroup, bookCategories } = useLoaderData<typeof loader>();
  const randomCategory = useActionData<typeof action>();
  const activeBookCategory = bookCategories.find(({ isActive }) => isActive);
  console.log(randomCategory);
  //   console.log(bookCategories);
  return (
    <main>
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
    </main>
  );
}
