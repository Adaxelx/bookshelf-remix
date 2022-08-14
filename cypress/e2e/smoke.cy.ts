import { faker } from "@faker-js/faker";

describe("smoke tests", () => {
  afterEach(() => {
    cy.cleanupUser();
    cy.deleteBookGroups();
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

  it("should create book group", () => {
    const testBookGroup = {
      name: faker.lorem.words(1),
      slug: faker.lorem.words(1),
    };
    cy.login();

    cy.visitAndCheck("/book-group");

    cy.findByRole("link", { name: /Add new group/i }).click();

    cy.get("#name").type(testBookGroup.name);
    cy.get("#slug").type(testBookGroup.slug);
    cy.findByText("Add").click();

    cy.findByText(testBookGroup.name);
    cy.url().should("include", `book-group/${testBookGroup.slug}`);
    cy.login();
  });

  it("should add new category", () => {
    cy.createRandomBookGroup();

    cy.get("@bookGroupData").then((bookGroup) =>
      cy.visitAndCheck(
        `/book-group/${
          (bookGroup as unknown as { slug: string }).slug
        }/new-category`
      )
    );

    const testBookCategory = {
      name: faker.lorem.words(1),
      slug: faker.lorem.words(1),
    };

    cy.get("#name").type(testBookCategory.name);
    cy.get("#slug").type(testBookCategory.slug);
    cy.get('[data-test="image0"]').click();
    cy.findByText("Add").click();

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
    cy.login();
  });
});
