import {
  json,
  redirect,
  DataFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { prisma } from "~/utils/db.server";
import { Button } from "~/utils/forms";
import { getUserImgSrc, useOptionalUser } from "~/utils/misc";

export async function loader({ params }: DataFunctionArgs) {
  invariant(params.username, "Missing username");
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: {
      id: true,
      username: true,
      name: true,
      imageId: true,
      createdAt: true,
    },
  });
  if (!user) {
    throw new Response("not found", { status: 404 });
  }
  return json({ user, userJoinedDisplay: user.createdAt.toLocaleDateString() });
}

export default function UsernameIndex() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto flex flex-col items-center justify-center">
      <img
        className="h-52 w-52 rounded-full object-cover"
        alt={data.user.name ?? data.user.username}
        src={getUserImgSrc(data.user.imageId)}
      />
      <h1 className="text-h2">{data.user.name ?? data.user.username}</h1>
      <p className="text-night-200">Joined {data.userJoinedDisplay}</p>
      <Link
        to="/settings/profile"
        className="rounded-full border border-night-400 py-5 px-10"
      >
        ✏️ Create your profile
      </Link>
      <Form action={"/logout"} method="POST">
        <Button type="submit">Logout</Button>
      </Form>
    </div>
  );
}
