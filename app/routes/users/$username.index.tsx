import {
  json,
  DataFunctionArgs,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { prisma } from "~/utils/db.server";
import { getUserImgSrc } from "~/utils/misc";
import { LogoutConfirm } from "~/components/logoutConfirm";

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
    <div className="">
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
      <LogoutConfirm/>
    </div>
  );
}
