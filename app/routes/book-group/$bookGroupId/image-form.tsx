import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { conform, useForm } from "@conform-to/react";
import type { DataFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useFetcher, useTransition } from "@remix-run/react";
import { parseMultipartFormData } from "@remix-run/server-runtime/dist/formData";
import { createMemoryUploadHandler } from "@remix-run/server-runtime/dist/upload/memoryUploadHandler";

import { z } from "zod";
import { Button, Input, PageContainer } from "~/components";
import { prisma } from "~/db.server";

import { requireAdminUser } from "~/session.server";
import { useState } from "react";
import { getCategoryImgSrc } from "~/utils/image";

const MAX_UPLOAD_SIZE = 1024 * 1024 * 3; // 3MB

const ImageFieldsetSchema = z.object({
  file: z.instanceof(File).refine((file) => {
    return !file || file.size <= MAX_UPLOAD_SIZE;
  }, "File size must be less than 3MB"),
  altText: z.string(),
});

export async function action({ request, params }: DataFunctionArgs) {
  await requireAdminUser(request, params);

  const formData = await parseMultipartFormData(
    request,
    createMemoryUploadHandler({ maxPartSize: MAX_UPLOAD_SIZE })
  );

  const submission = await parse(formData, {
    schema: ImageFieldsetSchema.transform(async ({ file, ...data }) => {
      return {
        ...data,
        blob: await Buffer.from(await file.arrayBuffer()),
        contentType: file.type,
      };
    }),
    async: true,
  });

  if (submission.intent !== "submit") {
    return json({ status: "idle", submission } as const);
  }

  if (!submission.value) {
    return json({ status: "error", submission } as const, { status: 400 });
  }

  await prisma.image.create({
    select: { id: true },
    data: submission.value,
  });

  return redirect(`/book-group/${params.bookGroupId}/image-list`);
}

const inputClassName = "";

export default function ImageForm() {
  const transition = useTransition();
  const isAdding = transition?.submission?.formData.get("intent") === "add";

  const imageFetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    id: "image-form",
    constraint: getFieldsetConstraint(ImageFieldsetSchema),
    lastSubmission: imageFetcher.data?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: ImageFieldsetSchema });
    },
    defaultValue: {
      altText: "",
      file: null,
    },
  });

  const [image, setImage] = useState<string | null>(
    fields.file.defaultValue ? getCategoryImgSrc(fields.file.id) : null
  );
  const [altText, setAltText] = useState(fields.altText.defaultValue ?? "");

  return (
    <PageContainer className="items-center justify-center gap-4">
      <h1>{"Add image"}</h1>
      <Form
        method="post"
        className="flex flex-col items-center gap-4"
        {...form.props}
        encType="multipart/form-data"
      >
        <Input
          className={"w-full"}
          label={<label>Alt text:</label>}
          input={
            <input
              onChange={(e) => setAltText(e.currentTarget.value)}
              {...conform.input(fields.altText)}
            />
          }
          errors={fields.altText.errors}
        />
        <div className="flex w-full items-center gap-4">
          {image ? (
            <div className="relative">
              <img
                src={image}
                alt={altText ?? ""}
                className="h-32 w-32 rounded-lg object-cover"
              />
            </div>
          ) : (
            <div className="border-muted-foreground text-muted-foreground grid  h-32 w-32 place-content-center rounded-lg border p-3 text-2xl">
              Preview
            </div>
          )}
          <Input
            className={inputClassName}
            label={<label htmlFor="image">Category image:</label>}
            input={
              <input
                aria-label="Image"
                className="absolute left-0 top-0 z-0 h-32 w-32 cursor-pointer opacity-0"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setImage(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setImage(null);
                  }
                }}
                {...conform.input(fields.file, { type: "file" })}
              />
            }
            errors={fields.file.errors}
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
