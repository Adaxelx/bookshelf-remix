// Use this to create a new user and login with that user
// Simply call this with:
// npx ts-node --require tsconfig-paths/register ./cypress/support/create-user.ts username@example.com
// and it will log out the cookie value you can use to interact with the server
// as that new user.

import { installGlobals } from "@remix-run/node";
import { createUser } from "~/models/user.server";
import { addUserToBookGroup } from "~/models/bookGroupsToUsers.server";
installGlobals();

async function createUserAndAddToGroup(email: string, bookGroupId: string) {
  console.log(email, bookGroupId);
  if (!email) {
    throw new Error("email required for login");
  }
  if (!email.endsWith("@example.com")) {
    throw new Error("All test emails must end in @example.com");
  }

  const user = await createUser({
    email,
    password: "myreallystrongpassword",
    name: "Random name",
  });

  await addUserToBookGroup({ email, slug: bookGroupId });

  console.log(
    `
<userId>
    ${user.id}
</userId>
  `.trim()
  );
}

createUserAndAddToGroup(process.argv[2], process.argv[3]);
