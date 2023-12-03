import fs from "node:fs";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import dayjs from "dayjs";

const prisma = new PrismaClient();

async function img({
  altText,
  filepath,
}: {
  altText: string;
  filepath: string;
}) {
  return {
    altText,
    contentType: filepath.endsWith(".png") ? "image/png" : "image/jpeg",
    blob: await fs.promises.readFile(filepath),
  };
}

const bookCategoriesNames = [
  { name: "Astronomia", image: "Astronomia.jpg" },
  { name: "Bajka", image: "Bajka.jpg" },
  { name: "Baśnie", image: "Baśnie.jpg" },
  { name: "Biografia", image: "Biografia.jpg" },
  { name: "Biznes/Finanse", image: "Biznes-Finanse.jpg" },
  { name: "Dramat", image: "Dramat.jpg" },
  { name: "Erotyka", image: "Erotyka.jpg" },
  { name: "Eseje", image: "Eseje.jpg" },
  { name: "Etyka", image: "Etyka.jpg" },
  { name: "Fantasy", image: "Fantasy.jpg" },
  { name: "Filozofia", image: "Filozofia.jpg" },
  { name: "Flora i fauna", image: "Flora i fauna.jpg" },
  { name: "Historia", image: "Historia.jpg" },
  { name: "Historie biblijne", image: "Historie biblijne.jpg" },
  { name: "Horror", image: "Horror.jpg" },
  { name: "Informatyka", image: "Informatyka.jpg" },
  { name: "Klasyka", image: "Klasyka.jpg" },
  { name: "Komedia", image: "Komedia.jpg" },
  { name: "Komiksy", image: "Komiksy.jpg" },
  { name: "Kryminał", image: "Kryminal.jpg" },
  { name: "Legendy", image: "Legendy.jpg" },
  { name: "Literatura popularno-naukowa", image: "LiteraruraPopNauka.jpg" },
  { name: "Językoznawstwo", image: "LiteraturaJezykoznawstwo.jpg" },
  { name: "Literatura młodzieżowa", image: "LiteraturaMlodziezowa.jpg" },
  { name: "Literatura obyczajowa", image: "LiteraturaObyczajowa.jpg" },
  { name: "Literatura piękna", image: "LiteraturaPiekna.jpg" },
  { name: "Literatura podróżnicza", image: "LiteraturaPodroznicza.jpg" },
  { name: "Manga", image: "Manga.jpg" },
  { name: "Matematyka", image: "Matematyka.jpg" },
  { name: "Medycyna", image: "Medycyna.jpg" },
  { name: "Mitologia", image: "Mitologia.jpg" },
  { name: "Motoryzacja", image: "Motoryzacja.jpg" },
  { name: "Nauki przyrodnicze", image: "NaukiPrzyrodnicze.jpg" },
  { name: "Nauki społeczne", image: "NaukiSpoleczne.jpg" },
  { name: "Opowiadania", image: "Opowiadania.jpg" },
  { name: "Pamiętniki", image: "Pamietnik.jpg" },
  { name: "Poezja", image: "Poezja.jpg" },
  { name: "Poradniki", image: "Poradniki.jpg" },
  { name: "Poradniki rodzicielskie", image: "PoradnikRodzic.jpg" },
  { name: "Powieść historyczna", image: "Powiesc historyczna.jpg" },
  { name: "Powieść przygodowa", image: "PowiescPrzygodowa.jpg" },
  { name: "Religia", image: "Religia.jpg" },
  { name: "Reportaż", image: "Reportaz.jpg" },
  { name: "Romans", image: "Romans.jpg" },
  { name: "Rozwój osobisty", image: "RozwojOsobisty.jpg" },
  { name: "Satyra", image: "Satyra.jpg" },
  { name: "Science Finction", image: "ScienceFiction.jpg" },
  { name: "Sensacja", image: "Sensacja.jpg" },
  { name: "Sport", image: "Sport.jpg" },
  { name: "Technika", image: "Technika.jpg" },
  { name: "Thriller", image: "Thriller.jpg" },
  { name: "Tragedia", image: "Tragedia.jpg" },
  { name: "Utwór dramatyczny", image: "UtworDramaryczny.jpg" },
  { name: "Wierszyki/Piosenki", image: "WierszykiPiosenki.jpg" },
  { name: "Zdrowie", image: "Zdrowie.jpg" },
];

const crimeIndex = bookCategoriesNames.findIndex(
  ({ name }) => name === "Kryminał"
);

const adventureIndex = bookCategoriesNames.findIndex(
  ({ name }) => name === "Powieść przygodowa"
);

const activeCategory = bookCategoriesNames[crimeIndex];
const adventureCategory = bookCategoriesNames[adventureIndex];
const wasPicked = [activeCategory, adventureCategory];

async function seed() {
  const email = "test1@o2.pl";

  // console.log(base64_encode("../public/assets/AstronomiaAstrofizyka.jpg"));

  // cleanup the existing database
  await prisma.opinion.deleteMany({});
  await prisma.book.deleteMany({});
  await prisma.bookCategory.deleteMany({});
  await prisma.bookGroupsToUsers.deleteMany({});
  await prisma.bookGroup.deleteMany({});
  await prisma.image.deleteMany({});
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
      id: "dzusio-adkowa-grupa",
      creatorId: user.id,
      name: "DżusioAdkowaGrupa",
      users: { create: [{ userId: user.id }, { userId: user2.id }] },
    },
  });

  await prisma.bookGroup.create({
    data: {
      id: "adkowo-dzusiowa-grupa",
      creatorId: user2.id,
      name: "AdkowoDzusiowaGrupa",
      users: { create: [{ userId: user2.id }, { userId: user.id }] },
    },
  });

  const imagesData = await Promise.all(
    bookCategoriesNames.map(({ name, image }) =>
      img({ filepath: `./public/assets/${image}`, altText: name })
    )
  );

  const images = await Promise.all(
    imagesData.map((image) =>
      prisma.image.create({
        data: image,
      })
    )
  );

  // const images = await prisma.image.findMany({});
  // console.log(images);

  const bookCategories = await Promise.all(
    bookCategoriesNames.map(({ name, image }, index) =>
      prisma.bookCategory.create({
        data: {
          bookGroup: { connect: { id: bookGroup.id } },
          name,
          isActive: activeCategory.name === name,
          wasPicked: wasPicked.some((pickedName) => pickedName.name === name),
          image: { connect: { id: images[index].id } },
        },
      })
    )
  );

  // console.log(bookCategories);

  const books = await Promise.all(
    [bookCategories[crimeIndex], bookCategories[adventureIndex]].map(
      (bookCategory, index) =>
        prisma.book.create({
          data: {
            id: `random-book-${index}`,
            categoryId: bookCategory.id,
            title: "RandomBook",
            author: "Random",
            dateStart: new Date(),
            dateEnd: dayjs().add(14, "day").toDate(),
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
            bookId: book.id,
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
