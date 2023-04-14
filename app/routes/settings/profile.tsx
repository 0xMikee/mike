import { json, DataFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { authenticator } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { getUserImgSrc } from "~/utils/misc";
import { getUserId } from "~/utils/session.server";

export async function loader({ request }: DataFunctionArgs) {
  const userId = await getUserId(request);
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
  if (!user) {
    throw await authenticator.logout(request, { redirectTo: "/" });
  }
  return json({ user });
}

export default function Profile() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="">
      <div className="flex gap-3">
        <Link className="text-night-300" to={`/users/${data.user.username}`}>
          Profile
        </Link>
        <span className="text-night-300">▶️</span>
        <span>Edit Profile</span>
      </div>
      <div className="mt-16 flex flex-col gap-12">
        <div className="flex justify-center">
          <div className="relative h-52 w-52">
            <img
              src={getUserImgSrc(data.user.imageId)}
              alt={data.user.username}
              className="navbar__photo"
            />
            <Link
              to="photo"
              className="absolute top-3 -right-3 flex h-4 w-4 items-center justify-center rounded-full border-4 border-night-700 bg-night-500 p-5"
            >
              📷
            </Link>
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
