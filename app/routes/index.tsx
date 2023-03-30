import {Link, Form} from "@remix-run/react";

import {useOptionalUser} from "~/utils";
import type { LoaderFunction} from "@remix-run/node";
import {json} from "@remix-run/node";
import {requireUser} from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
    await requireUser(request)
    return json({});
};

export default function Index() {
    const user = useOptionalUser();
    return (
        <div className="content">
            <div>{user?.email}</div>
            <div>{user?.id}</div>
        </div>
    );
}
