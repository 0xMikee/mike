import type {
  ActionFunction,
  LoaderFunction,
  V2_MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import * as React from "react";
import loginStyles from "~/styles/css/6_routes/login.css";
import {
  createUser,
  getUserByEmail,
  getUserByUserName,
} from "~/utils/auth.server";
import { createUserSession, getUserId } from "~/utils/session.server";
import { safeRedirect, validateEmail } from "~/utils/misc";
import { useEffect, useRef } from "react";

export const links = () => {
  return [{ rel: "stylesheet", href: loginStyles }];
};

export const loader: LoaderFunction = async ({request}) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

interface ActionData {
  errors: {
    username?: string;
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
      { errors: { username: "Username is required" } },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return json<ActionData>(
      { errors: { password: "Password is too short" } },
      { status: 400 }
    );
  }

  const existingUser = await getUserByEmail(email);
  const existingUserName = await getUserByUserName(username);

  if (existingUser) {
    return json<ActionData>(
      { errors: { email: "A user already exists with this email" } },
      { status: 400 }
    );
  } else if (existingUserName) {
    return json<ActionData>(
      { errors: { username: "A user already exists with this username" } },
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

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Sign Up | MikeApp" },
    { name: "viewport", content: "width=device-width,initial-scale=1" },
  ];
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
    } else if (actionData?.errors?.username) {
      passwordRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="login">
      <Form method="post" className="login__form">
        <div className="login__name">
          <input
            id="username"
            ref={userNameRef}
            placeholder="username"
            required
            autoFocus={true}
            name="username"
            type="username"
            aria-describedby="name-error"
            className="login__input"
          />
          {actionData?.errors?.username && (
            <div id="email-error" className="login__errorLabel">
              {actionData.errors.username}
            </div>
          )}
        </div>

        <div className="login__name">
          <input
            id="name"
            ref={nameRef}
            placeholder="name"
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
          <input
            id="email"
            ref={emailRef}
            placeholder="email"
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
          <input
            id="password"
            ref={passwordRef}
            placeholder="password"
            name="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={actionData?.errors?.password ? true : undefined}
            aria-describedby="password-error"
            className="login__input"
          />
          {actionData?.errors?.password && (
            <div className="" id="password-error">
              {actionData.errors.password}
            </div>
          )}
        </div>

        <button type="submit" className="login__button">
          Create Account
        </button>
        <div className="">
          <div className="">
            Already have an account?{" "}
            <Link
              className=""
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
  );
}
//
