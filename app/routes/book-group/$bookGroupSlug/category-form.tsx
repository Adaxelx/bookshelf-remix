import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useParams,
  useTransition,
} from "@remix-run/react";
import { useState } from "react";
import invariant from "tiny-invariant";
import { Button, Card, Input, PageContainer } from "~/components";
import {
  createCategory,
  getCategory,
  updateCategory,
} from "~/models/bookCategory.server";
import { getImages } from "~/models/image.server";
import { requireAdminUser } from "~/session.server";

import { BsCheckLg } from "react-icons/bs";
import type { BookCategory } from "@prisma/client";

export async function loader({ request, params }: LoaderArgs) {
  await requireAdminUser(request, params);
  invariant(params.bookGroupSlug, "Slug is required");
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");

  let category: Pick<BookCategory, "name" | "slug" | "imageId"> | null = null;

  if (slug) {
    const categoryData = await getCategory(slug);
    invariant(categoryData, "No category for this slug");
    category = {
      name: categoryData.name,
      slug: categoryData.slug,
      imageId: categoryData.imageId,
    };
  }

  const images = await getImages(params.bookGroupSlug);
  return json({ images, category });
}

export async function action({ request, params }: ActionArgs) {
  await requireAdminUser(request, params);
  const formData = await request.formData();
  const name = formData.get("name");
  const slug = formData.get("slug");
  const imageId = formData.get("imageId");
  const intent = formData.get("intent");
  const prevSlug = formData.get("prevSlug");

  invariant(params.bookGroupSlug, "Book group name must be defined.");

  if (typeof name !== "string" || name.length === 0) {
    return json(
      {
        errors: {
          name: "Name is required",
          slug: null,
          imageId: null,
        },
      },
      { status: 400 }
    );
  }

  if (typeof slug !== "string" || slug.length === 0) {
    return json(
      {
        errors: {
          name: null,
          slug: "Slug is required",
          imageId: null,
        },
      },
      { status: 400 }
    );
  }

  if (typeof imageId !== "string" || imageId.length === 0) {
    return json(
      {
        errors: {
          name: null,
          slug: null,
          imageId: "Image is required",
        },
      },
      { status: 400 }
    );
  }

  const data = {
    name,
    slug,
    imageId,
  };

  let category: BookCategory | null = null;

  if (intent === "add") {
    category = await createCategory({
      ...data,
      bookGroupId: params.bookGroupSlug,
    });
  } else if (intent === "update") {
    if (typeof prevSlug !== "string" || prevSlug.length === 0) {
      throw new Error("Missing prevSlug");
    }
    category = await updateCategory({ ...data, prevSlug });
  }

  invariant(category, "Unknown intent ");

  return redirect(
    `/book-group/${params.bookGroupSlug}/category/${category.slug}`
  );
}

const inputClassName = "";

export default function CategoryForm() {
  const { images, category } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { bookGroupSlug } = useParams();
  const [pickedImageId, setPickedImageId] = useState(category?.imageId);

  const isEdit = Boolean(category);

  const transition = useTransition();
  const isUpdating =
    transition?.submission?.formData.get("intent") === "update";
  const isAdding = transition?.submission?.formData.get("intent") === "add";

  return (
    <PageContainer className="gap-4">
      <h1>
        {isEdit
          ? `Editting category ${category?.name}`
          : `New category for book group ${bookGroupSlug}`}
      </h1>
      <Form method="post" className="flex flex-col items-center gap-4">
        <div className="flex w-full flex-col gap-4 md:grid md:grid-cols-2 md:gap-4">
          <input hidden name="prevSlug" value={category?.slug} />
          <Input
            className={inputClassName}
            label={<label htmlFor="name">Name of category</label>}
            input={
              <input
                // ref={emailRef}
                defaultValue={category?.name}
                id="name"
                autoFocus={true}
                name="name"
                type="text"
                autoComplete="name"
                aria-describedby="name-error"
              />
            }
            error={actionData?.errors?.name}
          />
          <Input
            className={inputClassName}
            label={<label htmlFor="slug">Slug</label>}
            input={
              <input
                // ref={emailRef}
                defaultValue={category?.slug}
                id="slug"
                autoFocus={true}
                name="slug"
                type="text"
                autoComplete="slug"
                aria-describedby="slug-error"
              />
            }
            error={actionData?.errors?.slug}
          />
        </div>
        <div className="w-full">
          <label
            htmlFor="imageId"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Image
          </label>
          <input
            hidden
            value={pickedImageId}
            name="imageId"
            id="imageId"
            autoComplete="imageId"
          />
          <div className="flex max-w-full snap-x snap-mandatory snap-center gap-2 overflow-x-scroll">
            {images.map(({ id, encoded }, index) => {
              const isActive = id === pickedImageId;
              return (
                <div
                  key={id}
                  className="relative"
                  onClick={() => setPickedImageId(id)}
                  data-test={`image${index}`}
                >
                  <Card
                    className={`h-96 w-64 flex-shrink-0 border-4 transition-colors ${
                      isActive ? "border-green-700" : "border-black"
                    }`}
                    src={encoded}
                    alt="Card"
                  />
                  <div
                    aria-label="selected"
                    className={`absolute top-1/2 left-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-content-center rounded-full bg-green-700 transition-opacity ${
                      isActive ? "opacity-1" : "opacity-0"
                    }`}
                  >
                    <BsCheckLg className="text-green-400" />
                  </div>
                  <div
                    className={`absolute top-0 h-full w-full bg-green-400 transition-opacity ${
                      isActive ? "opacity-25" : "opacity-0"
                    }`}
                  />
                </div>
              );
            })}
          </div>
          {actionData?.errors?.imageId ? (
            <div className="pt-1 text-red-700" id="email-error">
              {actionData?.errors?.imageId}
            </div>
          ) : null}
        </div>
        <Button
          type="submit"
          className="w-full md:w-64"
          name="intent"
          value={isEdit ? "update" : "add"}
          disabled={isUpdating || isAdding}
        >
          {isEdit ? (isUpdating ? "Updating..." : "Update") : null}
          {isEdit ? null : isAdding ? "Creating..." : "Create"}
        </Button>
      </Form>
    </PageContainer>
  );
}
