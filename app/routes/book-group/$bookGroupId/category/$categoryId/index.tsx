import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useActionData,
  useCatch,
  useLoaderData,
  useParams,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import {
  Alert,
  Button,
  Card,
  DeleteModal,
  deleteModalLinks,
  ErrorFallback,
  Input,
  PageContainer,
} from "~/components";
import { deleteBook } from "~/models/book.server";

import { requireAdminUser, requireUser } from "~/session.server";
import dayjs from "dayjs";
import { addOpinion } from "~/models/opinion.server";
import { useEffect, useState } from "react";
import type { Nullable } from "~/utils";
import { useIsAdminUser } from "~/utils";
import { prisma } from "~/db.server";
import {
  deleteCategory,
  unactivateCategory,
} from "~/models/bookCategory.server";
import { getCategoryImgSrc } from "~/utils/image";

export const links = () => [...deleteModalLinks()];

export async function loader({ request, params }: LoaderArgs) {
  await requireUser(request);
  invariant(params.categoryId, "CategoryName is required");
  const bookCategory = await prisma.bookCategory.findUnique({
    where: { id: params.categoryId },
    select: {
      imageId: true,
      name: true,
      isActive: true,
      wasPicked: true,
      book: {
        select: {
          title: true,
          author: true,
          id: true,
          dateEnd: true,
          dateStart: true,
          opinions: {
            select: {
              id: true,
              rate: true,
              description: true,
              user: {
                select: { name: true },
              },
            },
          },
        },
      },
    },
  });

  return json({
    bookCategory,
  });
}

export async function action({ request, params }: ActionArgs) {
  const user = await requireAdminUser(request, params);
  const formData = await request.formData();
  const formDataRate = formData.get("rate");
  const description = formData.get("description");
  const bookId = formData.get("bookId");
  const intent = formData.get("intent");

  invariant(params.bookGroupId, "Book group id must be defined");
  invariant(params.categoryId, "Category name must be defined.");
  if (intent === "unactivate") {
    await unactivateCategory(params.categoryId);

    return json({
      errors: { rate: null, description: null, bookId: null },
      shouldCloseModal: false,
    });
  }
  if (intent === "delete-category") {
    await deleteCategory(params.categoryId);
    return redirect(`/book-group/${params.bookGroupId}/category`);
  }
  if (intent === "delete-book") {
    await deleteBook(params.categoryId);
    return json({
      errors: { rate: null, description: null, bookId: null },
      shouldCloseModal: true,
    });
  }

  const rate = Number(formDataRate);
  if (typeof rate !== "number" || rate < 0 || rate > 10) {
    return json(
      {
        errors: {
          rate: "Rate is required to be <0,10>",
          description: null,
          bookId: null,
        },
        shouldCloseModal: false,
      },
      { status: 400 }
    );
  }

  if (typeof description !== "string" || description.length === 0) {
    return json(
      {
        errors: {
          rate: null,
          description: "Description is required",
          bookId: null,
        },
        shouldCloseModal: false,
      },
      { status: 400 }
    );
  }
  if (typeof bookId !== "string" || bookId.length === 0) {
    return json(
      {
        errors: {
          rate: null,
          description: null,
          bookId: "Book is required to create opinion",
        },
        shouldCloseModal: false,
      },
      { status: 400 }
    );
  }

  await addOpinion({
    bookId,
    description,
    rate,
    userId: user.id,
  });

  return redirect(
    `/book-group/${params.bookGroupId}/category/${params.categoryId}`
  );
}

type DeleteModalTypes = Nullable<"category" | "opinion" | "book">;

export default function CategoryPage() {
  const { bookCategory } = useLoaderData<typeof loader>();

  const { bookGroupId, categoryId } = useParams();

  const isAdminUser = useIsAdminUser(bookGroupId);

  const actionData = useActionData<typeof action>();

  const [isDeleteModalOpen, setIsDeleteModalOpen] =
    useState<DeleteModalTypes>(null);

  useEffect(() => {
    if (actionData?.shouldCloseModal) {
      setIsDeleteModalOpen(null);
    }
  }, [actionData?.shouldCloseModal]);

  if (!bookCategory) return null;

  const { name, book, isActive, wasPicked, imageId } = bookCategory;

  const isBookPresent = book;
  const wasBookActiveOrPicked = isActive || wasPicked;
  const shouldShowAddBookButton = !isBookPresent && wasBookActiveOrPicked;
  const shouldShowNoActiveCategoryAlert =
    !isBookPresent && !wasBookActiveOrPicked;

  const opinions = book?.opinions ?? [];

  return (
    <PageContainer className="gap-4">
      <header className="flex flex-col gap-2">
        <h1>{name}</h1>
        {isActive || wasPicked ? (
          <div className="flex gap-2">
            {isActive ? (
              <div className="rounded bg-primary-600 px-3 py-1">Active</div>
            ) : null}
            {wasPicked ? (
              <div className="rounded bg-primary-600 px-3 py-1">
                Already picked
              </div>
            ) : null}
          </div>
        ) : null}
      </header>
      {isAdminUser ? (
        <section className="flex gap-2">
          <Button
            variant="secondary"
            prefetch="intent"
            to={`/book-group/${bookGroupId}/category-form?id=${categoryId}`}
          >
            Edit
          </Button>
          {isActive ? (
            <Form method="post">
              <Button
                type="submit"
                name="intent"
                variant="secondary"
                value={`unactivate`}
              >
                Unactivate
              </Button>
            </Form>
          ) : null}

          <Button
            colorVariant="error"
            onClick={() => setIsDeleteModalOpen("category")}
          >
            Delete
          </Button>
        </section>
      ) : null}

      <main className="flex max-h-[40rem] flex-col gap-4 md:flex-row">
        <div className="max-h-[40rem] max-w-sm self-center">
          <Card
            src={getCategoryImgSrc(imageId)}
            alt={`Card for category ${name}`}
          />
        </div>
        <section className="flex grow flex-col gap-4 rounded bg-primary-300 p-3">
          <div className="flex flex-col gap-1 md:flex-row md:gap-4">
            <h2 className="text-primary-700">Choosen book</h2>
            {isBookPresent && isAdminUser ? (
              <>
                <Button
                  variant="secondary"
                  to={`book-form?id=${book.id}`}
                  prefetch="intent"
                >
                  Edit book
                </Button>
                <Button
                  colorVariant="error"
                  onClick={() => setIsDeleteModalOpen("book")}
                >
                  Delete
                </Button>
              </>
            ) : null}
          </div>
          {isBookPresent ? (
            <article className="flex shrink grow basis-0 flex-col gap-4">
              <section className="grid grid-cols-2 grid-rows-4 gap-y-2">
                <span className="text text-secondary-600">Title:</span>
                <span className="text-lg font-medium">{book.title}</span>
                <span className="text text-secondary-600">Author:</span>
                <span className="text-lg font-medium">{book.author}</span>
                <span className="text text-secondary-600">Date Start:</span>
                <span className="text-lg font-medium">
                  {dayjs(book.dateStart).format("DD.MM.YYYY")}
                </span>
                <span className="text text-secondary-600">Date End:</span>
                <span className="text-lg font-medium">
                  {dayjs(book.dateStart).format("DD.MM.YYYY")}
                </span>
              </section>
              <section className="flex shrink grow basis-0 flex-col gap-2">
                <h4 className="text-primary-700">
                  Opinions after reading a book:
                </h4>

                <section className="flex flex-col gap-1 overflow-auto md:min-h-[192px] md:shrink md:grow  md:basis-0">
                  {opinions.length === 0 ? (
                    <Alert variant="info">
                      Currently there are no opinons. Be first critic!
                    </Alert>
                  ) : (
                    opinions.map(({ id, rate, description, user }) => {
                      const color = getColor(rate);
                      return (
                        <div
                          key={id}
                          className="flex flex-col gap-2 rounded bg-primary-100 p-3"
                        >
                          <p className="flex items-baseline gap-2">
                            <span
                              className={`text-2xl text-${color}-100 rounded-full bg-${color}-600 grid h-10 w-10 place-content-center`}
                            >
                              {rate}
                            </span>{" "}
                            <span>{description}</span>
                          </p>
                          <p className="text-secondary-800">~ {user.name}</p>
                        </div>
                      );
                    })
                  )}
                </section>
                <Form method="post" className="flex items-start gap-1">
                  <Input
                    className="w-12"
                    label={<label>Rate:</label>}
                    input={
                      <input
                        // ref={emailRef}
                        required
                        min={0}
                        max={10}
                        id="rate"
                        autoFocus={true}
                        name="rate"
                        type="number"
                        autoComplete="rate"
                        aria-describedby="rate-error"
                      />
                    }
                    errors={[actionData?.errors?.rate]}
                  />
                  <Input
                    className="grow"
                    label={<label htmlFor="dateEnd">Opinion:</label>}
                    input={
                      <input
                        // ref={emailRef}
                        id="description"
                        autoFocus={true}
                        name="description"
                        type="text"
                        autoComplete="description"
                        aria-describedby="description-error"
                      />
                    }
                    errors={[actionData?.errors?.description]}
                  />
                  <Input
                    className="self-end"
                    input={
                      <input hidden={true} name="bookId" value={book.id} />
                    }
                    errors={[actionData?.errors?.bookId]}
                  />
                  <Button className="mt-6" type="submit">
                    Prześlij
                  </Button>
                </Form>
              </section>
            </article>
          ) : null}
          {shouldShowAddBookButton && isAdminUser ? (
            <Button variant="secondary" to="book-form" prefetch="intent">
              Add book
            </Button>
          ) : null}
          {shouldShowNoActiveCategoryAlert ? (
            <Alert variant="info">Category must be active to add book.</Alert>
          ) : null}
          {shouldShowAddBookButton && !isAdminUser ? (
            <Alert variant="info">
              Admin user didn't add book yet. Stay tuned!
            </Alert>
          ) : null}
        </section>
      </main>
      <DeleteModal
        isOpen={Boolean(isDeleteModalOpen)}
        onClose={() => setIsDeleteModalOpen(null)}
        title={getTitle(isDeleteModalOpen)}
        content={getContent(isDeleteModalOpen)}
        actions={
          <>
            <Button onClick={() => setIsDeleteModalOpen(null)}>Keep it</Button>
            <Button
              colorVariant="error"
              variant="secondary"
              type="submit"
              name="intent"
              value={`delete-${isDeleteModalOpen}`}
            >
              Delete
            </Button>
          </>
        }
      />
    </PageContainer>
  );
}

const getTitle = (modalType: DeleteModalTypes) => {
  switch (modalType) {
    case "category":
      return "Are you sure you want delete this category?";
    case "book":
      return "Are you sure you want delete this book?";
    case "opinion":
      return "Are you sure you want delete this opinion?";
    default:
      return "";
  }
};

const getContent = (modalType: DeleteModalTypes) => {
  switch (modalType) {
    case "category":
      return "This action is not reversible and after that you will lose added book and all opinions.";
    case "book":
      return "This action is not reversible and after that you will lose all opinions attached to book.";
    case "opinion":
      return "This action is not reversible.";
    default:
      return "";
  }
};

const getColor = (rate: number) => {
  if (rate < 4) {
    return "red";
  } else if (rate < 7) {
    return "amber";
  }
  return "green";
};

export function CatchBoundary() {
  const caught = useCatch();
  return <ErrorFallback>{caught.data}</ErrorFallback>;
}
