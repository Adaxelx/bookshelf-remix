import { faker } from "@faker-js/faker";

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Logs in with a random user. Yields the user and adds an alias to the user
       *
       * @returns {typeof login}
       * @memberof Chainable
       * @example
       *    cy.login()
       * @example
       *    cy.login({ email: 'whatever@example.com' })
       */
      login: typeof login;

      /**
       * Creates user account
       *
       * @returns {typeof createUserAccount}
       * @memberof Chainable
       * @example
       *    cy.login()
       * @example
       *    cy.login({ email: 'whatever@example.com' })
       */
      createUserAccount: typeof createUserAccount;

      /**
       * Creates user and add it to group
       *
       * @returns {typeof createUserAndAddToGroup}
       * @example
       *    cy.createUserAndAddToGroup({ email: 'whatever@example.com',bookGroupId: '123' })
       */
      createUserAndAddToGroup: typeof createUserAndAddToGroup;

      /**
       * Logout current user
       *
       * @returns {typeof logout}
       * @example
       *    cy.logout()
       * */

      logout: typeof logout;

      /**
       * Deletes the current @user
       *
       * @returns {typeof cleanupUser}
       * @memberof Chainable
       * @example
       *    cy.cleanupUser()
       * @example
       *    cy.cleanupUser({ email: 'whatever@example.com' })
       */
      cleanupUser: typeof cleanupUser;

      /**
       * Deletes specific @bookGroupData
       *
       * @returns {typeof cleanupBookGroup}
       * @memberof Chainable
       * @example
       *    cy.cleanupBookGroup()
       * @example
       *    cy.cleanupBookGroup({ slug: '123' })
       */
      cleanupBookGroup: typeof cleanupBookGroup;

      /**
       * Deletes specific @bookCategoryData
       *
       * @returns {typeof cleanupBookCategory}
       * @memberof Chainable
       * @example
       *    cy.cleanupBookCategory()
       * @example
       *    cy.cleanupBookCategory({ slug: '123' })
       */
      cleanupBookCategory: typeof cleanupBookCategory;

      /**
       * Create random book group
       *
       * @returns {typeof createRandomBookGroup}
       * @memberof Chainable
       * @example
       *    cy.createRandomBookGroup()
       */
      createRandomBookGroup: typeof createRandomBookGroup;
      /**
       * Extends the standard visit command to wait for the page to load
       *
       * @returns {typeof visitAndCheck}
       * @memberof Chainable
       * @example
       *    cy.visitAndCheck('/')
       *  @example
       *    cy.visitAndCheck('/', 500)
       */
      visitAndCheck: typeof visitAndCheck;
    }
  }
}

function login({
  email = faker.internet.email(undefined, undefined, "example.com"),
  key = "user",
  shouldCreateUser = 1, // true
}: {
  email?: string;
  key?: string;
  shouldCreateUser?: number;
} = {}) {
  cy.then(() => ({ email })).as(key);
  cy.exec(
    `npx ts-node --require tsconfig-paths/register ./cypress/support/create-user-and-login.ts "${email}" "${shouldCreateUser}"`
  ).then(({ stdout }) => {
    const cookieValue = stdout
      .replace(/.*<cookie>(?<cookieValue>.*)<\/cookie>.*/s, "$<cookieValue>")
      .trim();

    const userId = stdout
      .replace(/.*<userId>(?<cookieValue>.*)<\/userId>.*/s, "$<cookieValue>")
      .trim();

    cy.then(() => ({ userId })).as(`${key}Id`);
    cy.setCookie("__session", cookieValue);
  });
  return cy.get(`@${key}`);
}

function createUserAccount({
  email = faker.internet.email(undefined, undefined, "example.com"),
  key = "user",
}: {
  email?: string;
  key?: string;
} = {}) {
  cy.then(() => ({ email })).as(key);
  cy.exec(
    `npx ts-node --require tsconfig-paths/register ./cypress/support/create-user.ts "${email}"`
  ).then(({ stdout }) => {
    const userId = stdout
      .replace(/.*<userId>(?<cookieValue>.*)<\/userId>.*/s, "$<cookieValue>")
      .trim();

    cy.then(() => ({ userId })).as(`${key}Id`);
  });
  return cy.get(`@${key}`);
}

function logout() {
  cy.visitAndCheck("/");
  cy.findByText("Logout").click();
}

function cleanupUser({
  email,
  key = "user",
}: { email?: string; key?: string } = {}) {
  if (email) {
    deleteUserByEmail(email);
  } else {
    cy.get(`@${key}`).then((user) => {
      const email = (user as { email?: string }).email;
      if (email) {
        deleteUserByEmail(email);
      }
    });
  }
  cy.clearCookie("__session");
}

function createUserAndAddToGroup({
  key = "userNotAdmin",
  email = faker.internet.email(undefined, undefined, "example.com"),
  bookGroupId,
}: {
  key?: string;
  email?: string;
  bookGroupId: string;
}) {
  cy.then(() => ({ email })).as(key);
  cy.exec(
    `npx ts-node --require tsconfig-paths/register ./cypress/support/create-user-and-add-to-group.ts "${email}" "${bookGroupId}"`
  );
}

function createRandomBookGroup() {
  cy.login();

  const testBookGroup = {
    name: faker.lorem.words(1),
    slug: faker.lorem.words(1),
  };

  cy.get("@userId").then((data) => {
    createBookGroup({
      ...testBookGroup,
      userId: (data as unknown as { userId: string }).userId,
    });
  });
}

function createBookGroup({
  userId,
  name,
  slug,
}: {
  userId: string;
  name: string;
  slug: string;
}) {
  cy.then(() => ({ name, slug })).as("bookGroupData");
  cy.exec(
    `npx ts-node --require tsconfig-paths/register ./cypress/support/create-book-group.ts "${userId}" "${name}" "${slug}"`
  );
}

function deleteUserByEmail(email: string) {
  cy.exec(
    `npx ts-node --require tsconfig-paths/register ./cypress/support/delete-user.ts "${email}"`
  );
  cy.clearCookie("__session");
}

function cleanupBookGroup({ slug }: { slug?: string } = {}) {
  if (slug) {
    deleteBookGroupBySlug(slug);
  } else {
    cy.get("@bookGroupData").then((bookGroup) => {
      const slug = (bookGroup as { name?: string; slug?: string }).slug;
      if (slug) {
        deleteBookGroupBySlug(slug);
      }
    });
  }
}

function deleteBookGroupBySlug(slug: string) {
  cy.exec(
    `npx ts-node --require tsconfig-paths/register ./cypress/support/delete-book-group.ts "${slug}"`
  );
}

function cleanupBookCategory({ slug }: { slug?: string } = {}) {
  if (slug) {
    deleteBookCategoryBySlug(slug);
  } else {
    cy.get("@bookCategoryData").then((bookGroup) => {
      const slug = (bookGroup as { name?: string; slug?: string }).slug;
      if (slug) {
        deleteBookCategoryBySlug(slug);
      }
    });
  }
}

function deleteBookCategoryBySlug(slug: string) {
  cy.exec(
    `npx ts-node --require tsconfig-paths/register ./cypress/support/delete-book-category.ts "${slug}"`
  );
}

// We're waiting a second because of this issue happen randomly
// https://github.com/cypress-io/cypress/issues/7306
// Also added custom types to avoid getting detached
// https://github.com/cypress-io/cypress/issues/7306#issuecomment-1152752612
// ===========================================================
function visitAndCheck(url: string, waitTime: number = 1000) {
  cy.visit(url);
  cy.location("pathname").should("contain", url).wait(waitTime);
}

Cypress.Commands.add("login", login);
Cypress.Commands.add("cleanupUser", cleanupUser);
Cypress.Commands.add("visitAndCheck", visitAndCheck);
Cypress.Commands.add("createRandomBookGroup", createRandomBookGroup);
Cypress.Commands.add("cleanupBookGroup", cleanupBookGroup);
Cypress.Commands.add("cleanupBookCategory", cleanupBookCategory);
Cypress.Commands.add("logout", logout);
Cypress.Commands.add("createUserAccount", createUserAccount);
Cypress.Commands.add("createUserAndAddToGroup", createUserAndAddToGroup);
/*
eslint
  @typescript-eslint/no-namespace: "off",
*/
