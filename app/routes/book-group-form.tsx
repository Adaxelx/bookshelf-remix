import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useActionData,
  useCatch,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { Button, ErrorFallback, Input, PageContainer } from "~/components";
import {
  createBookGroup,
  editBookGroup,
  getBookGroup,
} from "~/models/bookGroup.server";
import { requireUserId } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");

  if (!slug) return json({ bookGroup: null });

  const bookGroup = await getBookGroup({ userId, bookGroupId: slug });

  invariant(bookGroup, `Can not find book group with slug ${slug}`);

  return json({ bookGroup: { name: bookGroup.name, slug: bookGroup.slug } });
}

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const name = formData.get("name");
  const slug = formData.get("slug");
  const intent = formData.get("intent");

  if (typeof name !== "string" || name.length === 0) {
    return json(
      {
        errors: {
          name: "Name is required",
          slug: null,
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
        },
      },
      { status: 400 }
    );
  }

  const bookGroup =
    intent === "add"
      ? await createBookGroup({ name, slug, creatorId: userId })
      : await editBookGroup({ name, slug });

  return redirect(`/book-group/${bookGroup.slug}`);
}

const inputClassName = "";

export default function BookGroupForm() {
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const isEditForm = Boolean(loaderData.bookGroup);

  const transition = useTransition();
  const isUpdating = transition.submission?.formData.get("intent") === "update";
  const isAdding = transition.submission?.formData.get("intent") === "add";
  return (
    <PageContainer className="gap-4">
      <h1>{`${isEditForm ? "Edit" : "Add new"} book group`}</h1>
      <Form method="post" className="flex flex-col items-center gap-4">
        <div className="flex w-full flex-col gap-4 md:grid md:grid-cols-2 md:gap-4">
          <Input
            className={inputClassName}
            label={<label htmlFor="name">Group name</label>}
            input={
              <input
                // ref={emailRef}
                defaultValue={loaderData?.bookGroup?.name}
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
                defaultValue={loaderData?.bookGroup?.slug}
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
        <Button
          type="submit"
          name="intent"
          value={isEditForm ? "update" : "add"}
          className="w-full md:w-64"
          disabled={isUpdating || isAdding}
        >
          {isEditForm ? (isUpdating ? "Updating..." : "Update") : null}
          {isEditForm ? null : isAdding ? "Creating..." : "Create"}
        </Button>
      </Form>
    </PageContainer>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  return <ErrorFallback>{caught.data}</ErrorFallback>;
}
