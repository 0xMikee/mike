import {
  json,
  DataFunctionArgs,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { prisma } from "~/utils/db.server";
import { getUserImgSrc } from "~/utils/misc";
import styles from "~/styles/css/6_routes/userPage.css";

export const links = () => {
    return [{rel: "stylesheet", href: styles}]
}

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
    <div className="userPage">
      <img
        className="userPage__photo"
        alt={data.user.name ?? data.user.username}
        src={getUserImgSrc(data.user.imageId)}
      />
      <h1 className="userPage__name">{data.user.name ?? data.user.username}</h1>
      <p className="userPage__joinDate">Joined {data.userJoinedDisplay}</p>
      <Link
        to="/settings/profile"
        className="userPage__editLink"
      >
        ✏️ Edit profile
      </Link>
    </div>
  );
}
