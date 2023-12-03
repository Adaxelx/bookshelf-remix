import type { Book } from "@prisma/client";
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
import invariant from "tiny-invariant";
import { Button, Input, PageContainer } from "~/components";
import { createBook, getBookById, updateBook } from "~/models/book.server";
import { requireAdminUser } from "~/session.server";
import { formatDateToInput } from "~/utils";

export async function loader({ request, params }: LoaderArgs) {
  await requireAdminUser(request, params);
  invariant(params.bookGroupId, "Id is required");
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  let book: Pick<Book, "title" | "author" | "dateStart" | "dateEnd"> | null =
    null;

  if (id) {
    const bookRes = await getBookById(id);
    invariant(bookRes, "No book for this id");
    const { title, author, dateStart, dateEnd } = bookRes;
    book = {
      title,
      author,
      dateEnd,
      dateStart,
    };
  }

  return json({ book });
}

export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData();
  const title = formData.get("title");
  const author = formData.get("author");
  const dateStart = formData.get("dateStart");
  const dateEnd = formData.get("dateEnd");
  const intent = formData.get("intent");
  invariant(params.categoryId, "Category name must be defined.");

  if (typeof title !== "string" || title.length === 0) {
    return json(
      {
        errors: {
          title: "Title is required",
          author: null,
          dateStart: null,
          dateEnd: null,
        },
      },
      { status: 400 }
    );
  }

  if (typeof author !== "string" || author.length === 0) {
    return json(
      {
        errors: {
          title: null,
          author: "Author is required",
          dateStart: null,
          dateEnd: null,
          id: null,
        },
      },
      { status: 400 }
    );
  }

  if (typeof dateStart !== "string" || dateStart.length === 0) {
    return json(
      {
        errors: {
          title: null,
          author: null,
          dateStart: "Date start is required",
          dateEnd: null,
        },
      },
      { status: 400 }
    );
  }

  if (typeof dateEnd !== "string" || dateEnd.length === 0) {
    return json(
      {
        errors: {
          title: null,
          author: null,
          dateStart: null,
          dateEnd: "Date end  is required",
        },
      },
      { status: 400 }
    );
  }

  const id = title
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .split(" ")
    .join("-");

  if (intent === "add") {
    await createBook({
      title,
      dateEnd: new Date(dateEnd),
      dateStart: new Date(dateStart),
      id,
      author,
      categoryId: params.categoryId,
    });
  } else if (intent === "update") {
    await updateBook({
      title,
      dateEnd: new Date(dateEnd),
      dateStart: new Date(dateStart),
      id,
      author,
      categoryId: params.categoryId,
    });
  }

  return redirect(
    `/book-group/${params.bookGroupId}/category/${params.categoryId}`
  );
}

const inputClassName = "";

export default function BookForm() {
  const actionData = useActionData<typeof action>();
  const { book } = useLoaderData<typeof loader>();
  const { categoryId } = useParams();

  const isEdit = Boolean(book);

  const transition = useTransition();
  const isUpdating =
    transition?.submission?.formData.get("intent") === "update";
  const isAdding = transition?.submission?.formData.get("intent") === "add";

  return (
    <PageContainer className="gap-4">
      <h1>{`${
        isEdit ? "Edytuj książkę" : "Dodaj nową ksiażkę"
      } dla kategorii ${categoryId}`}</h1>
      <Form method="post" className="flex flex-col items-center gap-4">
        <div className="flex w-full flex-col gap-4 md:grid md:grid-cols-2 md:gap-4">
          <Input
            className={inputClassName}
            label={<label htmlFor="title">Tytuł książki</label>}
            input={
              <input
                // ref={emailRef}
                defaultValue={book?.title}
                id="title"
                autoFocus={true}
                name="title"
                type="text"
                autoComplete="title"
                aria-describedby="title-error"
              />
            }
            error={actionData?.errors?.title}
          />
          <Input
            className={inputClassName}
            label={<label htmlFor="author">Author</label>}
            input={
              <input
                // ref={emailRef}
                defaultValue={book?.author}
                id="author"
                autoFocus={true}
                name="author"
                type="text"
                autoComplete="author"
                aria-describedby="author-error"
              />
            }
            error={actionData?.errors?.author}
          />
          <Input
            className={inputClassName}
            label={<label htmlFor="dateStart">Data rozpoczęcia czytania</label>}
            input={
              <input
                // ref={emailRef}
                defaultValue={formatDateToInput(book?.dateStart)}
                id="dateStart"
                autoFocus={true}
                name="dateStart"
                type="date"
                autoComplete="dateStart"
                aria-describedby="dateStart-error"
              />
            }
            error={actionData?.errors?.dateStart}
          />
          <Input
            className={inputClassName}
            label={
              <label htmlFor="dateEnd">
                Data planowego zakończenia czytania
              </label>
            }
            input={
              <input
                // ref={emailRef}
                defaultValue={formatDateToInput(book?.dateEnd)}
                id="dateEnd"
                autoFocus={true}
                name="dateEnd"
                type="date"
                autoComplete="dateEnd"
                aria-describedby="dateEnd-error"
              />
            }
            error={actionData?.errors?.dateEnd}
          />
        </div>
        <Button
          type="submit"
          className="w-full md:w-64"
          name="intent"
          disabled={isAdding || isUpdating}
          value={isEdit ? "update" : "add"}
        >
          {isEdit ? (isUpdating ? "Updating..." : "Update") : null}
          {isEdit ? null : isAdding ? "Creating..." : "Create"}
        </Button>
      </Form>
    </PageContainer>
  );
}
