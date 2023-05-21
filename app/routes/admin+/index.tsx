import { getUserImgSrc, useOptionalUser, useUser } from "~/utils/misc";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAdminUser } from "~/utils/session.server";
import styles from "../../styles/css/6_routes/userPage.css";
import { Outlet } from "react-router";
import { prisma } from "~/utils/db.server";
import { Link, useLoaderData } from "@remix-run/react";

export const links = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdminUser(request);
  const users = await prisma.user.findMany();
  return json({ users });
};

const AdminPage = () => {
  const data = useLoaderData<typeof loader>();
  const user = useUser().id

  return (
    <>
      <header className="userPage__header">
        <h2>All users:</h2>
      </header>
      <div className="userPage__userList">
        {data.users.map(({ name, imageId, username, id }: any) => {
          return (
            <Link
              to={`/users/${username}`}
              key={id}
              className="userPage__userListLink"
            >
              <img
                src={getUserImgSrc(imageId)}
                alt={username}
                className="userPage__listPhoto"
              />
              <pre className={id == user ? "userPage__userListName userPage__userListName--activeUser" : "userPage__userListName"}>{name}</pre>
            </Link>
          );
        })}
      </div>
      <Outlet />
    </>
  );
};

export default AdminPage;
