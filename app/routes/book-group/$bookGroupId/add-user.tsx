import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";

import invariant from "tiny-invariant";
import { Button, Input, PageContainer } from "~/components";
import { addUserToBookGroup } from "~/models/bookGroupsToUsers.server";

import { requireAdminUser } from "~/session.server";

import { validateEmail } from "~/utils";

export async function action({ request, params }: ActionArgs) {
  await requireAdminUser(request, params);
  const formData = await request.formData();
  const email = formData.get("email");

  invariant(params.bookGroupId, "Book group name must be defined.");

  if (!validateEmail(email)) {
    return json({ errors: { email: "Email is invalid" } }, { status: 400 });
  }

  const connection = await addUserToBookGroup({
    email,
    id: params.bookGroupId,
  });

  if (typeof connection === "string") {
    return json(
      {
        errors: {
          email: connection,
        },
      },
      { status: 400 }
    );
  }
  return redirect(`/book-group/${params.bookGroupId}/user-list`);
}

const inputClassName = "";

export default function UserForm() {
  const actionData = useActionData<typeof action>();

  const transition = useTransition();
  const isAdding = transition?.submission?.formData.get("intent") === "add";

  return (
    <PageContainer className="gap-4">
      <h1>{"Add user form"}</h1>
      <Form method="post" className="flex flex-col items-center gap-4">
        <div className="flex w-full flex-col gap-4">
          <Input
            className={inputClassName}
            label={<label htmlFor="name">User email:</label>}
            input={
              <input
                id="email"
                autoFocus={true}
                name="email"
                type="email"
                autoComplete="email"
                aria-describedby="email-error"
              />
            }
            error={actionData?.errors?.email}
          />
        </div>
        <Button
          type="submit"
          className="w-full md:w-64"
          name="intent"
          value={"add"}
          disabled={isAdding}
          data-test="button:submitUser"
        >
          {isAdding ? "Adding..." : "Add"}
        </Button>
      </Form>
    </PageContainer>
  );
}
