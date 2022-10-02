import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const users = [
    { name: "matt", email: "mseccafien@gmail.com", password: "password" },
    { name: "tyler", email: "tyleradamsmith@gmail.com", password: "password" },
  ];

  users.forEach(async (user) => {
    // cleanup the existing database
    await prisma.user.delete({ where: { email: user.email } }).catch(() => {
      // no worries if it doesn't exist yet
    });

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const createdUser = await prisma.user.create({
      data: {
        email: user.email,
        password: {
          create: {
            hash: hashedPassword,
          },
        },
      },
    });

    await prisma.note.create({
      data: {
        title: "My first note",
        body: "Hello, world!",
        userId: createdUser.id,
      },
    });

    await prisma.note.create({
      data: {
        title: "My second note",
        body: "Hello, world!",
        userId: createdUser.id,
      },
    });
  });
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
