import type { ActionArgs } from "@remix-run/node";
import { Form, Link } from "@remix-run/react";
import { Button } from "~/components";
import { logout } from "~/session.server";

import { useOptionalUser } from "~/utils";

export async function action({ request, params }: ActionArgs) {
  return logout(request);
}

export default function Index() {
  const user = useOptionalUser();
  return (
    <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
      {user ? (
        <>
          <Link
            to="/book-group"
            className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-yellow-700 shadow-sm hover:bg-yellow-50 sm:px-8"
          >
            View Bookgroups for {user.email}
          </Link>
          <Form method="post">
            <Button type="submit">Logout</Button>
          </Form>
        </>
      ) : (
        <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
          <Link
            to="/join"
            className="flex items-center justify-center rounded-md border border-transparent bg-neutral-100 px-4 py-3 text-base font-medium text-yellow-700 shadow-sm hover:bg-yellow-50 sm:px-8"
          >
            Sign up
          </Link>
          <Link
            to="/login"
            className="flex items-center justify-center rounded-md bg-yellow-500 px-4 py-3 font-medium text-white hover:bg-yellow-600  "
          >
            Log In
          </Link>
        </div>
      )}
    </main>
  );
}
