import { useUser, useOptionalAdminUser } from "~/utils/misc";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAdminUser } from "~/utils/session.server";
import styles from "../../styles/css/6_routes/userPage.css";
import { classNames } from "~/utils/classNames";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { Outlet } from "react-router";

export const links = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdminUser(request);
  return json({});
};

const AdminPage = () => {
  const user = useUser();
  const isAdmin = useOptionalAdminUser();

  return (
    <header className="userPage__header">
      <h1 className={classNames("userPage__role", "userPage__role--user")}>
        User
      </h1>
      {isAdmin && <div>Admin</div>}
      <div>
        <p>{user.email}</p>
        <p>{user.name}</p>
      </div>
      <Outlet />
    </header>
  );
};

export default AdminPage;

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: ({ params }) => (
          <p>No user with the username "{params.username}" exists</p>
        ),
        505: ({ params }) => <div>sss {params.status}</div>,
      }}
    />
  );
}
