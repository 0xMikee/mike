import {
  json,
  redirect,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import type { DataFunctionArgs } from "@remix-run/node";
import {
  Form,
  Link,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
import { useState } from "react";
import { z } from "zod";
import * as deleteImageRoute from "~/routes/resources/delete-image";
import { authenticator } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import {
  Button,
  getFieldsFromSchema,
  LabelButton,
  preprocessFormData,
  useForm,
} from "~/utils/forms";
import { getUserImgSrc } from "~/utils/misc";
import { getUserId } from "~/utils/session.server";

const MAX_SIZE = 1024 * 1024 * 3; // 3MB

const PhotoFormSchema = z.object({
  photoFile: z.instanceof(File),
});

export async function loader({ request }: DataFunctionArgs) {
  const userId = await getUserId(request);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { imageId: true, name: true, username: true },
  });
  if (!user) {
    throw await authenticator.logout(request, { redirectTo: "/" });
  }
  return json({ user, fieldMetadatas: getFieldsFromSchema(PhotoFormSchema) });
}

export async function action({ request }: DataFunctionArgs) {
  const userId = await getUserId(request);
  const contentLength = Number(request.headers.get("Content-Length"));
  if (
      contentLength &&
      Number.isFinite(contentLength) &&
      contentLength > MAX_SIZE
  ) {
    return json(
        {
          status: "error",
          errors: {
            formErrors: [],
            fieldErrors: { photoFile: ["File too large"] },
          },
        } as const,
        { status: 400 }
    );
  }
  const formData = await unstable_parseMultipartFormData(
      request,
      unstable_createMemoryUploadHandler({ maxPartSize: MAX_SIZE })
  );
  const result = PhotoFormSchema.safeParse(
      preprocessFormData(formData, PhotoFormSchema)
  );

  if (!result.success) {
    return json({ status: "error", errors: result.error.flatten() } as const, {
      status: 400,
    });
  }

  const { photoFile } = result.data;

  const newPrismaPhoto = {
    contentType: photoFile.type,
    file: {
      create: {
        blob: Buffer.from(await photoFile.arrayBuffer()),
      },
    },
  };

  const previousUserPhoto = await prisma.user.findUnique({
    where: { id: userId },
    select: { imageId: true },
  });

  await prisma.user.update({
    select: { id: true },
    where: { id: userId },
    data: {
      image: {
        upsert: {
          update: newPrismaPhoto,
          create: newPrismaPhoto,
        },
      },
    },
  });

  if (previousUserPhoto?.imageId) {
    void prisma.image
        .delete({
          where: { fileId: previousUserPhoto.imageId },
        })
        .catch(() => {
        });

    return redirect("/settings/profile");
  }
}

export default function PhotoChooserModal() {
  const data = useLoaderData<typeof loader>();
  const [newImageSrc, setNewImageSrc] = useState<string | null>(null);
  const deleteImageFetcher = useFetcher<typeof deleteImageRoute.action>();
  const { form, fields } = useForm({
    fieldMetadatas: data.fieldMetadatas,
    name: "profile-photo",
  });

  const deleteProfilePhotoFormId = "delete-profile-photo";

  return (
    <div className="profilePage">
      <div className="content">
            <h2 className="text-h2">Profile photo</h2>
          <Form
            method="POST"
            encType="multipart/form-data"
            className="mt-8 flex flex-col items-center justify-center gap-10"
            onReset={() => setNewImageSrc(null)}
          >
            <img
              src={newImageSrc ?? getUserImgSrc(data.user.imageId)}
              className="navbar__photo"
              alt={data.user.name ?? data.user.username}
            />
            {fields.photoFile.errorUI}
            <input
              {...fields.photoFile.props}
              type="file"
              accept="image/*"
              className="sr-only"
              tabIndex={newImageSrc ? -1 : 0}
              onChange={(e) => {
                const file = e.currentTarget.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setNewImageSrc(event.target?.result?.toString() ?? null);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            {newImageSrc ? (
              <div className="flex gap-4">
                <Button type="submit">Save Photo</Button>
                <Button type="reset">Reset</Button>
              </div>
            ) : (
              <div className="flex gap-4">
                <LabelButton {...fields.photoFile.labelProps}>
                  ✏️ Change
                </LabelButton>
                {data.user.imageId ? (
                  <Button type="submit" form={deleteProfilePhotoFormId}>
                    🗑 Delete
                  </Button>
                ) : null}
              </div>
            )}
            {form.errorUI}
          </Form>
            <Link
              to="/settings/profile"
              aria-label="Close"
              className="absolute right-10 top-10"
            >
              ❌
            </Link>
      </div>
      <deleteImageFetcher.Form
        method="POST"
        id={deleteProfilePhotoFormId}
        action={deleteImageRoute.ROUTE_PATH}
      >
        <input name="imageId" type="hidden" value={data.user.imageId ?? ""} />
      </deleteImageFetcher.Form>
    </div>
  );
}
