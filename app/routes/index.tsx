import { useOptionalUser } from "~/utils/misc";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUser } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUser(request);
  return json({});
};

export default function Index() {
  const user = useOptionalUser();
  return (
    <div className="index">
      <div>Email: {user?.email}</div>
      <div>Username: {user?.username}</div>
      <div>Name: {user?.name}</div>
      <div>Id: {user?.id}</div>
    </div>
  );
}
