// Use this to create a new user and login with that user
// Simply call this with:
// npx ts-node --require tsconfig-paths/register ./cypress/support/create-user-and-login.ts username@example.com
// and it will log out the cookie value you can use to interact with the server
// as that new user.

import { parse } from "cookie";
import { installGlobals } from "@remix-run/node";
import { createUserSession } from "~/session.server";
import { createUser, getUserByEmail } from "~/models/user.server";
import invariant from "tiny-invariant";

installGlobals();

async function createAndLogin(email: string, shouldCreateUser: string) {
  if (!email) {
    throw new Error("email required for login");
  }
  if (!email.endsWith("@example.com")) {
    throw new Error("All test emails must end in @example.com");
  }

  const shouldCreate = Boolean(Number(shouldCreateUser));

  const user = shouldCreate
    ? await createUser({
        email,
        password: "myreallystrongpassword",
        name: "Random name",
      })
    : await getUserByEmail(email);

  invariant(user, "User should be defined");

  const response = await createUserSession({
    request: new Request("test://test"),
    userId: user.id,
    remember: false,
    redirectTo: "/",
  });

  const cookieValue = response.headers.get("Set-Cookie");
  if (!cookieValue) {
    throw new Error("Cookie missing from createUserSession response");
  }
  const parsedCookie = parse(cookieValue);
  // we log it like this so our cypress command can parse it out and set it as
  // the cookie value.
  console.log(
    `
<cookie>
  ${parsedCookie.__session}
</cookie>
<userId>
    ${user.id}
</userId>
  `.trim()
  );
}

createAndLogin(process.argv[2], process.argv[3]);
