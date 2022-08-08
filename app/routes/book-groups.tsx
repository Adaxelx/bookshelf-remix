import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getUserBookGroups } from "~/models/bookGroup.server";
import { getUserId } from "~/session.server";
import { useOptionalUser } from "~/utils";

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);
  if (!userId) return redirect("/login");
  const bookGroups = await getUserBookGroups(userId);
  return json({ bookGroups });
}

export default function BookGroups() {
  const { bookGroups } = useLoaderData<typeof loader>();
  const user = useOptionalUser();
  return (
    <div className="text-secondary-300">
      <h1>Bookgroup</h1>
      {bookGroups.map((bookGroup) => (
        <p
          key={bookGroup.id}
          className={user?.id === bookGroup.creatorId ? "bg-orange-600" : ""}
        >
          {bookGroup.name}
        </p>
      ))}
    </div>
  );
}
