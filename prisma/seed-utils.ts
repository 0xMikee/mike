import type * as P from "@prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";

export async function downloadFile(
  url: string,
  retries: number = 0,
): Promise<Buffer> {
  const MAX_RETRIES = 3
  try {
    const response = await fetch(url)
    if (!response.ok) {
      new Error(`Failed to fetch image with status ${response.status}`)
    }
		return Buffer.from(await response.arrayBuffer())
  } catch (e) {
    if (retries > MAX_RETRIES) throw e
    return downloadFile(url, retries + 1)
  }
}

export function createUser({
	gender = faker.helpers.arrayElement(['female', 'male']) as 'female' | 'male',
}: {
	gender?: 'male' | 'female'
} = {}): Omit<P.User, 'id' | 'createdAt' | 'updatedAt' | 'imageId'> {
	const firstName = faker.name.firstName(gender)
	const lastName = faker.name.lastName()

	const username = faker.helpers.unique(faker.internet.userName, [
		firstName.toLowerCase(),
		lastName.toLowerCase(),
	])
	return {
		username,
		name: `${firstName} ${lastName}`,
		email: `${username}@mike.com`,
	}
}

export function createPassword(username: string = faker.internet.userName()) {
	return {
		hash: bcrypt.hashSync(username.toUpperCase(), 10),
	}
}


