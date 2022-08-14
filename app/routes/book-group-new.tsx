import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

import { Button, Input, PageContainer } from "~/components";
import { createBookGroup } from "~/models/bookGroup.server";
import { requireUserId } from "~/session.server";

export async function action({ request, params }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const name = formData.get("name");
  const slug = formData.get("slug");

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

  const bookGroup = await createBookGroup({ name, slug, creatorId: userId });

  console.log(bookGroup);

  return redirect(`/book-group/${bookGroup.slug}`);
}

const inputClassName = "";

export default function BookGroupForm() {
  const actionData = useActionData<typeof action>();

  return (
    <PageContainer className="gap-4">
      <h1>{`Add new book group`}</h1>
      <Form method="post" className="flex flex-col items-center gap-4">
        <div className="flex w-full flex-col gap-4 md:grid md:grid-cols-2 md:gap-4">
          <Input
            className={inputClassName}
            label={<label htmlFor="name">Group name</label>}
            input={
              <input
                // ref={emailRef}

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
        <Button type="submit" className="w-full md:w-64">
          Add
        </Button>
      </Form>
    </PageContainer>
  );
}
