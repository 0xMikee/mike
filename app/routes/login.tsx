import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import * as React from "react";
import loginStyles from "../styles/css/6_routes/login.css";

import { createUserSession, getUserId } from "~/utils/session.server";
import { verifyLogin } from "~/utils/auth.server";
import { safeRedirect, validateEmail } from "~/utils/misc";
import { useRef } from "react";

export const links = () => {
  return [{ rel: "stylesheet", href: loginStyles }];
};

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");
  const remember = formData.get("remember");

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email is invalid", password: null } },
      { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      { errors: { email: null, password: "Password is required" } },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return json(
      { errors: { email: null, password: "Password is too short" } },
      { status: 400 }
    );
  }

  const user = await verifyLogin(email, password);

  if (!user) {
    return json(
      { errors: { email: "Invalid email or password", password: null } },
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

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  const actionData = useActionData<typeof action>();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="content">
      <div className="login">
        <Form method="post" className="login__form">
          <div className="login__email">
            <label htmlFor="email" className="login__label">
              Email
            </label>

            <input
              ref={emailRef}
              id="email"
              required
              autoFocus={true}
              name="email"
              type="email"
              autoComplete="email"
              aria-invalid={actionData?.errors?.email ? true : undefined}
              aria-describedby="email-error"
              className="login__input"
            />
            {actionData?.errors?.email && (
              <div className="login__errorLabel" id="email-error">
                {actionData.errors.email}
              </div>
            )}
          </div>

          <div className="login__password">
            <label htmlFor="password" className="login__label">
              Password
            </label>
            <input
              id="password"
              ref={passwordRef}
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
          <button type="submit" className="login__button">
            Log in
          </button>
          <div className="">
            <div className="">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className=""
              />
              <label htmlFor="remember" className="">
                Remember me
              </label>
            </div>
            <div className="">
              Don't have an account?{" "}
              <Link
                className=""
                to={{
                  pathname: "/signup",
                  search: searchParams.toString(),
                }}
              >
                Sign up
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
