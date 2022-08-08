const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const bookCategoriesNames = [
  "Astronomia",
  "Bajka",
  "Baśnie",
  "Biografia",
  "Biznes/Finanse",
  "Dramat",
  "Erotyka",
  "Eseje",
  "Etyka",
  "Fantasy",
  "Filozofia",
  "Flora i fauna",
  "Historia",
  "Historie biblijne",
  "Horror",
  "Informatyka",
  "Klasyka",
  "Komedia",
  "Komiksy",
  "Kryminał",
  "Legendy",
  "Literatura popularno-naukowa",
  "Językoznawstwo",
  "Literatura młodzieżowa",
  "Literatura obyczajowa",
  "Literatura piękna",
  "Literatura podróżnicza",
  "Manga",
  "Matematyka",
  "Medycyna",
  "Mitologia",
  "Motoryzacja",
  "Nauki przyrodnicze",
  "Nauki społeczne",
  "Opowiadania",
  "Pamiętniki",
  "Poezja",
  "Poradniki",
  "Poradniki rodzicielskie",
  "Powieść historyczna",
  "Powieść przygodowa",
  "Religia",
  "Reportaż",
  "Romans",
  "Rozwój osobisty",
  "Satyra",
  "Science Finction",
  "Sensacja",
  "Sport",
  "Technika",
  "Thriller",
  "Tragedia",
  "Utwór dramatyczny",
  "Wierszyki/Piosenki",
  "Zdrowie",
];

const crimeIndex = bookCategoriesNames.findIndex((name) => name === "Kryminał");

const adventureIndex = bookCategoriesNames.findIndex(
  (name) => name === "Powieść przygodowa"
);

const activeCategory = bookCategoriesNames[crimeIndex];
const adventureCategory = bookCategoriesNames[adventureIndex];
const wasPicked = [activeCategory, adventureCategory];

async function seed() {
  const email = "test1@o2.pl";

  // cleanup the existing database
  await prisma.opinion.deleteMany({});
  await prisma.book.deleteMany({});
  await prisma.bookCategory.deleteMany({});
  await prisma.bookGroupsToUsers.deleteMany({});
  await prisma.bookGroup.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedPassword = await bcrypt.hash("testtest", 10);
  const secondEmail = "test2@o2.pl";
  const user = await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  await prisma.user.delete({ where: { email: secondEmail } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const user2 = await prisma.user.create({
    data: {
      email: secondEmail,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  const bookGroup = await prisma.bookGroup.create({
    data: {
      slug: "dzusio-adkowa-grupa",
      creatorId: user.id,
      name: "DżusioAdkowaGrupa",
      users: { create: [{ userId: user.id }, { userId: user2.id }] },
    },
  });

  await prisma.bookGroup.create({
    data: {
      slug: "adkowo-dzusiowa-grupa",
      creatorId: user2.id,
      name: "AdkowoDzusiowaGrupa",
      users: { create: [{ userId: user2.id }, { userId: user.id }] },
    },
  });

  const bookCategories = await Promise.all(
    bookCategoriesNames.map((bookCategory) =>
      prisma.bookCategory.create({
        data: {
          slug: bookCategory
            .split(" ")
            .map((word) => word.toLowerCase())
            .join("-"),
          bookGroupId: bookGroup.slug,
          name: bookCategory,
          isActive: activeCategory === bookCategory,
          wasPicked: wasPicked.some((name) => name === bookCategory),
        },
      })
    )
  );

  const books = await Promise.all(
    [bookCategories[crimeIndex], bookCategories[adventureIndex]].map(
      (bookCategory, index) =>
        prisma.book.create({
          data: {
            slug: `random-book-${index}`,
            categoryId: bookCategory.slug,
            title: "RandomBook",
            author: "Random",
            dateStart: new Date(),
            dateEnd: new Date(new Date() + 14),
          },
        })
    )
  );

  const rates = [1, 4, 7, 10];
  let it = 0;

  await Promise.all(
    books.map((book) =>
      [user, user2].map((userIt) =>
        prisma.opinion.create({
          data: {
            userId: userIt.id,
            bookId: book.slug,
            description: "Random",
            rate: rates[it++],
          },
        })
      )
    )
  );

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
