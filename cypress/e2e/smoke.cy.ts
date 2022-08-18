import { faker } from "@faker-js/faker";

describe("smoke tests", () => {
  describe("login", () => {
    afterEach(() => {
      cy.cleanupUser();
    });

    it("should allow you to register and login", () => {
      const loginForm = {
        email: `${faker.internet.userName()}@example.com`,
        password: faker.internet.password(),
        name: faker.internet.userName(),
      };

      cy.then(() => ({ email: loginForm.email })).as("user");

      cy.visitAndCheck("/");

      cy.findByRole("link", { name: /sign up/i }).click();

      cy.findByRole("textbox", { name: /email/i }).type(loginForm.email);
      cy.findByLabelText(/name/i).type(loginForm.name);
      cy.findByLabelText(/password/i).type(loginForm.password);

      cy.findByRole("button", { name: /create account/i }).click();

      cy.findByText("Book groups");
    });

    it("should allow you to register and login and logout", () => {
      cy.login();
      cy.logout();

      cy.findByText("Sign up");
      cy.findByText("Log In");
    });
  });

  describe("book groups", () => {
    afterEach(() => {
      cy.cleanupBookGroup();
      cy.cleanupUser();
    });

    it("should create book group", () => {
      const testBookGroup = {
        name: faker.lorem.words(1),
        slug: faker.lorem.words(1),
      };

      cy.then(() => ({ ...testBookGroup })).as("bookGroupData");
      cy.login();

      cy.visitAndCheck("/book-group-form");

      // cy.findByRole("link", { name: /Add new group/i }).click();

      cy.get("#name").type(testBookGroup.name);
      cy.get("#slug").type(testBookGroup.slug);
      cy.findByText("Create").click();

      cy.get("h1").should("have.text", testBookGroup.name);
      cy.url().should("include", `book-group/${testBookGroup.slug}`);
    });

    it("should remove book group", () => {
      cy.createRandomBookGroup();

      cy.visitAndCheck("/book-group");

      cy.get("@bookGroupData").then((bookGroup) =>
        cy
          .findByText(`${(bookGroup as unknown as { name: string }).name}`)
          .click()
      );

      cy.get('[data-test="button:removeBookGroup"]').click();

      cy.get('[data-test="button:deleteConfirmation"]').click();

      cy.url().should("eq", `${Cypress.config().baseUrl}/book-group`);

      cy.get("@bookGroupData").then((bookGroup) =>
        cy
          .findByText(`${(bookGroup as unknown as { name: string }).name}`)
          .should("not.exist")
      );
    });

    const notAllowedForNoAdminUser = [
      "newCategory",
      "addUser",
      "editGroup",
      "removeBookGroup",
    ];

    it(`should not show ${notAllowedForNoAdminUser.join(
      ", "
    )} options for not admin user`, () => {
      const userNotAdminKey = "userNotAdmin";

      cy.createRandomBookGroup();

      cy.logout();

      cy.get("@bookGroupData").then((bookGroup) =>
        cy.createUserAndAddToGroup({
          key: userNotAdminKey,
          bookGroupId: (bookGroup as unknown as { slug: string }).slug,
        })
      );

      cy.get(`@${userNotAdminKey}`).then((user) =>
        cy.login({
          email: (user as unknown as { email?: string }).email,
          shouldCreateUser: 0,
        })
      );

      cy.visitAndCheck("/book-group");

      cy.get("@bookGroupData").then((bookGroup) =>
        cy
          .findByText(`${(bookGroup as unknown as { name: string }).name}`)
          .click()
      );

      notAllowedForNoAdminUser.forEach((buttonName) =>
        cy.get(`[data-test="button:${buttonName}"]`).should("not.exist")
      );

      cy.cleanupUser({ key: userNotAdminKey });
    });

    it("should add user to group", () => {
      const userNotAdminKey = "userNotAdmin";

      cy.createRandomBookGroup();
      cy.createUserAccount({ key: userNotAdminKey });
      cy.visitAndCheck("/book-group");
      cy.get("@bookGroupData").then((bookGroup) =>
        cy
          .findByText(`${(bookGroup as unknown as { name: string }).name}`)
          .click()
      );

      cy.get('[data-test="button:addUser"]').click();

      cy.get(`@${userNotAdminKey}`).then((user) =>
        cy
          .get("#email")
          .type(`${(user as unknown as { email?: string }).email}`)
      );

      cy.get('[data-test="button:submitUser"]').click();

      cy.get(`@${userNotAdminKey}`).then((user) => {
        cy.get("@bookGroupData").then((bookGroup) =>
          cy
            .url()
            .should(
              "eq",
              `${Cypress.config().baseUrl}/book-group/${
                (bookGroup as unknown as { slug?: string }).slug
              }/user-list`
            )
        );
        cy.findByText(`${(user as unknown as { email?: string }).email}`);
        cy.cleanupUser({ key: userNotAdminKey });
      });
    });

    it(`should remove user from group`, () => {
      const userNotAdminKey = "userNotAdmin";

      cy.createRandomBookGroup();

      cy.get("@bookGroupData").then((bookGroup) =>
        cy.createUserAndAddToGroup({
          key: userNotAdminKey,
          bookGroupId: (bookGroup as unknown as { slug: string }).slug,
        })
      );

      cy.visitAndCheck("/book-group");

      cy.get("@bookGroupData").then((bookGroup) =>
        cy
          .findByText(`${(bookGroup as unknown as { name: string }).name}`)
          .click()
      );

      cy.get('[data-test="button:userList"]').click();

      cy.get('[data-test="button:removeUser"]').click();

      cy.get('[data-test="button:deleteConfirmation"]').click();

      cy.cleanupUser({ key: userNotAdminKey });
    });

    it("should edit book group", () => {
      const testEditBookGroup = {
        name: faker.lorem.words(1),
        slug: faker.lorem.words(1),
      };
      cy.createRandomBookGroup();

      cy.visitAndCheck("/book-group");

      cy.get("@bookGroupData").then((bookGroup) =>
        cy
          .findByText(`${(bookGroup as unknown as { name: string }).name}`)
          .click()
      );

      cy.get('[data-test="button:editGroup"]').click();

      cy.findByText("Edit", { exact: false });

      cy.get("#name").clear().type(testEditBookGroup.name);
      cy.get("#slug").clear().type(testEditBookGroup.slug);

      cy.get('[data-test="button:submitBookForm"]').click();

      cy.then(() => ({ ...testEditBookGroup })).as("bookGroupData");

      cy.url().should(
        "eq",
        `${Cypress.config().baseUrl}/book-group/${testEditBookGroup.slug}`
      );
    });
  });

  describe("book categories", () => {
    afterEach(() => {
      cy.cleanupBookCategory();
      cy.cleanupBookGroup();
      cy.cleanupUser();
    });

    it("should add new category", () => {
      cy.createRandomBookGroup();

      cy.get("@bookGroupData").then((bookGroup) =>
        cy.visitAndCheck(
          `/book-group/${
            (bookGroup as unknown as { slug: string }).slug
          }/category-form`
        )
      );

      const testBookCategory = {
        name: faker.lorem.words(1),
        slug: faker.lorem.words(1),
      };

      cy.then(() => ({ ...testBookCategory })).as("bookCategoryData");

      cy.get("#name").type(testBookCategory.name);
      cy.get("#slug").type(testBookCategory.slug);
      cy.get('[data-test="image0"]').click();
      cy.findByText("Create").click();

      cy.get("@bookGroupData").then((bookGroup) =>
        cy
          .url()
          .should(
            "include",
            `/book-group/${
              (bookGroup as unknown as { slug: string }).slug
            }/category/${testBookCategory.slug}`
          )
      );
      cy.get("h1").should("have.text", testBookCategory.name);
    });
  });
});
