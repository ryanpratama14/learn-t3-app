import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { THROW_OK } from "@/trpc/shared";

const f = createUploadthing();

export const ourFileRouter = {
  uploadUserImage: f({ image: { maxFileSize: "1MB" } })
    .middleware(async () => {
      const session = await getServerAuthSession();
      if (!session) throw new Error("UNAUTHORIZED");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const image = await db.document.create({ data: { url: file.url, name: file.name, ownerId: metadata.userId } });
      await db.user.update({ where: { id: metadata.userId }, data: { imageId: image.id } });
      return THROW_OK("CREATED");
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;