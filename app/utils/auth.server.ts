import type { Password, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import invariant from "tiny-invariant";
import { prisma } from "~/utils/db.server";
import { sessionStorage } from "./session.server";
import { typedBoolean } from "~/utils/misc";

export type { User };

export const authenticator = new Authenticator<string>(sessionStorage, {
  sessionKey: "token",
});

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const username = form.get("username");
    const password = form.get("password");

    invariant(typeof username === "string", "username must be a string");
    invariant(username.length > 0, "username must not be empty");

    invariant(typeof password === "string", "password must be a string");
    invariant(password.length > 0, "password must not be empty");

    const user = await verifyLogin(username, password);
    if (!user) {
      throw new Error("Invalid username or password");
    }

    return user.id;
  }),
  FormStrategy.name
);

export async function requireUserId(
  request: Request,
  { redirectTo }: { redirectTo?: string | null } = {}
) {
  const requestUrl = new URL(request.url);
  redirectTo =
    redirectTo === null
      ? null
      : redirectTo ?? `${requestUrl.pathname}${requestUrl.search}`;
  const loginParams = redirectTo
    ? new URLSearchParams([["redirectTo", redirectTo]])
    : null;
  const failureRedirect = ["/login", loginParams?.toString()]
    .filter(typedBoolean)
    .join("?");
  return await authenticator.isAuthenticated(request, {
    failureRedirect,
  });
}

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function getUserByUserName(username: User["username"]) {
  return prisma.user.findUnique({ where: { username } });
}

export async function getUserId(request: Request) {
  return authenticator.isAuthenticated(request);
}

export async function createUser({
  email,
  username,
  password,
  name,
}: {
  email: User["email"];
  username: User["username"];
  name: User["name"];
  password: string;
}) {
  const hashedPassword = await getPasswordHash(password);

  return prisma.user.create({
    data: {
      email,
      username,
      name,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
}

export async function getPasswordHash(password: string) {
  const hash = await bcrypt.hash(password, 10);
  return hash;
}

export async function verifyLogin(
  username: User["username"],
  password: Password["hash"]
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { username },
    select: { id: true, password: { select: { hash: true } } },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

  if (!isValid) {
    return null;
  }

  return { id: userWithPassword.id };
}
