import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData, useTransition } from "@remix-run/react";
import { useEffect, useState } from "react";

import invariant from "tiny-invariant";
import {
  Button,
  Card,
  DeleteModal,
  PageContainer,
  deleteModalLinks,
} from "~/components";
import { getCategories } from "~/models/bookCategory.server";

import { deleteImage, getImages } from "~/models/image.server";
import { requireAdminUser } from "~/session.server";
import { getCategoryImgSrc } from "~/utils/image";

export const links = () => [...deleteModalLinks()];

export async function loader({ request, params }: LoaderArgs) {
  await requireAdminUser(request, params);
  invariant(params.bookGroupId, "Book group id is required");
  const images = await getImages(params.bookGroupId);

  const categories = await getCategories(params.bookGroupId);
  return json({
    images,
    categories: categories.map(({ name, imageId }) => ({ name, imageId })),
  });
}

export async function action({ request, params }: ActionArgs) {
  await requireAdminUser(request, params);
  const formData = await request.formData();
  const imageId = formData.get("imageId");

  invariant(params.bookGroupId, "Book group name must be defined.");

  if (typeof imageId !== "string") {
    throw new Response(`Failed to find imageId.`, {
      status: 404,
    });
  }

  await deleteImage(imageId);

  return json({ imageId });
}

export default function Images() {
  const { images, categories } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const transition = useTransition();
  const isDeleting =
    transition?.submission?.formData.get("intent") === "delete";

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState("");

  useEffect(() => {
    if (actionData) {
      setIsDeleteModalOpen("");
    }
  }, [actionData]);

  const filteredCategories = categories
    .filter((category) => category.imageId === isDeleteModalOpen)
    .map(({ name }) => name);

  return (
    <PageContainer className="gap-4">
      <h1>List of images</h1>
      <section className="grid grid-cols-3 gap-3">
        {images.map(({ id, altText }) => (
          <div key={id} className="relative">
            <Button
              disabled={isDeleting}
              colorVariant="error"
              className="absolute right-0 z-[1]"
              onClick={() => setIsDeleteModalOpen(id)}
            >
              Delete
            </Button>
            <Card src={getCategoryImgSrc(id)} alt={altText} />
          </div>
        ))}
      </section>
      <DeleteModal
        isOpen={Boolean(isDeleteModalOpen)}
        onClose={() => setIsDeleteModalOpen("")}
        title={`Are you sure you want delete this image?`}
        content={
          filteredCategories.length
            ? `This image will be deleted with connected categories(${filteredCategories.join(
                ", "
              )}), which contains books, opinions. Are you sure to do this?`
            : `This action is not reversible.`
        }
        actions={
          <>
            <input hidden name="imageId" value={isDeleteModalOpen} />
            <Button onClick={() => setIsDeleteModalOpen("")}>Keep it</Button>
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
