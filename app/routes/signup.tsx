import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import * as React from "react";
import loginStyles from "~/styles/css/6_routes/login.css";
import { createUser, getUserByEmail} from "~/utils/auth.server";
import { getUserId, createUserSession } from "~/utils/session.server";
import { safeRedirect, validateEmail } from "~/utils/misc";
import { useEffect, useRef } from "react";

export const links = () => {
  return [{ rel: "stylesheet", href: loginStyles }];
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

interface ActionData {
  errors: {
    userName?: string;
    name?: string;
    email?: string;
    password?: string;
  };
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const username = formData.get("username");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");

  if (!validateEmail(email)) {
    return json<ActionData>(
      { errors: { email: "Email is invalid" } },
      { status: 400 }
    );
  }

  if (typeof password !== "string") {
    return json<ActionData>(
      { errors: { password: "Password is required" } },
      { status: 400 }
    );
  }

  if (typeof name !== "string") {
    return json<ActionData>(
      { errors: { name: "Name is required" } },
      { status: 400 }
    );
  }

  if (typeof username !== "string") {
    return json<ActionData>(
      { errors: { userName: "Name is required" } },
      { status: 400 }
    );
  }

  if (password.length < 4) {
    return json<ActionData>(
      { errors: { password: "Password is too short" } },
      { status: 400 }
    );
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return json<ActionData>(
      { errors: { email: "A user already exists with this email" } },
      { status: 400 }
    );
  }

  const user = await createUser({ name, username, email, password });

  return createUserSession({
    request,
    userId: user.id,
    remember: false,
    redirectTo,
  });
};

export const meta: MetaFunction = () => {
  return {
    title: "Sign Up",
  };
};

export default function Signup() {
  const [searchParams] = useSearchParams();
  const actionData = useActionData() as ActionData;
  const nameRef = useRef<HTMLInputElement>(null);
  const userNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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
          <div className="login__name">
            <label htmlFor="username" className="login__label">
              UserName
            </label>
            <input
              ref={userNameRef}
              id="username"
              required
              autoFocus={true}
              name="username"
              type="username"
              aria-describedby="name-error"
              className="login__input"
            />
            {actionData?.errors?.userName && (
              <div id="email-error" className="login__errorLabel">
                {actionData.errors.userName}
              </div>
            )}
          </div>

          <div className="login__name">
            <label htmlFor="name" className="login__label">
              Name
            </label>
            <input
              ref={nameRef}
              id="name"
              required
              name="name"
              type="name"
              autoComplete="name"
              aria-describedby="name-error"
              className="login__input"
            />
            {actionData?.errors?.name && (
              <div id="email-error" className="login__errorLabel">
                {actionData.errors.name}
              </div>
            )}
          </div>

          <div className="login__email">
            <label htmlFor="email" className="login__label">
              Email
            </label>
            <input
              ref={emailRef}
              id="email"
              required
              name="email"
              type="email"
              autoComplete="email"
              aria-invalid={actionData?.errors?.email ? true : undefined}
              aria-describedby="email-error"
              className="login__input"
            />
            {actionData?.errors?.email && (
              <div id="email-error" className="login__errorLabel">
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
              autoComplete="new-password"
              aria-invalid={actionData?.errors?.password ? true : undefined}
              aria-describedby="password-error"
              className="login__input"
            />
            {actionData?.errors?.password && (
              <div className="pt-1 text-red-700" id="password-error">
                {actionData.errors.password}
              </div>
            )}
          </div>

          <button type="submit" className="login__button">
            Create Account
          </button>
          <div className="flex items-center justify-center">
            <div className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                className="text-blue-500 underline"
                to={{
                  pathname: "/login",
                  search: searchParams.toString(),
                }}
              >
                Log in
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
