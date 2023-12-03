import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData, useParams } from "@remix-run/react";
import { useEffect, useState } from "react";

import invariant from "tiny-invariant";
import {
  Button,
  DeleteModal,
  PageContainer,
  deleteModalLinks,
} from "~/components";

import {
  getUsersForBookGroup,
  removeUserFromGroup,
} from "~/models/bookGroupsToUsers.server";
import { requireAdminUser, requireUser } from "~/session.server";
import { useIsAdminUser } from "~/utils";

export const links = () => [...deleteModalLinks()];

export async function loader({ request, params }: LoaderArgs) {
  await requireUser(request);
  invariant(params.bookGroupId, "Book group id is required");
  const connections = await getUsersForBookGroup(params.bookGroupId);

  return json({
    connections,
  });
}

export async function action({ request, params }: ActionArgs) {
  await requireAdminUser(request, params);
  const formData = await request.formData();
  const userId = formData.get("userId");
  const bookGroupId = formData.get("bookGroupId");

  invariant(params.bookGroupId, "Book group name must be defined.");

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
    id: bookGroupId,
  });

  return json({ userId });
}

export default function UserList() {
  const { connections } = useLoaderData<typeof loader>();
  const { bookGroupId } = useParams();
  const isUserAdmin = useIsAdminUser(bookGroupId);
  const actionData = useActionData<typeof action>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<{
    userId: string;
    bookGroupId: string;
  } | null>(null);

  useEffect(() => {
    if (actionData) {
      setIsDeleteModalOpen(null);
    }
  }, [actionData]);

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
                    <Button
                      colorVariant="error"
                      data-test="button:removeUser"
                      onClick={() =>
                        setIsDeleteModalOpen({ userId, bookGroupId })
                      }
                    >
                      Delete
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          }
        )}
      </section>
      <DeleteModal
        isOpen={Boolean(isDeleteModalOpen)}
        onClose={() => setIsDeleteModalOpen(null)}
        title={`Are you sure you want delete this user?`}
        content={"User will not participate in book club anymore."}
        actions={
          <>
            <input hidden name="userId" value={isDeleteModalOpen?.userId} />
            <input
              hidden
              name="bookGroupId"
              value={isDeleteModalOpen?.bookGroupId}
            />
            <Button onClick={() => setIsDeleteModalOpen(null)}>Keep it</Button>
            <Button
              colorVariant="error"
              variant="secondary"
              type="submit"
              name="intent"
              value="delete"
              data-test="button:deleteConfirmation"
            >
              Delete
            </Button>
          </>
        }
      />
    </PageContainer>
  );
}
