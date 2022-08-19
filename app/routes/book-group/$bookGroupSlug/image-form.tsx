import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";
import { useState } from "react";

import invariant from "tiny-invariant";
import { Button, Input, PageContainer } from "~/components";
import { createImage } from "~/models/image.server";

import { requireAdminUser } from "~/session.server";

import { getBase64 } from "~/utils";

export async function action({ request, params }: ActionArgs) {
  await requireAdminUser(request, params);
  const formData = await request.formData();
  const encoded = formData.get("imageToBase64");

  invariant(params.bookGroupSlug, "Book group name must be defined.");

  if (typeof encoded !== "string" || encoded.length === 0) {
    return json({ errors: { image: "Image is invalid" } }, { status: 400 });
  }

  await createImage({
    encoded,
    bookGroupId: params.bookGroupSlug,
  });

  return redirect(`/book-group/${params.bookGroupSlug}/image-list`);
}

const inputClassName = "";

export default function ImageForm() {
  const actionData = useActionData<typeof action>();

  const transition = useTransition();
  const isAdding = transition?.submission?.formData.get("intent") === "add";

  const [image, setImage] = useState("");

  return (
    <PageContainer className="gap-4">
      <h1>{"Add image form"}</h1>
      <Form method="post" className="flex flex-col items-center gap-4">
        <div className="flex w-full flex-col gap-4">
          <input hidden name="imageToBase64" value={image} />
          <Input
            className={inputClassName}
            label={<label htmlFor="image">User image:</label>}
            input={
              <input
                id="image"
                autoFocus={true}
                type="file"
                autoComplete="image"
                aria-describedby="image-error"
                aria-label="image"
                accept="image"
                onChange={(e) => {
                  const file = e.target?.files?.[0];
                  if (file) {
                    getBase64(file).then((data) => {
                      if (typeof data !== "string") return;
                      setImage(data);
                    });
                  }
                }}
              />
            }
            error={actionData?.errors?.image}
          />
        </div>
        <Button
          type="submit"
          className="w-full md:w-64"
          name="intent"
          value={"add"}
          disabled={isAdding}
          data-test="button:submitImage"
        >
          {isAdding ? "Adding..." : "Add"}
        </Button>
      </Form>
    </PageContainer>
  );
}
