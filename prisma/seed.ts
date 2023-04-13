import type * as P from '@prisma/client'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { faker } from '@faker-js/faker'
import {
  createBooking,
  createBrand,
  createContactInfo,
  createPassword,
  createShip,
  createShipModel,
  createStarport,
  createUser,
  downloadFile,
  insertImage,
  lockifyFakerImage,
  oneDay,
} from './seed-utils'
import allTheCities from 'all-the-cities'
import { typedBoolean } from '~/utils/misc'

const prisma = new PrismaClient()

async function seed() {
  console.log('🌱 Seeding...')
  console.time(`🌱 Database has been seeded`)

  console.time('🧹 Cleaned up the database...')
  await prisma.user.deleteMany({ where: {} })
  console.timeEnd('🧹 Cleaned up the database...')

  // hosts with ships and reviews
  // renters with bookings and reviews
  // hosts who are renters also
  const totalUsers = 40
  console.time(`👤 Created ${totalUsers} users...`)
  const users = await Promise.all(
    Array.from({ length: totalUsers }, async () => {
      const gender = faker.helpers.arrayElement(['female', 'male']) as
        | 'female'
        | 'male'
      const userData = createUser({ gender })
      const imageGender = gender === 'female' ? 'women' : 'men'
      const imageNumber = faker.datatype.number({ min: 0, max: 99 })
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: {
            create: createPassword(userData.username),
          },
          image: {
            create: {
              contentType: 'image/jpeg',
              file: {
                create: {
                  blob: await downloadFile(
                    `https://randomuser.me/api/portraits/${imageGender}/${imageNumber}.jpg`,
                  ),
                },
              },
            },
          },
        },
      })
      return user
    }),
  )
  console.timeEnd(`👤 Created ${totalUsers} users...`)

  const totalAdmins = Math.floor(totalUsers * 0.1)

  console.time(`👮 Created ${totalAdmins} admins...`)
  const adminIds = users.slice(0, totalAdmins).map(user => user.id)
  const admins = await Promise.all(
    adminIds.map(async id => {
      const admin = await prisma.admin.create({
        data: {
          userId: id,
        },
      })
      return admin
    }),
  )
  console.timeEnd(`👮 Created ${totalAdmins} admins...`)

  const kodyUser = createUser()

  await prisma.user.create({
    data: {
      email: 'kody@kcd.dev',
      username: 'kody',
      name: 'Kody',
      image: {
        create: {
          contentType: 'image/png',
          file: {
            create: {
              blob: await downloadFile(
                `https://res.cloudinary.com/kentcdodds-com/image/upload/kentcdodds.com/misc/kody.png`,
              ),
            },
          },
        },
      },
      password: {
        create: {
          hash: await bcrypt.hash('kodylovesyou', 10),
        },
      },
      admin: {
        create: {},
      },
    },
  })

  console.timeEnd(`🌱 Database has been seeded`)
}

seed()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

/*
eslint
	@typescript-eslint/no-unused-vars: "off",
*/
