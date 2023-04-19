import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";
import { createUser, downloadFile } from "./seed-utils";

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Seeding...");
  console.time(`🌱 Database has been seeded`);

  console.time("🧹 Cleaned up the database...");
  await prisma.user.deleteMany({ where: {} });
  console.log("👤 Cleaned up the users...");
  await prisma.file.deleteMany({ where: {} });
  console.log("📁 Cleaned up the files...");
  await prisma.image.deleteMany({ where: {} });
  console.log("🖼️Cleaned up the images...");
  console.timeEnd("🧹 Cleaned up the database...");

  const totalUsers = 40;
  console.time(`👤 Created ${totalUsers} users...`);
  const users = await Promise.all(
    Array.from({ length: totalUsers }, async () => {
      const gender = faker.helpers.arrayElement(["female", "male"]) as
        | "female"
        | "male";
      const userData = createUser({ gender });
      const imageGender = gender === "female" ? "women" : "men";
      const imageNumber = faker.datatype.number({ min: 0, max: 99 });

      return await prisma.user.create({
        data: {
          ...userData,
          password: {
            create: {
              hash: await bcrypt.hash("mikemike", 10),
            },
          },
          image: {
            create: {
              contentType: "image/jpeg",
              file: {
                create: {
                  blob: await downloadFile(
                      `https://randomuser.me/api/portraits/${imageGender}/${imageNumber}.jpg`
                  ),
                },
              },
            },
          },
        },
      });
    })
  );
  console.timeEnd(`👤 Created ${totalUsers} users...`);

  const totalAdmins = Math.floor(totalUsers * 0.1);

  console.time(`👮 Created ${totalAdmins} admins...`);
  const adminIds = users.slice(0, totalAdmins).map((user) => user.id);
  const admins = await Promise.all(
    adminIds.map(async (id) => {
      const admin = await prisma.admin.create({
        data: {
          userId: id,
        },
      });
      return admin;
    })
  );
  console.timeEnd(`👮 Created ${totalAdmins} admins...`);

  await prisma.user.create({
    data: {
      email: "mike@mikeapp.cz",
      username: "mike",
      name: "Mike",
      image: {
        create: {
          contentType: "image/png",
          file: {
            create: {
              blob: await downloadFile(
                `https://i.imgur.com/XfxNR45.jpg`
              ),
            },
          },
        },
      },
      password: {
        create: {
          hash: await bcrypt.hash("mikemike", 10),
        },
      },
      admin: {
        create: {},
      },
    },
  });

  console.timeEnd(`🌱 Database has been seeded`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
