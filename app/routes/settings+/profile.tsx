import { json, redirect } from "@remix-run/node";
import type { DataFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { prisma } from "~/utils/db.server";
import { getUserImgSrc } from "~/utils/misc";
import { getUserId } from "~/utils/session.server";
import styles from "~/styles/css/6_routes/profilePage.css";

export const links = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export async function loader({ request }: DataFunctionArgs) {
  const userId = await getUserId(request);

    if (!userId) {
        return redirect("/")
    }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      imageId: true,
    },
  });

  return json({ user });
}

export default function Profile() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="profilePage">
      <header className="profilePage__nav">
        <Link
          className="profilePage__navLink"
          to={`/users/${data.user?.username}`}
        >
          Profile
        </Link>
        <span className="profilePage__navArrow">▶️</span>
        <span>Edit Profile</span>
      </header>
      <div className="profilePage__content">
          <img
            src={getUserImgSrc(data.user?.imageId)}
            alt={data.user?.username}
            className="profilePage__image"
          />
          <Link
            to="photo"
            className="profilePage__changeImage"
          >
            📷
          </Link>
      </div>
      <Outlet />
    </div>
  );
}
