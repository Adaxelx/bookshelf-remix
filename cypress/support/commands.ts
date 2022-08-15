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
}: {
  email?: string;
} = {}) {
  cy.then(() => ({ email })).as("user");
  cy.exec(
    `npx ts-node --require tsconfig-paths/register ./cypress/support/create-user.ts "${email}"`
  ).then(({ stdout }) => {
    const cookieValue = stdout
      .replace(/.*<cookie>(?<cookieValue>.*)<\/cookie>.*/s, "$<cookieValue>")
      .trim();

    const userId = stdout
      .replace(/.*<userId>(?<cookieValue>.*)<\/userId>.*/s, "$<cookieValue>")
      .trim();

    cy.then(() => ({ userId })).as("userId");
    cy.setCookie("__session", cookieValue);
  });
  return cy.get("@user");
}

function cleanupUser({ email }: { email?: string } = {}) {
  if (email) {
    deleteUserByEmail(email);
  } else {
    cy.get("@user").then((user) => {
      const email = (user as { email?: string }).email;
      if (email) {
        deleteUserByEmail(email);
      }
    });
  }
  cy.clearCookie("__session");
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
/*
eslint
  @typescript-eslint/no-namespace: "off",
*/
