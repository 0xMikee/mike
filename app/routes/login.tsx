import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import type { V2_MetaFunction } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import * as React from "react";
import loginStyles from "../styles/css/6_routes/login.css";

import { createUserSession, getUserId } from "~/utils/session.server";
import { verifyLogin } from "~/utils/auth.server";
import { safeRedirect } from "~/utils/misc";
import { useRef } from "react";

export const links = () => {
  return [{ rel: "stylesheet", href: loginStyles }];
};

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
}

interface ActionData {
  errors: {
    username?: string | null;
    password?: string | null;
  };
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");
  const remember = formData.get("remember");

  if (typeof username !== "string" || username.length === 0) {
    return json<ActionData>(
        { errors: { username: "Username is required", password: null } },
        { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return json<ActionData>(
      { errors: { username: null, password: "Password is required" } },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return json(
      { errors: { username: null, password: "Password is too short" } },
      { status: 400 }
    );
  }

  const user = await verifyLogin(username, password);

  if (!user) {
    return json(
      { errors: { username: "Invalid username or password", password: null } },
      { status: 400 }
    );
  }

  return createUserSession({
    request,
    userId: user.id,
    remember: remember === "on",
    redirectTo,
  });
}

export const meta: V2_MetaFunction = () => {
  return [{ title: "Login | MikeApp" }]
};

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const actionData = useActionData<typeof action>();
  const userNameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.username) {
      userNameRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="login">
      <Form method="post" className="login__form">
        <div className="login__email">
          <input
            id="username"
            ref={userNameRef}
            placeholder="username"
            required
            autoFocus={true}
            name="username"
            type="username"
            autoComplete="username"
            aria-invalid={actionData?.errors?.username ? true : undefined}
            aria-describedby="userName-error"
            className="login__input"
          />
          {actionData?.errors?.username && (
            <div className="login__errorLabel" id="userName-error">
              {actionData.errors.username}
            </div>
          )}
        </div>

        <div className="login__password">
          <input
            id="password"
            ref={passwordRef}
            placeholder="password"
            name="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={actionData?.errors?.password ? true : undefined}
            aria-describedby="password-error"
            className="login__input"
          />
          {actionData?.errors?.password && (
            <div className="">{actionData.errors.password}</div>
          )}
        </div>
        <div className="login__buttons">
        <button type="submit" className="login__button">
          Log in
        </button>
        <Link
            className="login__button"
            to={{
              pathname: "/signup",
              search: searchParams.toString(),
            }}
        >
          Sign up
        </Link>
        </div>
        <div className="">
          <div className="">
            <input id="remember" name="remember" type="checkbox" className="" />
            <label htmlFor="remember" className="">
              Remember me
            </label>
          </div>
          <div className="">
            Don't have an account?{" "}

          </div>
        </div>
      </Form>
    </div>
  );
}
//