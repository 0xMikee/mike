import { json, redirect } from "@remix-run/node";
import type { DataFunctionArgs } from "@remix-run/node";
import {
  Form,
  Link,
  Outlet,
  useActionData,
  useFormAction,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { prisma } from "~/utils/db.server";
import { getUserImgSrc } from "~/utils/misc";
import styles from "~/styles/css/6_routes/profilePage.css";
import {
  Button,
  Field,
  getFieldsFromSchema,
  preprocessFormData,
  useForm,
} from "~/utils/forms";
import {
  authenticator,
  getPasswordHash,
  requireUserId,
  verifyLogin,
} from "~/utils/auth.server";
import { z } from "zod";
import {
  emailSchema,
  nameSchema,
  passwordSchema,
  usernameSchema,
} from "~/utils/user-validation";
import { getUserId } from "~/utils/session.server";

const ProfileFormSchema = z
  .object({
    name: nameSchema.optional(),
    username: usernameSchema,
    email: emailSchema.optional(),
    currentPassword: z
      .union([passwordSchema, z.string().min(0).max(0)])
      .optional(),
    newPassword: z.union([passwordSchema, z.string().min(0).max(0)]).optional(),
  })
  .superRefine(async ({ username, currentPassword, newPassword }, ctx) => {
    if (newPassword && !currentPassword) {
      ctx.addIssue({
        path: ["newPassword"],
        code: "custom",
        message: "Must provide current password to change password.",
      });
    }
    if (currentPassword && newPassword) {
      const user = await verifyLogin(username, currentPassword);
      if (!user) {
        ctx.addIssue({
          path: ["currentPassword"],
          code: "custom",
          message: "Incorrect password.",
        });
      }
    }
  });

export const links = () => {
  return [{ rel: "stylesheet", href: styles }];
};

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

  return json({ user, fieldMetadatas: getFieldsFromSchema(ProfileFormSchema) });
}

export async function action({ request }: DataFunctionArgs) {
  const userId = await getUserId(request);
  const formData = await request.formData();
  const result = await ProfileFormSchema.safeParseAsync(
    preprocessFormData(formData, ProfileFormSchema)
  );

  if (!result.success) {
    return json({ status: "error", errors: result.error.flatten() } as const, {
      status: 400,
    });
  }

  const { name, username, currentPassword, newPassword } = result.data;

  const updatedUser = await prisma.user.update({
    select: { id: true, username: true },
    where: { id: userId },
    data: {
      name,
      username,
      password: newPassword
        ? {
            update: {
              hash: await getPasswordHash(newPassword),
            },
          }
        : undefined,
    },
  });

  return redirect(`/users/${updatedUser.username}`, { status: 302 });
}

export default function Profile() {
  const data = useLoaderData<typeof loader>();

  const actionData = useActionData<typeof action>();
  const { form, fields } = useForm({
    name: "edit-profile",
    errors: actionData?.status === "error" ? actionData.errors : null,
    fieldMetadatas: data.fieldMetadatas,
  });

  return (
    <div className="profilePage">
      <div className="profilePage__content">
        <img
          src={getUserImgSrc(data.user?.imageId)}
          alt={data.user?.username}
          className="profilePage__image"
        />
        <Link to="photo" className="profilePage__changeImage">
          📷
        </Link>
      </div>
      <Form method="POST" {...form.props} className={"profilePage__settings"}>
        <Field
          className={"profilePage__input"}
          labelProps={{
            ...fields.username.labelProps,
            children: "Username",
          }}
          inputProps={{
            ...fields.username.props,
            defaultValue: data.user?.username,
          }}
          errors={fields.username.errors}
        />
        <Field
          className={"profilePage__input"}
          labelProps={{
            ...fields.name.labelProps,
            children: "Name",
          }}
          inputProps={{
            ...fields.name.props,
            defaultValue: data.user.name ?? "",
          }}
          errors={fields.name.errors}
        />
        <Field
          className={"profilePage__input"}
          labelProps={{
            ...fields.email.labelProps,
            children: "Email",
          }}
          inputProps={{
            ...fields.email.props,
            defaultValue: data.user?.email,
            disabled: true,
          }}
          errors={fields.email.errors}
        />
        <Field
          className={"profilePage__input"}
          labelProps={{
            ...fields.currentPassword.labelProps,
            children: "Current Password",
          }}
          inputProps={{
            ...fields.currentPassword.props,
            type: "password",
            autoComplete: "current-password",
          }}
          errors={fields.currentPassword.errors}
        />
        <Field
          className={"profilePage__input"}
          labelProps={{
            ...fields.newPassword.labelProps,
            children: "New Password",
          }}
          inputProps={{
            ...fields.newPassword.props,
            type: "password",
            autoComplete: "new-password",
          }}
          errors={fields.newPassword.errors}
        />

        <div className="">
          <button type="submit">Save changes</button>
        </div>
      </Form>
      <Outlet />
    </div>
  );
}
