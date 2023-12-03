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
  getBookByCategoryIdGroup,
} from "~/models/bookGroup.server";
import { requireAdminUser, requireUser, requireUserId } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) return json({ bookGroup: null, previd: "" });

  const bookGroup = await getBookByCategoryIdGroup({
    userId,
    bookGroupId: id,
  });

  invariant(bookGroup, `Can not find book group with id ${id}`);

  return json({
    bookGroup: { name: bookGroup.name, id: bookGroup.id },
    previd: id,
  });
}

const isPrevidDefined = (
  previd: FormDataEntryValue | null,
  intent: FormDataEntryValue | null
): previd is string => {
  return (
    (typeof previd === "string" && previd.length !== 0) || intent === "add"
  );
};

export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const isAddForm = intent === "add";

  const previd = formData.get("previd");
  if (!isPrevidDefined(previd, intent)) {
    throw new Response(`Previous id is missing!`, {
      status: 404,
    });
  }

  const user = isAddForm
    ? await requireUser(request)
    : await requireAdminUser(request, params, previd);

  const name = formData.get("name");
  const id = formData.get("id");

  if (typeof name !== "string" || name.length === 0) {
    return json(
      {
        errors: {
          name: "Name is required",
          id: null,
        },
      },
      { status: 400 }
    );
  }

  if (typeof id !== "string" || id.length === 0) {
    return json(
      {
        errors: {
          name: null,
          id: "id is required",
        },
      },
      { status: 400 }
    );
  }

  const bookGroup =
    intent === "update"
      ? await editBookGroup({ name, id, previd })
      : await createBookGroup({ name, id, creatorId: user.id });

  return redirect(`/book-group/${bookGroup.id}`);
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
          <input hidden={true} name="previd" value={loaderData.previd} />
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
            label={<label htmlFor="id">id</label>}
            input={
              <input
                // ref={emailRef}
                defaultValue={loaderData?.bookGroup?.id}
                id="id"
                autoFocus={true}
                name="id"
                type="text"
                autoComplete="id"
                aria-describedby="id-error"
              />
            }
            error={actionData?.errors?.id}
          />
        </div>
        <Button
          type="submit"
          name="intent"
          value={isEditForm ? "update" : "add"}
          className="w-full md:w-64"
          disabled={isUpdating || isAdding}
          data-test="button:submitBookForm"
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
