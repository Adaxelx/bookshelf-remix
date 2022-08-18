import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useParams } from "@remix-run/react";

import invariant from "tiny-invariant";
import { Button, PageContainer } from "~/components";

import {
  getUsersForBookGroup,
  removeUserFromGroup,
} from "~/models/bookGroupsToUsers.server";
import { requireAdminUser, requireUser } from "~/session.server";
import { useIsAdminUser } from "~/utils";

export async function loader({ request, params }: LoaderArgs) {
  await requireUser(request);
  invariant(params.bookGroupSlug, "Book group id is required");
  const connections = await getUsersForBookGroup(params.bookGroupSlug);

  return json({
    connections,
  });
}

export async function action({ request, params }: ActionArgs) {
  await requireAdminUser(request, params);
  const formData = await request.formData();
  const userId = formData.get("userId");
  const bookGroupId = formData.get("bookGroupId");

  invariant(params.bookGroupSlug, "Book group name must be defined.");

  if (typeof userId !== "string") {
    throw new Response(`Failed to find userId.`, {
      status: 404,
    });
  }
  if (typeof bookGroupId !== "string") {
    throw new Response(`Failed to find bookGroupId.`, {
      status: 404,
    });
  }

  await removeUserFromGroup({
    userId,
    slug: bookGroupId,
  });

  return redirect(`/book-group/${params.bookGroupSlug}/user-list`);
}

export default function UserList() {
  const { connections } = useLoaderData<typeof loader>();
  const { bookGroupSlug } = useParams();
  const isUserAdmin = useIsAdminUser(bookGroupSlug);

  return (
    <PageContainer className="gap-4">
      <h1>List of users</h1>
      <section className="flex flex-col gap-3">
        {connections.map(
          ({
            userId,
            bookGroupId,
            user: { email },
            bookGroup: { creatorId },
          }) => {
            const isAdmin = creatorId === userId;
            return (
              <div
                key={`${userId}${bookGroupId}`}
                className="flex items-center justify-between rounded bg-primary-400 p-3"
              >
                <p className="text-lg font-medium">{email}</p>
                <div className="flex items-baseline gap-2">
                  {isAdmin ? (
                    <div className="rounded bg-primary-600 px-5 py-2">
                      Admin
                    </div>
                  ) : null}
                  {isUserAdmin && !isAdmin ? (
                    <Form method="post">
                      <input hidden name="userId" value={userId} />
                      <input hidden name="bookGroupId" value={bookGroupId} />
                      <Button colorVariant="error">Delete</Button>
                    </Form>
                  ) : null}
                </div>
              </div>
            );
          }
        )}
      </section>
    </PageContainer>
  );
}
