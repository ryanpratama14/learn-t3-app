import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { OK_MESSAGES } from "~/trpc/shared";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "1MB" } })
    .middleware(async () => {
      const session = await getServerAuthSession();
      if (!session) throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      return { uploadedBy: metadata.userId };
    }),

  uploadUserImage: f({ image: { maxFileSize: "1MB" } })
    .middleware(async () => {
      const session = await getServerAuthSession();
      console.log(session);
      if (!session) throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(metadata, file);
      const newData = await db.image.create({ data: { url: file.url } });
      await db.user.update({ where: { id: metadata.userId }, data: { imageId: newData.id } });
      return { message: OK_MESSAGES.OK };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
