import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import {
  Alert,
  Button,
  Card,
  ErrorFallback,
  Input,
  PageContainer,
} from "~/components";
import { getBook } from "~/models/book.server";
import { getCategory } from "~/models/bookCategory.server";
import { getImage } from "~/models/image.server";
import { requireUser } from "~/session.server";
import dayjs from "dayjs";
import { addOpinion, getOpinions } from "~/models/opinion.server";

export async function loader({ request, params }: LoaderArgs) {
  await requireUser(request);
  invariant(params.categorySlug, "CategoryName is required");
  const bookCategory = await getCategory(params.categorySlug);
  if (!bookCategory) {
    throw new Response(
      `Category with slug "${params.categorySlug}" doesn't exist!`,
      {
        status: 404,
      }
    );
  }
  const image = await getImage(bookCategory.imageId);
  invariant(
    image,
    `Image not found for category ${bookCategory.name}. Something went wrong.`
  );
  const book = await getBook(bookCategory.slug);
  let opinions: Awaited<ReturnType<typeof getOpinions>> = [];
  if (book) {
    opinions = await getOpinions(book.slug);
  }

  return json({
    bookCategory,
    image: image.encoded,
    book: book
      ? {
          title: book.title,
          author: book.author,
          dateStart: book.dateStart,
          dateEnd: book.dateEnd,
          slug: book.slug,
        }
      : null,
    opinions,
  });
}

export async function action({ request, params }: ActionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const formDataRate = formData.get("rate");
  const description = formData.get("description");
  const bookId = formData.get("bookId");

  invariant(params.categoryName, "Category name must be defined.");
  const rate = Number(formDataRate);
  if (typeof rate !== "number" || rate < 0 || rate > 10) {
    return json(
      {
        errors: {
          rate: "Rate is required to be <0,10>",
          description: null,
          bookId: null,
        },
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

  return redirect(`/book-group/${params.bookGroupSlug}/${params.categoryName}`);
}

export default function CategoryPage() {
  const { bookCategory, image, book, opinions } =
    useLoaderData<typeof loader>();

  const actionData = useActionData<typeof action>();
  const { name } = bookCategory;

  return (
    <PageContainer className="gap-4">
      <header className="flex flex-col gap-2">
        <h1>{name}</h1>
        <div className="flex gap-2">
          {bookCategory.isActive ? (
            <div className="rounded bg-primary-600 px-3 py-1">Active</div>
          ) : null}
          {bookCategory.wasPicked ? (
            <div className="rounded bg-primary-600 px-3 py-1">
              Already picked
            </div>
          ) : null}
        </div>
      </header>
      <main className="flex max-h-[40rem] flex-col gap-4 md:flex-row">
        <div className="max-h-[40rem] max-w-sm self-center">
          <Card src={image} alt={`Card for category ${bookCategory.name}`} />
        </div>
        <section className="flex grow flex-col gap-4 rounded bg-primary-300 p-3">
          <div className="flex flex-col gap-1 md:flex-row md:gap-4">
            <h2 className="text-primary-700">Choosen book</h2>
            {book ? (
              <Button variant="secondary" to="book/new">
                Edit book
              </Button>
            ) : null}
          </div>
          {book ? (
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
                {opinions.length === 0 ? (
                  <Alert variant="info">
                    Currently there are no opinons. Be first critic!
                  </Alert>
                ) : (
                  <section className="flex flex-col gap-1 overflow-auto md:min-h-[192px] md:shrink md:grow  md:basis-0">
                    {opinions.map(({ id, rate, description, user }) => {
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
                    })}
                  </section>
                )}
                <Form method="post" className="flex items-start gap-1">
                  <Input
                    className="w-12"
                    label={<label htmlFor="dateEnd">Rate:</label>}
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
                    error={actionData?.errors?.rate}
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
                    error={actionData?.errors?.description}
                  />
                  <Input
                    className="self-end"
                    input={
                      <input hidden={true} name="bookId" value={book.slug} />
                    }
                    error={actionData?.errors?.bookId}
                  />
                  <Button className="mt-6" type="submit">
                    Prześlij
                  </Button>
                </Form>
              </section>
            </article>
          ) : (
            <Button variant="secondary" to="book/new">
              Add book
            </Button>
          )}
        </section>
      </main>
    </PageContainer>
  );
}

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
