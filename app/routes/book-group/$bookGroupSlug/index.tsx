import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Form, useActionData, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import {
  Button,
  Card,
  DeleteModal,
  ErrorFallback,
  FlipCard,
  flipCardLinks,
  PageContainer,
  deleteModalLinks,
} from "~/components";
import {
  getCategories,
  getCategory,
  setActiveCategory,
} from "~/models/bookCategory.server";
import {
  deleteBookGroup,
  getBookByCategoryIdGroup,
} from "~/models/bookGroup.server";
import { getImage } from "~/models/image.server";
import { requireAdminUser, requireUser } from "~/session.server";
import backImage from "public/assets/Back.jpg";
import { useState } from "react";
import { useIsAdminUser } from "~/utils";

export const links = () => [
  ...flipCardLinks(),
  ...deleteModalLinks(),
  { rel: "image", href: backImage },
];

export async function loader({ request, params }: LoaderArgs) {
  const user = await requireUser(request);
  invariant(params.bookGroupSlug, "Slug is required");
  const bookGroup = await getBookByCategoryIdGroup({
    userId: user.id,
    bookGroupId: params.bookGroupSlug,
  });

  if (!bookGroup) {
    throw new Response(
      `Book group with slug "${params.bookGroupSlug}" doesn't exist!`,
      {
        status: 404,
      }
    );
  }

  const bookCategories = await getCategories(params.bookGroupSlug);
  return json({
    bookGroup: { name: bookGroup.name, slug: bookGroup.slug },
    bookCategories: bookCategories.map(({ slug }) => slug),
    activeBookCategory: bookCategories.find(({ isActive }) => isActive),
  });
}

export async function action({ request, params }: ActionArgs) {
  await requireAdminUser(request, params);
  const formData = await request.formData();
  const slug = formData.get("randomCategory");
  const intent = formData.get("intent");

  invariant(params.bookGroupSlug, "Book group is required");

  if (intent === "delete") {
    await deleteBookGroup(params.bookGroupSlug);
    return redirect(`/book-group`);
  }

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
  const isAdminUser = useIsAdminUser(bookGroup.slug);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  return (
    <PageContainer>
      <div className="flex shrink grow basis-0 flex-col gap-4">
        <h1>{bookGroup.name}</h1>
        <section className="p mb-3 flex flex-col gap-2 md:grid md:grid-cols-4">
          <Button to="category" variant="secondary" prefetch="intent">
            Lista kategorii
          </Button>
          <Button
            to="user-list"
            variant="secondary"
            prefetch="intent"
            data-test="button:userList"
          >
            Lista użytkowników
          </Button>
          {isAdminUser ? (
            <>
              <Button
                to="category-form"
                variant="secondary"
                prefetch="intent"
                data-test="button:newCategory"
              >
                Nowa kategoria
              </Button>
              <Button
                to="add-user"
                variant="secondary"
                prefetch="intent"
                data-test="button:addUser"
              >
                Dodaj użytkownika
              </Button>
              <Button
                to={`/book-group-form?slug=${bookGroup.slug}`}
                prefetch="intent"
                variant="secondary"
                data-test="button:editGroup"
              >
                Edytuj grupę
              </Button>
              <Button
                to="image-form"
                variant="secondary"
                prefetch="intent"
                data-test="button:imageForm"
              >
                Dodaj obrazek
              </Button>
              <Button
                to="image-list"
                variant="secondary"
                prefetch="intent"
                data-test="button:imageList"
              >
                Image list
              </Button>
              <Button
                variant="secondary"
                colorVariant="error"
                data-test="button:removeBookGroup"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                Remove group book
              </Button>
            </>
          ) : null}
          {activeBookCategory ? (
            <Button
              to={`category/${activeBookCategory.slug}`}
              variant="secondary"
              prefetch="intent"
            >
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
          disabled={Boolean(activeBookCategory) || !isAdminUser}
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
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={"Are you sure you want delete?"}
        content={
          "This action is not reversible and after that you will lose whole history of books, all categories, opinions and custom images added for this group."
        }
        actions={
          <>
            <Button onClick={() => setIsDeleteModalOpen(false)}>Keep it</Button>
            <Button
              colorVariant="error"
              variant="secondary"
              type="submit"
              name="intent"
              value="delete"
              data-test="button:deleteConfirmation"
            >
              Delete
            </Button>
          </>
        }
      />
    </PageContainer>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  return <ErrorFallback>{caught.data}</ErrorFallback>;
}
