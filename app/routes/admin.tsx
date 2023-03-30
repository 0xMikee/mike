import {useUser, useOptionalAdminUser} from "~/utils";
import type { LoaderFunction} from "@remix-run/node";
import {json} from "@remix-run/node";
import {requireAdminUser} from "~/session.server";
import styles from "../styles/css/userPage.css"

export const links = () => {
    return [{rel: "stylesheet", href: styles}]
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdminUser(request)
  return json({});
};

const UserPage = () => {
  const user = useUser();
  const isAdmin = useOptionalAdminUser();

  return (
    <div className="content">
      <header className="userPage__header">
        <h1>User</h1>
        {isAdmin && <div>Admin</div>}
        <div>
          <p>{user.email}</p>
          <p>{user.name}</p>
        </div>
      </header>
    </div>
  );
}

export default UserPage;